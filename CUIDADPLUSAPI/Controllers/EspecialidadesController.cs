using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EspecialidadesController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public EspecialidadesController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/especialidades
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EspecialidadDto>>> GetAll()
    {
        var especialidades = await _context.Especialidades
            .Select(e => new EspecialidadDto
            {
                IdEspecialidad = e.IdEspecialidad,
                Nombre = e.Nombre,
                IdMedico = e.IdMedico
            })
            .ToListAsync();

        return Ok(especialidades);
    }

    // GET: api/especialidades/5
    [HttpGet("{id}")]
    public async Task<ActionResult<EspecialidadDto>> GetById(int id)
    {
        var especialidad = await _context.Especialidades.FindAsync(id);

        if (especialidad is null)
            return NotFound();

        var dto = new EspecialidadDto
        {
            IdEspecialidad = especialidad.IdEspecialidad,
            Nombre = especialidad.Nombre,
            IdMedico = especialidad.IdMedico
        };

        return Ok(dto);
    }

    // POST: api/especialidades
    [HttpPost]
    public async Task<ActionResult<EspecialidadDto>> Create(EspecialidadCrearDto dto)
    {
        var especialidad = new Especialidad
        {
            Nombre = dto.Nombre,
            IdMedico = dto.IdMedico
        };

        _context.Especialidades.Add(especialidad);
        await _context.SaveChangesAsync();

        var result = new EspecialidadDto
        {
            IdEspecialidad = especialidad.IdEspecialidad,
            Nombre = especialidad.Nombre,
            IdMedico = especialidad.IdMedico
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = especialidad.IdEspecialidad },
            result
        );
    }

    // PUT: api/especialidades/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, EspecialidadActualizarDto dto)
    {
        var especialidad = await _context.Especialidades.FindAsync(id);

        if (especialidad is null)
            return NotFound();

        especialidad.Nombre = dto.Nombre;
        especialidad.IdMedico = dto.IdMedico;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/especialidades/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var especialidad = await _context.Especialidades.FindAsync(id);

        if (especialidad is null)
            return NotFound();

        _context.Especialidades.Remove(especialidad);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}