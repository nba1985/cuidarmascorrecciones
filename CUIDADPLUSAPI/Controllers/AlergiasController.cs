using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;
namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlergiaController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public AlergiaController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/Alergia
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AlergiaDto>>> GetAll()
    {
        var alergias = await _context.Alergias
            .Select(a => new AlergiaDto
            {
                IdAlergia = a.IdAlergia,
                Descripcion = a.Descripcion
            })
            .ToListAsync();

        return Ok(alergias);
    }

    // GET: api/Alergia/5
    [HttpGet("{id}")]
    public async Task<ActionResult<AlergiaDto>> GetById(int id)
    {
        var alergia = await _context.Alergias.FindAsync(id);

        if (alergia is null)
            return NotFound();

        var dto = new AlergiaDto
        {
            IdAlergia = alergia.IdAlergia,
            Descripcion = alergia.Descripcion
        };

        return Ok(dto);
    }

    // POST: api/Alergia
    [HttpPost]
    public async Task<ActionResult<AlergiaDto>> Create([FromBody] AlergiaCrearDto crearDto)
    {
        var alergia = new Alergia
        {
            Descripcion = crearDto.Descripcion
        };

        _context.Alergias.Add(alergia);
        await _context.SaveChangesAsync();

        var dto = new AlergiaDto
        {
            IdAlergia = alergia.IdAlergia,
            Descripcion = alergia.Descripcion
        };

        return CreatedAtAction(nameof(GetById), new { id = alergia.IdAlergia }, dto);
    }

    // PUT: api/Alergia/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AlergiaActualizarDto actualizarDto)
    {
        var alergia = await _context.Alergias.FindAsync(id);

        if (alergia is null)
            return NotFound();

        alergia.Descripcion = actualizarDto.Descripcion;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Alergia/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var alergia = await _context.Alergias.FindAsync(id);

        if (alergia is null)
            return NotFound();

        _context.Alergias.Remove(alergia);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}