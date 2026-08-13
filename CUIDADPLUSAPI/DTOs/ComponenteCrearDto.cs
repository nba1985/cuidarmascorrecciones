using System;

namespace CuidarPlusAPI.DTOs;

public class ComponenteCrearDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int? IdMedicamento { get; set; }
}