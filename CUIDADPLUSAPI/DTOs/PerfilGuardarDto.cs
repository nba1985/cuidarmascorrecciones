namespace CuidarPlusAPI.DTOs;

public class PerfilGuardarDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string? Ciudad { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public string? Dni { get; set; }
    public string? Mail { get; set; }
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
