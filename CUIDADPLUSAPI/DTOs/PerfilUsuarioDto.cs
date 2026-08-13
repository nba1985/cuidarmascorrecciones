namespace CuidarPlusAPI.DTOs;

public class PerfilUsuarioDto
{
    public int IdUsuario { get; set; }
    public string? NombreCompleto { get; set; }
    public string? Ciudad { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public int? Edad { get; set; }
    public string? Dni { get; set; }
    public string? Mail { get; set; }
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
    public string? Foto { get; set; }
}
