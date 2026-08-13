using CuidarPlusAPI.Models;

namespace CuidarPlusAPI.Services;

public sealed record EstadoPlanTratamiento(
    string Estado,
    int? CicloActual = null,
    int? DiaActivoActual = null,
    DateTime? ProximoCiclo = null);

public static class PlanTratamientoService
{
    public static EstadoPlanTratamiento Calcular(Tratamiento tratamiento, DateTime? fecha = null)
    {
        var hoy = (fecha ?? DateTime.Today).Date;
        var inicio = tratamiento.FechaInicio.Date;

        if (hoy < inicio)
            return new EstadoPlanTratamiento("pendiente", 1, null, inicio);

        if (tratamiento.FechaFin.HasValue && hoy > tratamiento.FechaFin.Value.Date)
            return new EstadoPlanTratamiento("finalizado");

        if (!string.Equals(tratamiento.TipoPlan, "ciclico", StringComparison.OrdinalIgnoreCase))
            return new EstadoPlanTratamiento("activo");

        var diasActivos = Math.Max(1, tratamiento.DiasActivos ?? 1);
        var diasDescanso = Math.Max(1, tratamiento.DiasDescanso ?? 1);
        var duracionCiclo = diasActivos + diasDescanso;
        var diasTranscurridos = (hoy - inicio).Days;
        var indiceCiclo = diasTranscurridos / duracionCiclo;

        if (tratamiento.CantidadCiclos.HasValue && indiceCiclo >= tratamiento.CantidadCiclos.Value)
            return new EstadoPlanTratamiento("finalizado");

        var diaDentroDelCiclo = diasTranscurridos % duracionCiclo;
        var cicloActual = indiceCiclo + 1;

        if (diaDentroDelCiclo < diasActivos)
            return new EstadoPlanTratamiento("activo", cicloActual, diaDentroDelCiclo + 1);

        var proximoCiclo = inicio.AddDays((indiceCiclo + 1) * duracionCiclo);
        if (tratamiento.CantidadCiclos.HasValue && cicloActual >= tratamiento.CantidadCiclos.Value)
            return new EstadoPlanTratamiento("finalizado", cicloActual);

        return new EstadoPlanTratamiento("descanso", cicloActual, null, proximoCiclo);
    }

    public static bool EstaActivoHoy(Tratamiento tratamiento, DateTime? fecha = null) =>
        Calcular(tratamiento, fecha).Estado == "activo";

    public static DateTime? CalcularFechaFin(DateTime fechaInicio, int diasActivos, int diasDescanso, int? cantidadCiclos)
    {
        if (!cantidadCiclos.HasValue) return null;
        var ciclosCompletosPrevios = Math.Max(0, cantidadCiclos.Value - 1);
        return fechaInicio.Date.AddDays(ciclosCompletosPrevios * (diasActivos + diasDescanso) + diasActivos - 1);
    }
}
