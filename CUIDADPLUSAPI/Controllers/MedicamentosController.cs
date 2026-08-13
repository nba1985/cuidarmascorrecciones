using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Services;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicamentosController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public MedicamentosController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/medicamentos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MedicamentoDto>>> GetAll([FromQuery] int? idUsuario)
    {
        if (idUsuario.HasValue)
        {
            var tratamientosUsuario = await (
                from t in _context.Tratamientos
                join m in _context.Medicamentos on t.IdMedicamento equals m.IdMedicamento
                where t.IdUsuario == idUsuario.Value
                    && t.IdMedicamento.HasValue
                    && (t.FechaFin == null || t.FechaFin.Value.Date >= DateTime.Today)
                select new { Tratamiento = t, Medicamento = m })
                .ToListAsync();

            var resultado = new List<MedicamentoDto>();

            foreach (var item in tratamientosUsuario)
            {
                var estadoPlan = PlanTratamientoService.Calcular(item.Tratamiento);
                var todosLosHorarios = await _context.Horarios
                    .Where(h => h.IdTratamiento == item.Tratamiento.IdTratamiento)
                    .OrderBy(h => h.HoraProgramada)
                    .Select(h => new { h.HoraProgramada, h.IdRecordatorio, h.Activo })
                    .ToListAsync();
                var horarios = todosLosHorarios.Where(h => h.Activo).ToList();

                resultado.Add(new MedicamentoDto
                {
                    IdMedicamento = item.Medicamento.IdMedicamento,
                    IdTratamiento = item.Tratamiento.IdTratamiento,
                    Nombre = item.Medicamento.Nombre,
                    Descripcion = item.Medicamento.Descripcion,
                    Presentacion = item.Medicamento.Presentacion,
                    IdLaboratorio = item.Medicamento.IdLaboratorio,
                    Contraindicaciones = item.Medicamento.Contraindicaciones,
                    EfectosSecundarios = item.Medicamento.EfectosSecundarios,
                    Horario = horarios.FirstOrDefault()?.HoraProgramada.ToString(@"hh\:mm"),
                    IdRecordatorio = horarios.FirstOrDefault()?.IdRecordatorio,
                    FrecuenciaHoras = item.Tratamiento.Frecuencia.HasValue
                        ? (int)item.Tratamiento.Frecuencia.Value.TotalHours
                        : null,
                    FechaInicio = item.Tratamiento.FechaInicio,
                    FechaFin = item.Tratamiento.FechaFin,
                    Horarios = horarios.Select(h => new HorarioMedicamentoDto
                    {
                        Hora = h.HoraProgramada.ToString(@"hh\:mm"),
                        IdRecordatorio = h.IdRecordatorio
                    }).ToList(),
                    Pausado = todosLosHorarios.Count > 0 && todosLosHorarios.All(h => !h.Activo),
                    TipoTratamiento = item.Tratamiento.TipoPlan,
                    DiasActivos = item.Tratamiento.DiasActivos,
                    DiasDescanso = item.Tratamiento.DiasDescanso,
                    CantidadCiclos = item.Tratamiento.CantidadCiclos,
                    EstadoCiclo = estadoPlan.Estado,
                    CicloActual = estadoPlan.CicloActual,
                    DiaActivoActual = estadoPlan.DiaActivoActual,
                    ProximoCiclo = estadoPlan.ProximoCiclo
                });
            }

            return Ok(resultado);
        }

        IQueryable<Medicamento> query = _context.Medicamentos;

        var medicamentos = await query
            .Select(m => new MedicamentoDto
            {
                IdMedicamento = m.IdMedicamento,
                Nombre = m.Nombre,
                Descripcion = m.Descripcion,
                Presentacion = m.Presentacion,
                IdLaboratorio = m.IdLaboratorio,
                Contraindicaciones = m.Contraindicaciones,
                EfectosSecundarios = m.EfectosSecundarios
            })
            .ToListAsync();

        return Ok(medicamentos);
    }

    [HttpGet("usuario/{idUsuario}")]
    public Task<ActionResult<IEnumerable<MedicamentoDto>>> GetByUsuario(int idUsuario)
    {
        return GetAll(idUsuario);
    }

    [HttpPut("tratamiento/{idTratamiento}/pausa")]
    public async Task<IActionResult> CambiarPausa(int idTratamiento, [FromQuery] int idUsuario, [FromBody] CambiarPausaTratamientoDto dto)
    {
        var tratamiento = await _context.Tratamientos
            .FirstOrDefaultAsync(t => t.IdTratamiento == idTratamiento && t.IdUsuario == idUsuario && (t.FechaFin == null || t.FechaFin.Value.Date >= DateTime.Today));
        if (tratamiento is null) return NotFound();

        var horarios = await _context.Horarios.Where(h => h.IdTratamiento == idTratamiento).ToListAsync();
        foreach (var horario in horarios) horario.Activo = !dto.Pausado;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET: api/medicamentos/5
    [HttpGet("{id}")]
    public async Task<ActionResult<MedicamentoDto>> GetById(int id)
    {
        var medicamento = await _context.Medicamentos.FindAsync(id);

        if (medicamento is null)
            return NotFound();

        var dto = new MedicamentoDto
        {
            IdMedicamento = medicamento.IdMedicamento,
            Nombre = medicamento.Nombre,
            Descripcion = medicamento.Descripcion,
            Presentacion = medicamento.Presentacion,
            IdLaboratorio = medicamento.IdLaboratorio,
            Contraindicaciones = medicamento.Contraindicaciones,
            EfectosSecundarios = medicamento.EfectosSecundarios
        };

        return Ok(dto);
    }

    // POST: api/medicamentos
    [HttpPost]
    public async Task<ActionResult<MedicamentoDto>> Create(MedicamentoCrearDto dto)
    {
        if (dto.IdLaboratorio.HasValue &&
            !await _context.Laboratorios.AnyAsync(l => l.IdLaboratorio == dto.IdLaboratorio.Value))
        {
            return BadRequest("El laboratorio seleccionado no existe.");
        }

        var medicamento = new Medicamento
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Presentacion = dto.Presentacion,
            IdLaboratorio = dto.IdLaboratorio
        };

        _context.Medicamentos.Add(medicamento);
        await _context.SaveChangesAsync();

        if (dto.IdUsuario.HasValue)
        {
            var tratamiento = new Tratamiento
            {
                IdUsuario = dto.IdUsuario.Value,
                IdMedicamento = medicamento.IdMedicamento
            };

            var errorPlan = ConfigurarPlan(tratamiento, dto.TipoTratamiento, dto.FechaInicio, dto.FechaFin, dto.DiasActivos, dto.DiasDescanso, dto.CantidadCiclos);
            if (errorPlan is not null) return BadRequest(errorPlan);

            _context.Tratamientos.Add(tratamiento);
            await _context.SaveChangesAsync();
            await GuardarHorarioTratamiento(tratamiento, medicamento.Nombre, dto.Horario, dto.FrecuenciaHoras, dto.Horarios);
        }

        var result = new MedicamentoDto
        {
            IdMedicamento = medicamento.IdMedicamento,
            Nombre = medicamento.Nombre,
            Descripcion = medicamento.Descripcion,
            Presentacion = medicamento.Presentacion,
            IdLaboratorio = medicamento.IdLaboratorio,
            Contraindicaciones = medicamento.Contraindicaciones,
            EfectosSecundarios = medicamento.EfectosSecundarios
        };

        return CreatedAtAction(nameof(GetById), new { id = medicamento.IdMedicamento }, result);
    }

    [HttpPost("{id}/usuario/{idUsuario}")]
    public async Task<IActionResult> AsociarAUsuario(int id, int idUsuario, [FromBody] MedicamentoAsociarDto? dto)
    {
        var medicamento = await _context.Medicamentos.FindAsync(id);
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.IdUsuario == idUsuario);

        if (medicamento is null || !usuarioExiste)
            return NotFound();

        var tratamiento = await _context.Tratamientos
            .FirstOrDefaultAsync(t => t.IdUsuario == idUsuario && t.IdMedicamento == id);

        if (tratamiento is null)
        {
            tratamiento = new Tratamiento
            {
                IdUsuario = idUsuario,
                IdMedicamento = id
            };

            var errorPlan = ConfigurarPlan(tratamiento, dto?.TipoTratamiento, dto?.FechaInicio, dto?.FechaFin, dto?.DiasActivos, dto?.DiasDescanso, dto?.CantidadCiclos);
            if (errorPlan is not null) return BadRequest(errorPlan);

            _context.Tratamientos.Add(tratamiento);
            await _context.SaveChangesAsync();
        }
        else
        {
            var errorPlan = ConfigurarPlan(tratamiento, dto?.TipoTratamiento, dto?.FechaInicio, dto?.FechaFin, dto?.DiasActivos, dto?.DiasDescanso, dto?.CantidadCiclos);
            if (errorPlan is not null) return BadRequest(errorPlan);
        }

        await GuardarHorarioTratamiento(tratamiento, medicamento.Nombre, dto?.Horario, dto?.FrecuenciaHoras, dto?.Horarios);

        return NoContent();
    }

    // PUT: api/medicamentos/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, MedicamentoActualizarDto dto)
    {
        var medicamento = await _context.Medicamentos.FindAsync(id);

        if (medicamento is null)
            return NotFound();

        if (dto.IdLaboratorio.HasValue &&
            !await _context.Laboratorios.AnyAsync(l => l.IdLaboratorio == dto.IdLaboratorio.Value))
        {
            return BadRequest("El laboratorio seleccionado no existe.");
        }

        medicamento.Nombre = dto.Nombre;
        medicamento.Descripcion = dto.Descripcion;
        medicamento.Presentacion = dto.Presentacion;
        medicamento.IdLaboratorio = dto.IdLaboratorio;

        await _context.SaveChangesAsync();

        if (dto.IdUsuario.HasValue)
        {
            var tratamiento = await _context.Tratamientos
                .FirstOrDefaultAsync(t => t.IdUsuario == dto.IdUsuario.Value && t.IdMedicamento == id);

            if (tratamiento is not null)
            {
                var errorPlan = ConfigurarPlan(tratamiento, dto.TipoTratamiento, dto.FechaInicio, dto.FechaFin, dto.DiasActivos, dto.DiasDescanso, dto.CantidadCiclos);
                if (errorPlan is not null) return BadRequest(errorPlan);
                await GuardarHorarioTratamiento(tratamiento, medicamento.Nombre, dto.Horario, dto.FrecuenciaHoras, dto.Horarios);
            }
        }

        return NoContent();
    }

    private async Task GuardarHorarioTratamiento(
        Tratamiento tratamiento,
        string nombreMedicamento,
        string? horario,
        int? frecuenciaHoras,
        List<string>? horariosPersonalizados)
    {
        var horasExactas = (horariosPersonalizados ?? [])
            .Select(valor => TimeSpan.TryParse(valor, out var horaExacta) ? (TimeSpan?)horaExacta : null)
            .Where(valor => valor.HasValue)
            .Select(valor => valor!.Value)
            .Where(valor => valor >= TimeSpan.Zero && valor < TimeSpan.FromDays(1))
            .Distinct()
            .OrderBy(valor => valor)
            .Take(8)
            .ToList();

        var frecuencia = frecuenciaHoras is 6 or 8 or 12 or 24 ? frecuenciaHoras.Value : 24;
        if (horasExactas.Count == 0)
        {
            if (!TimeSpan.TryParse(horario, out var hora)) return;
            var cantidadTomasCalculadas = 24 / frecuencia;
            for (var indice = 0; indice < cantidadTomasCalculadas; indice++)
            {
                var minutos = (int)hora.TotalMinutes + indice * frecuencia * 60;
                horasExactas.Add(TimeSpan.FromMinutes(minutos % (24 * 60)));
            }
        }

        // SQL Server `time` llega hasta 23:59:59. Una frecuencia diaria (24 h)
        // se representa con NULL y el cliente ya la interpreta como una vez al día.
        tratamiento.Frecuencia = frecuencia == 24 ? null : TimeSpan.FromHours(frecuencia);

        var horariosExistentes = await _context.Horarios
            .Where(h => h.IdTratamiento == tratamiento.IdTratamiento)
            .OrderBy(h => h.IdHorario)
            .ToListAsync();

        for (var indice = 0; indice < horasExactas.Count; indice++)
        {
            var horaProgramada = horasExactas[indice];
            var horarioExistente = horariosExistentes.ElementAtOrDefault(indice);
            Recordatorio? recordatorio = null;

            if (horarioExistente?.IdRecordatorio is int idRecordatorio)
            {
                recordatorio = await _context.Recordatorios.FindAsync(idRecordatorio);
            }

            if (recordatorio is null)
            {
                recordatorio = new Recordatorio
                {
                    Canal = nombreMedicamento,
                    FechaHoraProgramada = DateTime.Today.Add(horaProgramada)
                };
                _context.Recordatorios.Add(recordatorio);

                // El horario necesita el ID generado, pero el recordatorio debe
                // guardarse ya completo: SQL Server no admite DateTime.MinValue.
                await _context.SaveChangesAsync();
            }
            else
            {
                recordatorio.Canal = nombreMedicamento;
                recordatorio.FechaHoraProgramada = DateTime.Today.Add(horaProgramada);
            }

            if (horarioExistente is null)
            {
                _context.Horarios.Add(new Horario
                {
                    HoraProgramada = horaProgramada,
                    Activo = true,
                    IdRecordatorio = recordatorio.IdRecordatorio,
                    IdTratamiento = tratamiento.IdTratamiento
                });
            }
            else
            {
                horarioExistente.HoraProgramada = horaProgramada;
                horarioExistente.Activo = true;
                horarioExistente.IdRecordatorio = recordatorio.IdRecordatorio;
            }
        }

        foreach (var horarioExtra in horariosExistentes.Skip(horasExactas.Count))
        {
            horarioExtra.Activo = false;
        }

        await _context.SaveChangesAsync();
    }

    // DELETE: api/medicamentos/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] int? idUsuario)
    {
        var medicamento = await _context.Medicamentos.FindAsync(id);

        if (medicamento is null)
            return NotFound();

        if (idUsuario.HasValue)
        {
            var tratamientosUsuario = await _context.Tratamientos
                .Where(t => t.IdUsuario == idUsuario.Value && t.IdMedicamento == id)
                .ToListAsync();

            var idsTratamientos = tratamientosUsuario.Select(t => t.IdTratamiento).ToList();
            var horarios = await _context.Horarios
                .Where(h => h.IdTratamiento.HasValue && idsTratamientos.Contains(h.IdTratamiento.Value))
                .ToListAsync();

            foreach (var tratamiento in tratamientosUsuario)
            {
                tratamiento.FechaFin = DateTime.Today.AddDays(-1);
            }

            foreach (var horario in horarios)
            {
                horario.Activo = false;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        _context.Medicamentos.Remove(medicamento);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static DateTime NormalizarFechaInicio(DateTime? fechaInicio, DateTime fechaActual)
    {
        return fechaInicio?.Date ?? fechaActual.Date;
    }

    private static DateTime? NormalizarFechaFin(DateTime? fechaFin)
    {
        return fechaFin?.Date;
    }

    private static string? ConfigurarPlan(
        Tratamiento tratamiento,
        string? tipoSolicitado,
        DateTime? fechaInicio,
        DateTime? fechaFin,
        int? diasActivos,
        int? diasDescanso,
        int? cantidadCiclos)
    {
        var tipo = (tipoSolicitado ?? (fechaFin.HasValue ? "temporal" : "continuo")).Trim().ToLowerInvariant();
        if (tipo == "cronico") tipo = "continuo";
        if (tipo is not ("continuo" or "temporal" or "ciclico"))
            return "El tipo de tratamiento debe ser continuo, temporal o cíclico.";

        tratamiento.FechaInicio = NormalizarFechaInicio(fechaInicio, tratamiento.FechaInicio == default ? DateTime.Today : tratamiento.FechaInicio);
        tratamiento.TipoPlan = tipo;
        tratamiento.DiasActivos = null;
        tratamiento.DiasDescanso = null;
        tratamiento.CantidadCiclos = null;

        if (tipo == "temporal")
        {
            var fin = NormalizarFechaFin(fechaFin);
            if (!fin.HasValue) return "Un tratamiento temporal necesita una fecha de fin.";
            if (fin.Value < tratamiento.FechaInicio) return "La fecha de fin no puede ser anterior al inicio.";
            tratamiento.FechaFin = fin;
            return null;
        }

        if (tipo == "ciclico")
        {
            if (!diasActivos.HasValue || diasActivos is < 1 or > 365) return "Los días activos deben estar entre 1 y 365.";
            if (!diasDescanso.HasValue || diasDescanso is < 1 or > 365) return "Los días de descanso deben estar entre 1 y 365.";
            if (cantidadCiclos is < 1 or > 100) return "La cantidad de ciclos debe estar entre 1 y 100, o quedar vacía.";

            tratamiento.DiasActivos = diasActivos;
            tratamiento.DiasDescanso = diasDescanso;
            tratamiento.CantidadCiclos = cantidadCiclos;
            tratamiento.FechaFin = PlanTratamientoService.CalcularFechaFin(
                tratamiento.FechaInicio,
                diasActivos!.Value,
                diasDescanso!.Value,
                cantidadCiclos);
            return null;
        }

        tratamiento.FechaFin = null;
        return null;
    }
}
