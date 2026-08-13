using System;

namespace CuidarPlusAPI.DTOs;

public class EspecialidadActualizarDto
{
    public string Nombre { get; set; } = string.Empty;
    public int? IdMedico { get; set; }
}