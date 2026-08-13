using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("ESPECIALIDADES")]
public class Especialidad
{
    [Key]
    [Column("ID_especialidad")]
    public int IdEspecialidad { get; set; }

    [Column("Nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("ID_medico")]
    public int? IdMedico { get; set; }

}