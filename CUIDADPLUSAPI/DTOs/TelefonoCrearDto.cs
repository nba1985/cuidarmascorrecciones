using System;

namespace CuidarPlusAPI.DTOs;

public class TelefonoCrearDto
{
    public string Numero { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int IdUsuario { get; set; }
}