using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CondicionesController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public CondicionesController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/condiciones
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CondicionDto>>> GetAll()
    {
        var condiciones = await _context.Condiciones
            .Select(c => new CondicionDto
            {
                IdCondicion = c.IdCondicion,
                Tipo = c.Tipo
            })
            .ToListAsync();

        return Ok(condiciones);
    }

    // GET: api/condiciones/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CondicionDto>> GetById(int id)
    {
        var condicion = await _context.Condiciones.FindAsync(id);

        if (condicion is null)
            return NotFound();

        var dto = new CondicionDto
        {
            IdCondicion = condicion.IdCondicion,
            Tipo = condicion.Tipo
        };

        return Ok(dto);
    }

    // POST: api/condiciones
    [HttpPost]
    public async Task<ActionResult<CondicionDto>> Create(CondicionCrearDto dto)
    {
        var condicion = new Condicion
        {
            Tipo = dto.Tipo
        };

        _context.Condiciones.Add(condicion);
        await _context.SaveChangesAsync();

        var result = new CondicionDto
        {
            IdCondicion = condicion.IdCondicion,
            Tipo = condicion.Tipo
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = condicion.IdCondicion },
            result
        );
    }

    // PUT: api/condiciones/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CondicionActualizarDto dto)
    {
        var condicion = await _context.Condiciones.FindAsync(id);

        if (condicion is null)
            return NotFound();

        condicion.Tipo = dto.Tipo;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/condiciones/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var condicion = await _context.Condiciones.FindAsync(id);

        if (condicion is null)
            return NotFound();

        _context.Condiciones.Remove(condicion);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}