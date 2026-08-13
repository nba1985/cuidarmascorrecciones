using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CuidarPlusAPI.Models;

[Keyless]
[Table("VW_PerfilUsuario")]
public class PerfilUsuario
{
    [Column("ID_usuario")]
    public int IdUsuario { get; set; }

    public string? NombreCompleto { get; set; }
    public string? Ciudad { get; set; }

    [Column("Fecha_nacimiento")]
    public DateTime? FechaNacimiento { get; set; }

    public int? Edad { get; set; }
    public string? DNI { get; set; }
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
}
