using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("USUARIOS_TIPOS")]
public class UsuarioTipo
{
    [Key]
    [Column("ID_UsuarioTipo")]
    public int IdUsuarioTipo { get; set; }

    [Column("Nombre")]
    public string Nombre { get; set; } = string.Empty;

}