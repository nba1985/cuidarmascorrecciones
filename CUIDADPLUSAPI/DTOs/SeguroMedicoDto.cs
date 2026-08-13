using System;

namespace CuidarPlusAPI.DTOs;

public class SeguroMedicoDto
{
    public int IdSeguroMedico { get; set; }
    public string Compania { get; set; } = string.Empty;
    public string NumeroPoliza { get; set; } = string.Empty;
}