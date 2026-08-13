using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("RECETAS")]
public class Receta
{
    [Key]
    [Column("ID_receta")]
    public int IdReceta { get; set; }

    [Column("Archivos")]
    public string? Archivos { get; set; }

    [Column("Observaciones")]
    public string? Observaciones { get; set; }

    [Column("ID_medico")]
    public int? IdMedico { get; set; }

}