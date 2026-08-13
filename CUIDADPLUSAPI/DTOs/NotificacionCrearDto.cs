using System;

namespace CuidarPlusAPI.DTOs;

public class NotificacionCrearDto
{
    public string? Tipo { get; set; }
    public string? Mensaje { get; set; }
    public int IdRecordatorio { get; set; }
}