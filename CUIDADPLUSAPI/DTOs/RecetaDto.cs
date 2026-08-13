using System;

namespace CuidarPlusAPI.DTOs;

public class RecetaDto
{
    public int IdReceta { get; set; }
    public string? Archivos { get; set; }
    public string? Observaciones { get; set; }
    public int? IdMedico { get; set; }
}