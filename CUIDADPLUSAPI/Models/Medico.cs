using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("MEDICOS")]
public class Medico
{
    [Key]
    [Column("ID_medico")]
    public int IdMedico { get; set; }

    [Column("Nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("Apellido")]
    public string Apellido { get; set; } = string.Empty;

    [Column("Matricula")]
    public string Matricula { get; set; } = string.Empty;

    [Column("Telefono_unico")]
    public string? TelefonoUnico { get; set; }

    [Column("Email")]
    public string? Email { get; set; }

}