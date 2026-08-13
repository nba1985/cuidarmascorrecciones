using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("TELEFONOS")]
public class Telefono
{
    [Key]
    [Column("ID_telefono")]
    public int IdTelefono { get; set; }

    [Column("Numero")]
    public string Numero { get; set; } = string.Empty;

    [Column("Tipo")]
    public string Tipo { get; set; } = string.Empty;

    [Column("ID_usuario")]
    public int IdUsuario { get; set; }

}