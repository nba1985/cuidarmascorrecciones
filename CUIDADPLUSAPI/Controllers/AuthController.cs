using CuidarPlusAPI.Data;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly CuidarPlusContext _context;
    private readonly IEmailService _emailService;
    private readonly PasswordHasher<Usuario> _passwordHasher = new();

    public AuthController(CuidarPlusContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Mail == dto.Mail);

        if (usuario is null)
        {
            return Unauthorized("Usuario o contraseña incorrectos.");
        }

        var passwordValida = false;

        if (!string.IsNullOrWhiteSpace(usuario.PasswordHash))
        {
            try
            {
                var resultado = _passwordHasher.VerifyHashedPassword(usuario, usuario.PasswordHash, dto.Password);
                passwordValida = resultado == PasswordVerificationResult.Success
                    || resultado == PasswordVerificationResult.SuccessRehashNeeded;
            }
            catch (FormatException)
            {
                passwordValida = false;
            }

            if (!passwordValida && usuario.PasswordHash == dto.Password)
            {
                passwordValida = true;
                usuario.PasswordHash = _passwordHasher.HashPassword(usuario, dto.Password);
                await _context.SaveChangesAsync();
            }
        }

        if (!passwordValida)
        {
            return Unauthorized("Usuario o contraseña incorrectos.");
        }

        await IniciarSesion(usuario);
        return Ok(new AuthResponseDto
        {
            Mensaje = "Login correcto",
            Usuario = ToDto(usuario)
        });
    }

    [HttpPost("registro")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Registro(RegistroDto dto)
    {
        var existe = await _context.Usuarios.AnyAsync(u => u.Mail == dto.Mail);
        if (existe)
        {
            return Conflict("Ya existe un usuario con ese correo.");
        }

        var usuario = new Usuario
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Mail = dto.Mail,
            Ciudad = dto.Ciudad,
            FechaNacimiento = dto.FechaNacimiento,
            Dni = dto.Dni,
            Foto = dto.Foto,
            PasswordHash = string.Empty,
            FechaAlta = DateTime.Today,
            IdUsuarioTipo = await _context.UsuariosTipos
                .Where(t => t.Nombre == "Paciente")
                .Select(t => (int?)t.IdUsuarioTipo)
                .FirstOrDefaultAsync(),
            IdGrupoSanguineo = await BuscarGrupoSanguineo(dto.GrupoSanguineo),
            IdAlergia = await BuscarOCrearAlergia(dto.Alergia),
            IdCondicion = await BuscarOCrearCondicion(dto.Condicion),
            IdSeguroMedico = await BuscarOCrearSeguro(dto.SeguroMedico, dto.NumeroPoliza)
        };

        usuario.PasswordHash = _passwordHasher.HashPassword(usuario, dto.Password);

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        await IniciarSesion(usuario);

        await UpsertTelefono(usuario.IdUsuario, dto.TipoTelefono, dto.Telefono);
        await UpsertContactoEmergencia(usuario.IdUsuario, dto.ContactoEmergencia, dto.Parentesco, dto.TelefonoEmergencia);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Login), new AuthResponseDto
        {
            Mensaje = "Registro correcto",
            Usuario = ToDto(usuario)
        });
    }

    [HttpPost("solicitar-recupero")]
    [AllowAnonymous]
    public async Task<ActionResult<SolicitarRecuperoPasswordResponseDto>> SolicitarRecupero(SolicitarRecuperoPasswordDto dto, CancellationToken cancellationToken)
    {
        var respuestaGenerica = new SolicitarRecuperoPasswordResponseDto
        {
            Mensaje = "Si el correo existe, recibirás un token de recuperación válido por 30 minutos. Revisá también la carpeta de correo no deseado."
        };

        if (string.IsNullOrWhiteSpace(dto.Mail))
        {
            return BadRequest("Ingresá el correo asociado a la cuenta.");
        }

        var mail = dto.Mail.Trim();
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Mail == mail);
        if (usuario is null)
        {
            return Ok(respuestaGenerica);
        }

        if (!_emailService.EstaConfigurado)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new ProblemDetails
            {
                Title = "Correo no configurado",
                Detail = "La API todavía no tiene configurado el servidor SMTP para enviar el token.",
                Status = 503
            });
        }

        await AsegurarTablaRecuperoPassword();

        var ahora = DateTime.UtcNow;
        var tokensPendientes = await _context.PasswordResetTokens
            .Where(t => t.IdUsuario == usuario.IdUsuario && !t.Usado && t.FechaExpiracion >= ahora)
            .ToListAsync();

        foreach (var tokenPendiente in tokensPendientes)
        {
            tokenPendiente.Usado = true;
            tokenPendiente.FechaUso = ahora;
        }

        var token = CrearTokenSeguro();
        var expira = ahora.AddMinutes(30);

        _context.PasswordResetTokens.Add(new PasswordResetToken
        {
            IdUsuario = usuario.IdUsuario,
            TokenHash = HashearToken(token),
            FechaCreacion = ahora,
            FechaExpiracion = expira,
            Usado = false
        });

        await _context.SaveChangesAsync();

        try
        {
            await _emailService.EnviarTokenRecuperacionAsync(
                usuario.Mail!, usuario.Nombre, token, expira, cancellationToken);
        }
        catch (Exception)
        {
            var tokenGuardado = await _context.PasswordResetTokens
                .OrderByDescending(t => t.IdPasswordResetToken)
                .FirstAsync(t => t.IdUsuario == usuario.IdUsuario && !t.Usado);
            tokenGuardado.Usado = true;
            tokenGuardado.FechaUso = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new ProblemDetails
            {
                Title = "No se pudo enviar el correo",
                Detail = "El servidor de correo no pudo entregar el token. Revisá la configuración SMTP e intentá nuevamente.",
                Status = 503
            });
        }

        return Ok(respuestaGenerica);
    }

    [HttpPost("restablecer-password")]
    [AllowAnonymous]
    public async Task<IActionResult> RestablecerPassword(RestablecerPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Mail) || string.IsNullOrWhiteSpace(dto.Token))
        {
            return BadRequest("Ingresá el correo y el token de recuperación.");
        }

        if (string.IsNullOrWhiteSpace(dto.NuevaPassword) || dto.NuevaPassword.Length < 4)
        {
            return BadRequest("La nueva contraseña debe tener al menos 4 caracteres.");
        }

        var mail = dto.Mail.Trim();
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Mail == mail);
        if (usuario is null)
        {
            return BadRequest("Token inválido o vencido.");
        }

        await AsegurarTablaRecuperoPassword();

        var tokenHash = HashearToken(dto.Token.Trim());
        var ahora = DateTime.UtcNow;
        var token = await _context.PasswordResetTokens
            .Where(t => t.IdUsuario == usuario.IdUsuario
                && t.TokenHash == tokenHash
                && !t.Usado
                && t.FechaExpiracion >= ahora)
            .OrderByDescending(t => t.FechaCreacion)
            .FirstOrDefaultAsync();

        if (token is null)
        {
            return BadRequest("Token inválido o vencido.");
        }

        usuario.PasswordHash = _passwordHasher.HashPassword(usuario, dto.NuevaPassword);
        token.Usado = true;
        token.FechaUso = ahora;

        await _context.SaveChangesAsync();
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        return Ok(new { mensaje = "Contraseña actualizada. Ya podés iniciar sesión con la nueva clave." });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    [HttpGet("sesion")]
    public IActionResult Sesion() => Ok(new { idUsuario = User.FindFirstValue("idUsuario") });

    private async Task IniciarSesion(Usuario usuario)
    {
        var claims = new[]
        {
            new Claim("idUsuario", usuario.IdUsuario.ToString()),
            new Claim(ClaimTypes.Name, usuario.Mail ?? usuario.IdUsuario.ToString()),
            new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString())
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme));
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(12)
        });
    }

    private static string CrearTokenSeguro()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-", StringComparison.Ordinal)
            .Replace("/", "_", StringComparison.Ordinal)
            .TrimEnd('=');
    }

    private static string HashearToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    private async Task AsegurarTablaRecuperoPassword()
    {
        await _context.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'dbo.PASSWORD_RESET_TOKENS', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[PASSWORD_RESET_TOKENS](
                    [ID_password_reset_token] [int] IDENTITY(1,1) NOT NULL,
                    [ID_usuario] [int] NOT NULL,
                    [TokenHash] [nvarchar](128) NOT NULL,
                    [Fecha_creacion] [datetime2](0) NOT NULL CONSTRAINT [DF_PasswordResetTokens_FechaCreacion] DEFAULT (getutcdate()),
                    [Fecha_expiracion] [datetime2](0) NOT NULL,
                    [Fecha_uso] [datetime2](0) NULL,
                    [Usado] [bit] NOT NULL CONSTRAINT [DF_PasswordResetTokens_Usado] DEFAULT ((0)),
                    CONSTRAINT [PK_PASSWORD_RESET_TOKENS] PRIMARY KEY CLUSTERED ([ID_password_reset_token] ASC)
                );
            END;

            IF NOT EXISTS (
                SELECT 1
                FROM sys.foreign_keys
                WHERE name = N'FK_PasswordResetTokens_Usuarios'
            )
            BEGIN
                ALTER TABLE [dbo].[PASSWORD_RESET_TOKENS] WITH CHECK
                ADD CONSTRAINT [FK_PasswordResetTokens_Usuarios]
                FOREIGN KEY([ID_usuario]) REFERENCES [dbo].[USUARIOS] ([ID_usuario]);
            END;
            """);
    }

    private static UsuarioDto ToDto(Usuario usuario) => new()
    {
        IdUsuario = usuario.IdUsuario,
        Nombre = usuario.Nombre,
        Apellido = usuario.Apellido,
        Ciudad = usuario.Ciudad,
        FechaNacimiento = usuario.FechaNacimiento,
        Dni = usuario.Dni,
        Foto = usuario.Foto,
        FechaAlta = usuario.FechaAlta,
        FechaBaja = usuario.FechaBaja,
        Mail = usuario.Mail,
        IdGrupoSanguineo = usuario.IdGrupoSanguineo,
        IdUsuarioTipo = usuario.IdUsuarioTipo,
        IdAlergia = usuario.IdAlergia,
        IdCondicion = usuario.IdCondicion,
        IdSeguroMedico = usuario.IdSeguroMedico,
        IdUsuarioPadre = usuario.IdUsuarioPadre,
        IdParentezco = usuario.IdParentezco
    };

    private async Task<int?> BuscarGrupoSanguineo(string? tipo)
    {
        if (string.IsNullOrWhiteSpace(tipo) || tipo.StartsWith("Sin ", StringComparison.OrdinalIgnoreCase))
            return null;

        var normalizado = tipo.Trim().ToUpperInvariant();
        var grupo = await _context.GrupoSanguineos
            .FirstOrDefaultAsync(g => g.Tipo.ToUpper() == normalizado);

        if (grupo is null)
            throw new InvalidOperationException($"Grupo sanguíneo inválido: {tipo}");

        return grupo.IdGrupoSanguineo;
    }

    private async Task<int?> BuscarOCrearAlergia(string? descripcion)
    {
        if (string.IsNullOrWhiteSpace(descripcion) || descripcion.StartsWith("Sin ", StringComparison.OrdinalIgnoreCase))
            return null;

        var valor = descripcion.Trim();
        var alergia = await _context.Alergias.FirstOrDefaultAsync(a => a.Descripcion == valor);
        if (alergia is not null) return alergia.IdAlergia;

        alergia = new Alergia { Descripcion = valor };
        _context.Alergias.Add(alergia);
        await _context.SaveChangesAsync();
        return alergia.IdAlergia;
    }

    private async Task<int?> BuscarOCrearCondicion(string? tipo)
    {
        if (string.IsNullOrWhiteSpace(tipo) || tipo.StartsWith("Sin ", StringComparison.OrdinalIgnoreCase))
            return null;

        var valor = tipo.Trim();
        var condicion = await _context.Condiciones.FirstOrDefaultAsync(c => c.Tipo == valor);
        if (condicion is not null) return condicion.IdCondicion;

        condicion = new Condicion { Tipo = valor };
        _context.Condiciones.Add(condicion);
        await _context.SaveChangesAsync();
        return condicion.IdCondicion;
    }

    private async Task<int?> BuscarOCrearSeguro(string? compania, string? numeroPoliza)
    {
        if (string.IsNullOrWhiteSpace(compania) || compania.StartsWith("Sin ", StringComparison.OrdinalIgnoreCase))
            return null;

        var companiaValor = compania.Trim();
        var polizaValor = string.IsNullOrWhiteSpace(numeroPoliza) || numeroPoliza.StartsWith("Sin ", StringComparison.OrdinalIgnoreCase)
            ? "Sin póliza"
            : numeroPoliza.Trim();

        var seguro = await _context.SeguroMedicos
            .FirstOrDefaultAsync(s => s.Compania == companiaValor && s.NumeroPoliza == polizaValor);
        if (seguro is not null) return seguro.IdSeguroMedico;

        seguro = new SeguroMedico { Compania = companiaValor, NumeroPoliza = polizaValor };
        _context.SeguroMedicos.Add(seguro);
        await _context.SaveChangesAsync();
        return seguro.IdSeguroMedico;
    }

    private async Task UpsertTelefono(int idUsuario, string? tipo, string? numero)
    {
        if (string.IsNullOrWhiteSpace(numero)) return;

        _context.Telefonos.Add(new Telefono
        {
            IdUsuario = idUsuario,
            Tipo = string.IsNullOrWhiteSpace(tipo) ? "Personal" : tipo.Trim(),
            Numero = numero.Trim()
        });

        await Task.CompletedTask;
    }

    private async Task UpsertContactoEmergencia(int idUsuario, string? nombreCompleto, string? parentesco, string? telefonoEmergencia)
    {
        if (string.IsNullOrWhiteSpace(nombreCompleto)) return;

        var partes = nombreCompleto.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        var contacto = new Usuario
        {
            Nombre = partes.ElementAtOrDefault(0) ?? nombreCompleto.Trim(),
            Apellido = partes.ElementAtOrDefault(1) ?? "",
            IdUsuarioPadre = idUsuario,
            IdParentezco = parentesco
        };
        _context.Usuarios.Add(contacto);
        await _context.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(telefonoEmergencia))
        {
            _context.Telefonos.Add(new Telefono
            {
                IdUsuario = contacto.IdUsuario,
                Tipo = "Emergencia",
                Numero = telefonoEmergencia.Trim()
            });
        }
    }
}
