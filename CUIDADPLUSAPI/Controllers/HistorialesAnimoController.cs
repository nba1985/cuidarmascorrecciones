using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistorialesAnimoController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public HistorialesAnimoController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/historialesanimo
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HistorialAnimoDto>>> GetAll([FromQuery] int? idUsuario)
    {
        var query = _context.HistorialesAnimo.AsQueryable();

        if (idUsuario.HasValue)
        {
            query = query.Where(h => h.IdUsuario == idUsuario.Value);
        }

        var historiales = await query
            .OrderByDescending(h => h.Fecha)
            .ThenByDescending(h => h.Hora)
            .Select(h => new HistorialAnimoDto
            {
                IdHistorialAnimo = h.IdHistorialAnimo,
                Fecha = h.Fecha,
                Hora = h.Hora,
                Observaciones = h.Observaciones,
                IdUsuario = h.IdUsuario,
                IdEstado = h.IdEstado
            })
            .ToListAsync();

        return Ok(historiales);
    }

    // GET: api/historialesanimo/5
    [HttpGet("{id}")]
    public async Task<ActionResult<HistorialAnimoDto>> GetById(int id)
    {
        var historial = await _context.HistorialesAnimo.FindAsync(id);

        if (historial is null)
            return NotFound();

        var dto = new HistorialAnimoDto
        {
            IdHistorialAnimo = historial.IdHistorialAnimo,
            Fecha = historial.Fecha,
            Hora = historial.Hora,
            Observaciones = historial.Observaciones,
            IdUsuario = historial.IdUsuario,
            IdEstado = historial.IdEstado
        };

        return Ok(dto);
    }

    // POST: api/historialesanimo
    [HttpPost]
    public async Task<ActionResult<HistorialAnimoDto>> Create(HistorialAnimoCrearDto dto)
    {
        RegistroToma? registroToma = null;
        if (dto.IdRegistroToma.HasValue)
        {
            registroToma = await _context.RegistrosTomas
                .FirstOrDefaultAsync(r => r.IdRegistroToma == dto.IdRegistroToma.Value);

            if (registroToma is null)
                return BadRequest(new { message = "La toma indicada no existe." });

            if (dto.IdUsuario.HasValue)
            {
                var perteneceAlUsuario = await (
                    from h in _context.Horarios
                    join t in _context.Tratamientos on h.IdTratamiento equals t.IdTratamiento
                    where h.IdRecordatorio == registroToma.IdRecordatorio
                    select t.IdUsuario
                ).AnyAsync(idUsuario => idUsuario == dto.IdUsuario.Value);

                if (!perteneceAlUsuario)
                    return BadRequest(new { message = "La toma no pertenece al usuario actual." });
            }
        }

        var historial = new HistorialAnimo
        {
            Fecha = dto.Fecha,
            Hora = dto.Hora,
            Observaciones = dto.Observaciones,
            IdUsuario = dto.IdUsuario,
            IdEstado = dto.IdEstado
        };

        _context.HistorialesAnimo.Add(historial);
        await _context.SaveChangesAsync();

        if (registroToma is not null)
        {
            registroToma.IdHistorialAnimo = historial.IdHistorialAnimo;
            await _context.SaveChangesAsync();
        }

        var result = new HistorialAnimoDto
        {
            IdHistorialAnimo = historial.IdHistorialAnimo,
            Fecha = historial.Fecha,
            Hora = historial.Hora,
            Observaciones = historial.Observaciones,
            IdUsuario = historial.IdUsuario,
            IdEstado = historial.IdEstado
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = historial.IdHistorialAnimo },
            result
        );
    }

    // PUT: api/historialesanimo/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, HistorialAnimoActualizarDto dto)
    {
        var historial = await _context.HistorialesAnimo.FindAsync(id);

        if (historial is null)
            return NotFound();

        historial.Fecha = dto.Fecha;
        historial.Hora = dto.Hora;
        historial.Observaciones = dto.Observaciones;
        historial.IdUsuario = dto.IdUsuario;
        historial.IdEstado = dto.IdEstado;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/historialesanimo/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var historial = await _context.HistorialesAnimo.FindAsync(id);

        if (historial is null)
            return NotFound();

        _context.HistorialesAnimo.Remove(historial);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
