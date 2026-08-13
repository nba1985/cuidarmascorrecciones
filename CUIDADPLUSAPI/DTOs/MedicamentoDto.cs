using System;

namespace CuidarPlusAPI.DTOs;

public class MedicamentoDto
{
    public int IdMedicamento { get; set; }
    public int? IdTratamiento { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Presentacion { get; set; }
    public int? IdLaboratorio { get; set; }
    public string? Contraindicaciones { get; set; }
    public string? EfectosSecundarios { get; set; }
    public string? Horario { get; set; }
    public int? IdRecordatorio { get; set; }
    public int? FrecuenciaHoras { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public List<HorarioMedicamentoDto> Horarios { get; set; } = [];
    public bool Pausado { get; set; }
    public string TipoTratamiento { get; set; } = "continuo";
    public int? DiasActivos { get; set; }
    public int? DiasDescanso { get; set; }
    public int? CantidadCiclos { get; set; }
    public string EstadoCiclo { get; set; } = "activo";
    public int? CicloActual { get; set; }
    public int? DiaActivoActual { get; set; }
    public DateTime? ProximoCiclo { get; set; }
}

public class HorarioMedicamentoDto
{
    public string Hora { get; set; } = string.Empty;
    public int? IdRecordatorio { get; set; }
}
