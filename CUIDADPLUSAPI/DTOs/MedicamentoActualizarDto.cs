using System;

namespace CuidarPlusAPI.DTOs;

public class MedicamentoActualizarDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Presentacion { get; set; }
    public int? IdLaboratorio { get; set; }
    public int? IdUsuario { get; set; }
    public string? Horario { get; set; }
    public int? FrecuenciaHoras { get; set; }
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string? TipoTratamiento { get; set; }
    public int? DiasActivos { get; set; }
    public int? DiasDescanso { get; set; }
    public int? CantidadCiclos { get; set; }
    public List<string>? Horarios { get; set; }
}
