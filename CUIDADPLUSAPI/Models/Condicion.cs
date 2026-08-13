using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("CONDICIONES")]
public class Condicion
{
    [Key]
    [Column("ID_condicion")]
    public int IdCondicion { get; set; }

    [Column("Tipo")]
    public string Tipo { get; set; } = string.Empty;

}