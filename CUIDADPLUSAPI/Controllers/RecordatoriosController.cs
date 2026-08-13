using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Services;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecordatoriosController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public RecordatoriosController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/recordatorios
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecordatorioDto>>> GetAll([FromQuery] int? idUsuario)
    {
        IQueryable<Recordatorio> query = _context.Recordatorios;

        if (idUsuario.HasValue)
        {
            var asociaciones = await _context.Horarios
                .Where(h => h.IdRecordatorio.HasValue && h.Activo)
                .Join(
                    _context.Tratamientos.Where(t => t.IdUsuario == idUsuario.Value && (t.FechaFin == null || t.FechaFin.Value.Date >= DateTime.Today)),
                    h => h.IdTratamiento,
                    t => t.IdTratamiento,
                    (h, t) => new { IdRecordatorio = h.IdRecordatorio!.Value, Tratamiento = t }
                )
                .ToListAsync();

            var idsRecordatorios = asociaciones
                .Where(item => PlanTratamientoService.EstaActivoHoy(item.Tratamiento))
                .Select(item => item.IdRecordatorio)
                .Distinct()
                .ToList();

            query = query.Where(r => idsRecordatorios.Contains(r.IdRecordatorio));
        }

        var recordatorios = await query
            .Select(r => new RecordatorioDto
            {
                IdRecordatorio = r.IdRecordatorio,
                Canal = r.Canal,
                FechaHoraProgramada = r.FechaHoraProgramada
            })
            .ToListAsync();

        return Ok(recordatorios);
    }

    // GET: api/recordatorios/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RecordatorioDto>> GetById(int id)
    {
        var recordatorio = await _context.Recordatorios.FindAsync(id);

        if (recordatorio is null)
            return NotFound();

        var dto = new RecordatorioDto
        {
            IdRecordatorio = recordatorio.IdRecordatorio,
            Canal = recordatorio.Canal,
            FechaHoraProgramada = recordatorio.FechaHoraProgramada
        };

        return Ok(dto);
    }

    // POST: api/recordatorios
    [HttpPost]
    public async Task<ActionResult<RecordatorioDto>> Create(RecordatorioCrearDto dto)
    {
        var recordatorio = new Recordatorio
        {
            Canal = dto.Canal,
            FechaHoraProgramada = dto.FechaHoraProgramada
        };

        _context.Recordatorios.Add(recordatorio);
        await _context.SaveChangesAsync();

        var result = new RecordatorioDto
        {
            IdRecordatorio = recordatorio.IdRecordatorio,
            Canal = recordatorio.Canal,
            FechaHoraProgramada = recordatorio.FechaHoraProgramada
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = recordatorio.IdRecordatorio },
            result
        );
    }

    // PUT: api/recordatorios/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, RecordatorioActualizarDto dto)
    {
        var recordatorio = await _context.Recordatorios.FindAsync(id);

        if (recordatorio is null)
            return NotFound();

        recordatorio.Canal = dto.Canal;
        recordatorio.FechaHoraProgramada = dto.FechaHoraProgramada;

        var horariosAsociados = await _context.Horarios
            .Where(h => h.IdRecordatorio == id)
            .ToListAsync();
        foreach (var horario in horariosAsociados)
        {
            horario.HoraProgramada = dto.FechaHoraProgramada.TimeOfDay;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/posponer")]
    public async Task<ActionResult<RecordatorioDto>> Posponer(int id, [FromQuery] int minutos = 10)
    {
        if (minutos < 1 || minutos > 120)
            return BadRequest(new { message = "La postergación debe ser de entre 1 y 120 minutos." });

        var recordatorio = await _context.Recordatorios.FindAsync(id);
        if (recordatorio is null) return NotFound();

        recordatorio.FechaHoraProgramada = DateTime.Now.AddMinutes(minutos);
        await _context.SaveChangesAsync();

        return Ok(new RecordatorioDto
        {
            IdRecordatorio = recordatorio.IdRecordatorio,
            Canal = recordatorio.Canal,
            FechaHoraProgramada = recordatorio.FechaHoraProgramada
        });
    }

    // DELETE: api/recordatorios/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var recordatorio = await _context.Recordatorios.FindAsync(id);

        if (recordatorio is null)
            return NotFound();

        _context.Recordatorios.Remove(recordatorio);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
