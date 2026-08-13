using System;

namespace CuidarPlusAPI.DTOs;

public class RegistroTomaActualizarDto
{
    public bool Estado { get; set; }
    public DateTime FechaHoraReal { get; set; }
    public string? Observaciones { get; set; }
    public int? IdRecordatorio { get; set; }
    public int? IdHistorialAnimo { get; set; }
}