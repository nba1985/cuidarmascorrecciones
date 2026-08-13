using System;

namespace CuidarPlusAPI.DTOs;

public class RegistroTomaCrearDto
{
    public bool Estado { get; set; }
    public DateTime FechaHoraReal { get; set; }
    public string? Observaciones { get; set; }
    public int? IdRecordatorio { get; set; }
    public int? IdHistorialAnimo { get; set; }
}