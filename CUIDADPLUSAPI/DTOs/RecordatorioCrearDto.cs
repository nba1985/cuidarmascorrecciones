using System;

namespace CuidarPlusAPI.DTOs;

public class RecordatorioCrearDto
{
    public string? Canal { get; set; }
    public DateTime FechaHoraProgramada { get; set; }
}