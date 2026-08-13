using System;

namespace CuidarPlusAPI.DTOs;

public class TratamientoCrearDto
{
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public TimeSpan? Frecuencia { get; set; }
    public int IdUsuario { get; set; }
    public int? IdMedicamento { get; set; }
    public int? IdReceta { get; set; }
    public int? IdMedico { get; set; }
}