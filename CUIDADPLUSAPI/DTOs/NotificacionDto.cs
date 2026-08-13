using System;

namespace CuidarPlusAPI.DTOs;

public class NotificacionDto
{
    public int IdNotificacion { get; set; }
    public string? Tipo { get; set; }
    public string? Mensaje { get; set; }
    public int IdRecordatorio { get; set; }
}