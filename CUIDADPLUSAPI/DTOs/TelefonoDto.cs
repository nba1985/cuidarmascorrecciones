using System;

namespace CuidarPlusAPI.DTOs;

public class TelefonoDto
{
    public int IdTelefono { get; set; }
    public string Numero { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int IdUsuario { get; set; }
}