using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("PASSWORD_RESET_TOKENS")]
public class PasswordResetToken
{
    [Key]
    [Column("ID_password_reset_token")]
    public int IdPasswordResetToken { get; set; }

    [Column("ID_usuario")]
    public int IdUsuario { get; set; }

    [Column("TokenHash")]
    public string TokenHash { get; set; } = string.Empty;

    [Column("Fecha_creacion")]
    public DateTime FechaCreacion { get; set; }

    [Column("Fecha_expiracion")]
    public DateTime FechaExpiracion { get; set; }

    [Column("Fecha_uso")]
    public DateTime? FechaUso { get; set; }

    [Column("Usado")]
    public bool Usado { get; set; }
}
