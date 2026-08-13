using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("ALERGIAS")]
public class Alergia
{
    [Key]
    [Column("ID_alergia")]
    public int IdAlergia { get; set; }

    [Column("Descripcion")]
    public string Descripcion { get; set; } = string.Empty;

}