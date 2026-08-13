using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("USUARIOS")]
public class Usuario
{
    [Key]
    [Column("ID_usuario")]
    public int IdUsuario { get; set; }

    [Column("Nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("Apellido")]
    public string Apellido { get; set; } = string.Empty;

    [Column("Ciudad")]
    public string? Ciudad { get; set; }

    [Column("Fecha_nacimiento")]
    public DateTime? FechaNacimiento { get; set; }

    [Column("DNI")]
    public string? Dni { get; set; }

    [Column("Foto")]
    public string? Foto { get; set; }

    [Column("Fecha_alta")]
    public DateTime? FechaAlta { get; set; }

    [Column("Fecha_baja")]
    public DateTime? FechaBaja { get; set; }

    [Column("Mail")]
    public string? Mail { get; set; }

    [Column("ID_grupo_sanguineo")]
    public int? IdGrupoSanguineo { get; set; }

    [Column("ID_UsuarioTipo")]
    public int? IdUsuarioTipo { get; set; }

    [Column("ID_alergia")]
    public int? IdAlergia { get; set; }

    [Column("ID_condicion")]
    public int? IdCondicion { get; set; }

    [Column("ID_Seguro_medico")]
    public int? IdSeguroMedico { get; set; }

    [Column("ID_usuario_padre")]
    public int? IdUsuarioPadre { get; set; }

    [Column("ID_parentezco")]
    public string? IdParentezco { get; set; }

    [Column("PasswordHash")]
    public string? PasswordHash { get; set; }

}