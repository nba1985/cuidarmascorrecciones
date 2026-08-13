using System;

namespace CuidarPlusAPI.DTOs;

public class ComponenteDto
{
    public int IdComponente { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int? IdMedicamento { get; set; }
}