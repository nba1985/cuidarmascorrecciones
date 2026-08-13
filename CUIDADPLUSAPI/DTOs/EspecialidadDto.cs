using System;

namespace CuidarPlusAPI.DTOs;

public class EspecialidadDto
{
    public int IdEspecialidad { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int? IdMedico { get; set; }
}