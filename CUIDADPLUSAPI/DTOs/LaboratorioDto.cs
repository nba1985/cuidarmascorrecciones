using System;

namespace CuidarPlusAPI.DTOs;

public class LaboratorioDto
{
    public int IdLaboratorio { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? TelefonoUnico { get; set; }
}