using System;

namespace CuidarPlusAPI.DTOs;

public class MedicoActualizarDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Matricula { get; set; } = string.Empty;
    public string? TelefonoUnico { get; set; }
    public string? Email { get; set; }
}