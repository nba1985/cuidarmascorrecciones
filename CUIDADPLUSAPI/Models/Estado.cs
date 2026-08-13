using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("ESTADOS")]
public class Estado
{
    [Key]
    [Column("ID_estado")]
    public int IdEstado { get; set; }

    [Column("Nombre")]
    public string Nombre { get; set; } = string.Empty;

}