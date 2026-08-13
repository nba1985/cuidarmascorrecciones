using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly CuidarPlusContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly PasswordHasher<Usuario> _passwordHasher = new();

    public UsuariosController(CuidarPlusContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // GET: api/Usuario
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetAll()
    {
        if (!int.TryParse(User.FindFirstValue("idUsuario"), out var idUsuario))
            return Unauthorized();

        var usuarios = await _context.Usuarios
            .Where(u => u.IdUsuario == idUsuario)
            .Select(u => new UsuarioDto
            {
                IdUsuario = u.IdUsuario,
                Nombre = u.Nombre,
                Apellido = u.Apellido,
                Ciudad = u.Ciudad,
                FechaNacimiento = u.FechaNacimiento,
                Dni = u.Dni,
                Foto = u.Foto,
                FechaAlta = u.FechaAlta,
                FechaBaja = u.FechaBaja,
                Mail = u.Mail,
                IdGrupoSanguineo = u.IdGrupoSanguineo,
                IdUsuarioTipo = u.IdUsuarioTipo,
                IdAlergia = u.IdAlergia,
                IdCondicion = u.IdCondicion,
                IdSeguroMedico = u.IdSeguroMedico,
                IdUsuarioPadre = u.IdUsuarioPadre,
                IdParentezco = u.IdParentezco
            })
            .ToListAsync();

        return Ok(usuarios);
    }

    // GET: api/Usuario/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioDto>> GetById(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario is null)
            return NotFound();

        var dto = new UsuarioDto
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

        return Ok(dto);
    }

    [HttpGet("{id}/perfil")]
    public async Task<ActionResult<PerfilUsuarioDto>> GetPerfil(int id)
    {
        var perfil = await _context.PerfilesUsuario
            .Where(p => p.IdUsuario == id)
            .Select(p => new PerfilUsuarioDto
            {
                IdUsuario = p.IdUsuario,
                NombreCompleto = p.NombreCompleto,
                Ciudad = p.Ciudad,
                FechaNacimiento = p.FechaNacimiento,
                Edad = p.Edad,
                Dni = p.DNI,
                Mail = p.Mail,
                GrupoSanguineo = p.GrupoSanguineo,
                SeguroMedico = p.SeguroMedico,
                NumeroPoliza = p.NumeroPoliza,
                Alergia = p.Alergia,
                Condicion = p.Condicion,
                TipoTelefono = p.TipoTelefono,
                Telefono = p.Telefono,
                ContactoEmergencia = p.ContactoEmergencia,
                Parentesco = p.Parentesco
            })
            .FirstOrDefaultAsync();

        if (perfil is null)
            return NotFound();

        var usuario = await _context.Usuarios.FindAsync(id);
        perfil.Foto = usuario?.Foto;
        var contacto = await _context.Usuarios.FirstOrDefaultAsync(u => u.IdUsuarioPadre == id);
        if (contacto is not null)
        {
            perfil.TelefonoEmergencia = await _context.Telefonos
                .Where(t => t.IdUsuario == contacto.IdUsuario)
                .Select(t => t.Numero)
                .FirstOrDefaultAsync();
        }

        return Ok(perfil);
    }

    [HttpPut("{id}/perfil-completo")]
    public async Task<IActionResult> UpdatePerfilCompleto(int id, [FromBody] PerfilGuardarDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario is null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.Apellido))
            return BadRequest(new ProblemDetails { Title = "Datos incompletos", Detail = "Nombre y apellido son obligatorios.", Status = 400 });

        if (!string.IsNullOrWhiteSpace(dto.Mail))
        {
            var mailEnUso = await _context.Usuarios.AnyAsync(u => u.IdUsuario != id && u.Mail == dto.Mail.Trim());
            if (mailEnUso)
                return Conflict(new ProblemDetails { Title = "Correo en uso", Detail = "Ese correo ya pertenece a otro usuario.", Status = 409 });
        }

        await using var transaccion = await _context.Database.BeginTransactionAsync();

        try
        {
            var ids = await ResolverIdsPerfil(dto);

            usuario.Nombre = dto.Nombre.Trim();
            usuario.Apellido = dto.Apellido.Trim();
            usuario.Ciudad = dto.Ciudad?.Trim();
            usuario.FechaNacimiento = dto.FechaNacimiento;
            usuario.Dni = dto.Dni?.Trim();
            usuario.Foto = dto.Foto;
            usuario.Mail = dto.Mail?.Trim();
            usuario.IdGrupoSanguineo = ids.IdGrupoSanguineo;
            usuario.IdAlergia = ids.IdAlergia;
            usuario.IdCondicion = ids.IdCondicion;
            usuario.IdSeguroMedico = ids.IdSeguroMedico;

            await UpsertTelefono(id, dto.TipoTelefono, dto.Telefono);
            await UpsertContactoEmergencia(id, dto.ContactoEmergencia, dto.Parentesco, dto.TelefonoEmergencia);
            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();
        }
        catch (InvalidOperationException ex)
        {
            await transaccion.RollbackAsync();
            return BadRequest(new ProblemDetails { Title = "No se pudo guardar el perfil", Detail = ex.Message, Status = 400 });
        }
        catch (DbUpdateException ex)
        {
            await transaccion.RollbackAsync();
            var detalle = ex.InnerException?.Message ?? ex.Message;
            return Conflict(new ProblemDetails
            {
                Title = "No se pudo guardar el perfil",
                Detail = $"La base de datos rechazó uno de los datos. Revisá correo, teléfono y longitudes de los campos. Detalle: {detalle}",
                Status = 409
            });
        }

        return NoContent();
    }

    [HttpPost("{id}/foto")]
    public async Task<ActionResult<object>> UploadFoto(int id, IFormFile archivo)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario is null)
            return NotFound();

        if (archivo.Length == 0 || !archivo.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return BadRequest("El archivo debe ser una imagen válida.");

        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension) || extension.Length > 6)
            extension = ".jpg";

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
        }

        var carpeta = Path.Combine(webRoot, "uploads", "perfiles");
        Directory.CreateDirectory(carpeta);

        var nombreArchivo = $"usuario-{id}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}{extension}";
        var rutaFisica = Path.Combine(carpeta, nombreArchivo);

        await using (var stream = System.IO.File.Create(rutaFisica))
        {
            await archivo.CopyToAsync(stream);
        }

        usuario.Foto = $"/uploads/perfiles/{nombreArchivo}";
        await _context.SaveChangesAsync();

        return Ok(new { foto = usuario.Foto });
    }

    // POST: api/Usuario
    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> Create([FromBody] UsuarioCrearDto crearDto)
    {
        var usuario = new Usuario
        {
            Nombre = crearDto.Nombre,
            Apellido = crearDto.Apellido,
            Ciudad = crearDto.Ciudad,
            FechaNacimiento = crearDto.FechaNacimiento,
            Dni = crearDto.Dni,
            Foto = crearDto.Foto,
            FechaAlta = crearDto.FechaAlta,
            FechaBaja = crearDto.FechaBaja,
            Mail = crearDto.Mail,
            IdGrupoSanguineo = crearDto.IdGrupoSanguineo,
            IdUsuarioTipo = crearDto.IdUsuarioTipo,
            IdAlergia = crearDto.IdAlergia,
            IdCondicion = crearDto.IdCondicion,
            IdSeguroMedico = crearDto.IdSeguroMedico,
            IdUsuarioPadre = crearDto.IdUsuarioPadre,
            IdParentezco = crearDto.IdParentezco,
            PasswordHash = string.Empty
        };

        if (!string.IsNullOrWhiteSpace(crearDto.Password))
        {
            usuario.PasswordHash = _passwordHasher.HashPassword(usuario, crearDto.Password);
        }

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        var dto = new UsuarioDto
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

        return CreatedAtAction(nameof(GetById), new { id = usuario.IdUsuario }, dto);
    }

    // PUT: api/Usuario/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UsuarioActualizarDto actualizarDto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario is null)
            return NotFound();

        usuario.Nombre = actualizarDto.Nombre;
        usuario.Apellido = actualizarDto.Apellido;
        usuario.Ciudad = actualizarDto.Ciudad;
        usuario.FechaNacimiento = actualizarDto.FechaNacimiento;
        usuario.Dni = actualizarDto.Dni;
        usuario.Foto = actualizarDto.Foto;
        usuario.FechaAlta = actualizarDto.FechaAlta;
        usuario.FechaBaja = actualizarDto.FechaBaja;
        usuario.Mail = actualizarDto.Mail;
        usuario.IdGrupoSanguineo = actualizarDto.IdGrupoSanguineo;
        usuario.IdUsuarioTipo = actualizarDto.IdUsuarioTipo;
        usuario.IdAlergia = actualizarDto.IdAlergia;
        usuario.IdCondicion = actualizarDto.IdCondicion;
        usuario.IdSeguroMedico = actualizarDto.IdSeguroMedico;
        usuario.IdUsuarioPadre = actualizarDto.IdUsuarioPadre;
        usuario.IdParentezco = actualizarDto.IdParentezco;
        if (!string.IsNullOrWhiteSpace(actualizarDto.Password))
        {
            usuario.PasswordHash = _passwordHasher.HashPassword(usuario, actualizarDto.Password);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<(int? IdGrupoSanguineo, int? IdAlergia, int? IdCondicion, int? IdSeguroMedico)> ResolverIdsPerfil(PerfilGuardarDto dto)
    {
        return (
            await BuscarGrupoSanguineo(dto.GrupoSanguineo),
            await BuscarOCrearAlergia(dto.Alergia),
            await BuscarOCrearCondicion(dto.Condicion),
            await BuscarOCrearSeguro(dto.SeguroMedico, dto.NumeroPoliza)
        );
    }

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
        var telefono = await _context.Telefonos.FirstOrDefaultAsync(t => t.IdUsuario == idUsuario);

        if (string.IsNullOrWhiteSpace(numero))
        {
            if (telefono is not null)
            {
                _context.Telefonos.Remove(telefono);
            }
            return;
        }

        if (telefono is null)
        {
            _context.Telefonos.Add(new Telefono
            {
                IdUsuario = idUsuario,
                Tipo = string.IsNullOrWhiteSpace(tipo) ? "Personal" : tipo.Trim(),
                Numero = numero.Trim()
            });
            return;
        }

        telefono.Tipo = string.IsNullOrWhiteSpace(tipo) ? telefono.Tipo : tipo.Trim();
        telefono.Numero = numero.Trim();
    }

    private async Task UpsertContactoEmergencia(int idUsuario, string? nombreCompleto, string? parentesco, string? telefonoEmergencia)
    {
        var contacto = await _context.Usuarios.FirstOrDefaultAsync(u => u.IdUsuarioPadre == idUsuario);

        if (string.IsNullOrWhiteSpace(nombreCompleto))
        {
            if (contacto is not null)
            {
                contacto.IdUsuarioPadre = null;
                contacto.IdParentezco = null;
            }
            return;
        }

        var partes = nombreCompleto.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        var nombre = partes.ElementAtOrDefault(0) ?? nombreCompleto.Trim();
        var apellido = partes.ElementAtOrDefault(1) ?? "";

        if (contacto is null)
        {
            contacto = new Usuario
            {
                Nombre = nombre,
                Apellido = apellido,
                // SQL Server solo admite un NULL en el índice UNIQUE histórico de Mail.
                // Un alias técnico estable evita que el alta de otro contacto de emergencia falle.
                Mail = $"emergencia-{idUsuario}@cuidarplus.local",
                IdUsuarioPadre = idUsuario,
                IdParentezco = parentesco,
                PasswordHash = string.Empty
            };
            _context.Usuarios.Add(contacto);
            await _context.SaveChangesAsync();
        }
        else
        {
            contacto.Nombre = nombre;
            contacto.Apellido = apellido;
            contacto.IdParentezco = parentesco;
        }

        await UpsertTelefono(contacto.IdUsuario, "Emergencia", telefonoEmergencia);
    }

    // DELETE: api/Usuario/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario is null)
            return NotFound();

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
