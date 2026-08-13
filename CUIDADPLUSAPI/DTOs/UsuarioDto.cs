using System;

namespace CuidarPlusAPI.DTOs;

public class UsuarioDto
{
    public int IdUsuario { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string? Ciudad { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public string? Dni { get; set; }
    public string? Foto { get; set; }
    public DateTime? FechaAlta { get; set; }
    public DateTime? FechaBaja { get; set; }
    public string? Mail { get; set; }
    public int? IdGrupoSanguineo { get; set; }
    public int? IdUsuarioTipo { get; set; }
    public int? IdAlergia { get; set; }
    public int? IdCondicion { get; set; }
    public int? IdSeguroMedico { get; set; }
    public int? IdUsuarioPadre { get; set; }
    public string? IdParentezco { get; set; }
}