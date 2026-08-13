using System;

namespace CuidarPlusAPI.DTOs;

public class RecetaActualizarDto
{
    public string? Archivos { get; set; }
    public string? Observaciones { get; set; }
    public int? IdMedico { get; set; }
}