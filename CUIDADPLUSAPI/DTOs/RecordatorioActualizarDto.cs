using System;

namespace CuidarPlusAPI.DTOs;

public class RecordatorioActualizarDto
{
    public string? Canal { get; set; }
    public DateTime FechaHoraProgramada { get; set; }
}