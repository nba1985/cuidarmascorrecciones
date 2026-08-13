using System;

namespace CuidarPlusAPI.DTOs;

public class RegistroTomaDto
{
    public int IdRegistroToma { get; set; }
    public bool Estado { get; set; }
    public DateTime FechaHoraReal { get; set; }
    public string? Observaciones { get; set; }
    public int? IdRecordatorio { get; set; }
    public int? IdHistorialAnimo { get; set; }
    public string? Medicamento { get; set; }
}
