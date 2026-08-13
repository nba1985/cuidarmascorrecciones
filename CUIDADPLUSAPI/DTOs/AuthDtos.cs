namespace CuidarPlusAPI.DTOs;

public class LoginDto
{
    public string Mail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegistroDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Mail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Ciudad { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public string? Dni { get; set; }
    public string? Foto { get; set; }
    public string? GrupoSanguineo { get; set; }
    public string? SeguroMedico { get; set; }
    public string? NumeroPoliza { get; set; }
    public string? Alergia { get; set; }
    public string? Condicion { get; set; }
    public string? TipoTelefono { get; set; }
    public string? Telefono { get; set; }
    public string? ContactoEmergencia { get; set; }
    public string? Parentesco { get; set; }
    public string? TelefonoEmergencia { get; set; }
}

public class AuthResponseDto
{
    public string Mensaje { get; set; } = string.Empty;
    public UsuarioDto Usuario { get; set; } = new();
}

public class SolicitarRecuperoPasswordDto
{
    public string Mail { get; set; } = string.Empty;
}

public class SolicitarRecuperoPasswordResponseDto
{
    public string Mensaje { get; set; } = string.Empty;
}

public class RestablecerPasswordDto
{
    public string Mail { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string NuevaPassword { get; set; } = string.Empty;
}
