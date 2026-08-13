using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;
namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GrupoSanguineosController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public GrupoSanguineosController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/GrupoSanguineo
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GrupoSanguineoDto>>> GetAll()
    {
        var grupos = await _context.GrupoSanguineos
            .Select(g => new GrupoSanguineoDto
            {
                IdGrupoSanguineo = g.IdGrupoSanguineo,
                Tipo = g.Tipo
            })
            .ToListAsync();

        return Ok(grupos);
    }

    // GET: api/GrupoSanguineo/5
    [HttpGet("{id}")]
    public async Task<ActionResult<GrupoSanguineoDto>> GetById(int id)
    {
        var grupo = await _context.GrupoSanguineos.FindAsync(id);

        if (grupo is null)
            return NotFound();

        var dto = new GrupoSanguineoDto
        {
            IdGrupoSanguineo = grupo.IdGrupoSanguineo,
            Tipo = grupo.Tipo
        };

        return Ok(dto);
    }

    // POST: api/GrupoSanguineo
    [HttpPost]
    public async Task<ActionResult<GrupoSanguineoDto>> Create([FromBody] GrupoSanguineoCrearDto crearDto)
    {
        var grupo = new GrupoSanguineo
        {
            Tipo = crearDto.Tipo
        };

        _context.GrupoSanguineos.Add(grupo);
        await _context.SaveChangesAsync();

        var dto = new GrupoSanguineoDto
        {
            IdGrupoSanguineo = grupo.IdGrupoSanguineo,
            Tipo = grupo.Tipo
        };

        return CreatedAtAction(nameof(GetById), new { id = grupo.IdGrupoSanguineo }, dto);
    }

    // PUT: api/GrupoSanguineo/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] GrupoSanguineoActualizarDto actualizarDto)
    {
        var grupo = await _context.GrupoSanguineos.FindAsync(id);

        if (grupo is null)
            return NotFound();

        grupo.Tipo = actualizarDto.Tipo;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/GrupoSanguineo/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var grupo = await _context.GrupoSanguineos.FindAsync(id);

        if (grupo is null)
            return NotFound();

        _context.GrupoSanguineos.Remove(grupo);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}