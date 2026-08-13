using System;

namespace CuidarPlusAPI.DTOs;

public class EspecialidadCrearDto
{
    public string Nombre { get; set; } = string.Empty;
    public int? IdMedico { get; set; }
}