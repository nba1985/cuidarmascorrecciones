using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HorarioController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public HorarioController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/Horario
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HorarioDto>>> GetAll()
    {
        var horarios = await _context.Horarios
            .Select(h => new HorarioDto
            {
                IdHorario = h.IdHorario,
                HoraProgramada = h.HoraProgramada,
                Activo = h.Activo,
                IdRecordatorio = h.IdRecordatorio,
                IdTratamiento = h.IdTratamiento
            })
            .ToListAsync();

        return Ok(horarios);
    }

    // GET: api/Horario/5
    [HttpGet("{id}")]
    public async Task<ActionResult<HorarioDto>> GetById(int id)
    {
        var horario = await _context.Horarios.FindAsync(id);

        if (horario is null)
            return NotFound();

        var dto = new HorarioDto
        {
            IdHorario = horario.IdHorario,
            HoraProgramada = horario.HoraProgramada,
            Activo = horario.Activo,
            IdRecordatorio = horario.IdRecordatorio,
            IdTratamiento = horario.IdTratamiento
        };

        return Ok(dto);
    }

    // POST: api/Horario
    [HttpPost]
    public async Task<ActionResult<HorarioDto>> Create([FromBody] HorarioCrearDto crearDto)
    {
        var horario = new Horario
        {
            HoraProgramada = crearDto.HoraProgramada,
            Activo = crearDto.Activo,
            IdRecordatorio = crearDto.IdRecordatorio,
            IdTratamiento = crearDto.IdTratamiento
        };

        _context.Horarios.Add(horario);
        await _context.SaveChangesAsync();

        var dto = new HorarioDto
        {
            IdHorario = horario.IdHorario,
            HoraProgramada = horario.HoraProgramada,
            Activo = horario.Activo,
            IdRecordatorio = horario.IdRecordatorio,
            IdTratamiento = horario.IdTratamiento
        };

        return CreatedAtAction(nameof(GetById), new { id = horario.IdHorario }, dto);
    }

    // PUT: api/Horario/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] HorarioActualizarDto actualizarDto)
    {
        var horario = await _context.Horarios.FindAsync(id);

        if (horario is null)
            return NotFound();

        horario.HoraProgramada = actualizarDto.HoraProgramada;
        horario.Activo = actualizarDto.Activo;
        horario.IdRecordatorio = actualizarDto.IdRecordatorio;
        horario.IdTratamiento = actualizarDto.IdTratamiento;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Horario/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var horario = await _context.Horarios.FindAsync(id);

        if (horario is null)
            return NotFound();

        _context.Horarios.Remove(horario);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}