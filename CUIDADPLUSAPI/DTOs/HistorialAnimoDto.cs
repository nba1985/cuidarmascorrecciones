using System;

namespace CuidarPlusAPI.DTOs;

public class HistorialAnimoDto
{
    public int IdHistorialAnimo { get; set; }
    public DateTime Fecha { get; set; }
    public TimeSpan Hora { get; set; }
    public string? Observaciones { get; set; }
    public int? IdUsuario { get; set; }
    public int? IdEstado { get; set; }
}