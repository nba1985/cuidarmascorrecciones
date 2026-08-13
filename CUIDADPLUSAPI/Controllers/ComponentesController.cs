using Microsoft.AspNetCore.Mvc;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ComponenteController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public ComponenteController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/Componente
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ComponenteDto>>> GetAll()
    {
        var componentes = await _context.Componentes
            .Select(c => new ComponenteDto
            {
                IdComponente = c.IdComponente,
                Nombre = c.Nombre,
                Descripcion = c.Descripcion,
                IdMedicamento = c.IdMedicamento
            })
            .ToListAsync();

        return Ok(componentes);
    }

    // GET: api/Componente/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ComponenteDto>> GetById(int id)
    {
        var componente = await _context.Componentes.FindAsync(id);

        if (componente is null)
            return NotFound();

        var dto = new ComponenteDto
        {
            IdComponente = componente.IdComponente,
            Nombre = componente.Nombre,
            Descripcion = componente.Descripcion,
            IdMedicamento = componente.IdMedicamento
        };

        return Ok(dto);
    }

    // POST: api/Componente
    [HttpPost]
    public async Task<ActionResult<ComponenteDto>> Create([FromBody] ComponenteCrearDto crearDto)
    {
        var componente = new Componente
        {
            Nombre = crearDto.Nombre,
            Descripcion = crearDto.Descripcion,
            IdMedicamento = crearDto.IdMedicamento
        };

        _context.Componentes.Add(componente);
        await _context.SaveChangesAsync();

        var dto = new ComponenteDto
        {
            IdComponente = componente.IdComponente,
            Nombre = componente.Nombre,
            Descripcion = componente.Descripcion,
            IdMedicamento = componente.IdMedicamento
        };

        return CreatedAtAction(nameof(GetById), new { id = componente.IdComponente }, dto);
    }

    // PUT: api/Componente/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ComponenteCrearDto actualizarDto)
    {
        var componente = await _context.Componentes.FindAsync(id);

        if (componente is null)
            return NotFound();

        componente.Nombre = actualizarDto.Nombre;
        componente.Descripcion = actualizarDto.Descripcion;
        componente.IdMedicamento = actualizarDto.IdMedicamento;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Componente/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var componente = await _context.Componentes.FindAsync(id);

        if (componente is null)
            return NotFound();

        _context.Componentes.Remove(componente);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
