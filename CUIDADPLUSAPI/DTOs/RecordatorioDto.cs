using System;

namespace CuidarPlusAPI.DTOs;

public class RecordatorioDto
{
    public int IdRecordatorio { get; set; }
    public string? Canal { get; set; }
    public DateTime FechaHoraProgramada { get; set; }
}