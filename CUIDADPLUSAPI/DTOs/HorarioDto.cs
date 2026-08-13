using System;

namespace CuidarPlusAPI.DTOs;

public class HorarioDto
{
    public int IdHorario { get; set; }
    public TimeSpan HoraProgramada { get; set; }
    public bool Activo { get; set; }
    public int? IdRecordatorio { get; set; }
    public int? IdTratamiento { get; set; }
}