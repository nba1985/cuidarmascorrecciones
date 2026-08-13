using System;

namespace CuidarPlusAPI.DTOs;

public class SeguroMedicoActualizarDto
{
    public string Compania { get; set; } = string.Empty;
    public string NumeroPoliza { get; set; } = string.Empty;
}