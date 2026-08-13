using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;
namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstadoController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public EstadoController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/Estado
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EstadoDto>>> GetAll()
    {
        var estados = await _context.Estados
            .Select(e => new EstadoDto
            {
                IdEstado = e.IdEstado,
                Nombre = e.Nombre
            })
            .ToListAsync();

        return Ok(estados);
    }

    // GET: api/Estado/5
    [HttpGet("{id}")]
    public async Task<ActionResult<EstadoDto>> GetById(int id)
    {
        var estado = await _context.Estados.FindAsync(id);

        if (estado is null)
            return NotFound();

        var dto = new EstadoDto
        {
            IdEstado = estado.IdEstado,
            Nombre = estado.Nombre
        };

        return Ok(dto);
    }

    // POST: api/Estado
    [HttpPost]
    public async Task<ActionResult<EstadoDto>> Create([FromBody] EstadoCrearDto crearDto)
    {
        var estado = new Estado
        {
            Nombre = crearDto.Nombre
        };

        _context.Estados.Add(estado);
        await _context.SaveChangesAsync();

        var dto = new EstadoDto
        {
            IdEstado = estado.IdEstado,
            Nombre = estado.Nombre
        };

        return CreatedAtAction(nameof(GetById), new { id = estado.IdEstado }, dto);
    }

    // PUT: api/Estado/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] EstadoActualizarDto actualizarDto)
    {
        var estado = await _context.Estados.FindAsync(id);

        if (estado is null)
            return NotFound();

        estado.Nombre = actualizarDto.Nombre;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Estado/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var estado = await _context.Estados.FindAsync(id);

        if (estado is null)
            return NotFound();

        _context.Estados.Remove(estado);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}