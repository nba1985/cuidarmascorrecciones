using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("GRUPOS_SANGUINEOS")]
public class GrupoSanguineo
{
    [Key]
    [Column("ID_grupo_sanguineo")]
    public int IdGrupoSanguineo { get; set; }

    [Column("Tipo")]
    public string Tipo { get; set; } = string.Empty;

}