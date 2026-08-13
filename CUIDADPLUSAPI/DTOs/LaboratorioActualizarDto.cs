using System;

namespace CuidarPlusAPI.DTOs;

public class LaboratorioActualizarDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? TelefonoUnico { get; set; }
}