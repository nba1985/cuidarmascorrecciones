namespace CuidarPlusAPI.DTOs;

public sealed class AnalisisRecetaDto
{
    public MedicoDetectadoDto Medico { get; set; } = new();
    public string? FechaEmision { get; set; }
    public List<MedicamentoDetectadoDto> Medicamentos { get; set; } = [];
    public List<string> AdvertenciasLectura { get; set; } = [];
    public string Resumen { get; set; } = string.Empty;
}

public sealed class MedicoDetectadoDto
{
    public string? Nombre { get; set; }
    public string? Matricula { get; set; }
}

public sealed class MedicamentoDetectadoDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Presentacion { get; set; }
    public int? Cantidad { get; set; }
    public string? Frecuencia { get; set; }
    public int? FrecuenciaHoras { get; set; }
    public int? DuracionDias { get; set; }
    public string? Indicaciones { get; set; }
    public decimal Confianza { get; set; }
}
