using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;
namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LaboratorioController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public LaboratorioController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/Laboratorio
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LaboratorioDto>>> GetAll()
    {
        var laboratorios = await _context.Laboratorios
            .Select(l => new LaboratorioDto
            {
                IdLaboratorio = l.IdLaboratorio,
                Nombre = l.Nombre,
                TelefonoUnico = l.TelefonoUnico
            })
            .ToListAsync();

        return Ok(laboratorios);
    }

    // GET: api/Laboratorio/5
    [HttpGet("{id}")]
    public async Task<ActionResult<LaboratorioDto>> GetById(int id)
    {
        var laboratorio = await _context.Laboratorios.FindAsync(id);

        if (laboratorio is null)
            return NotFound();

        var dto = new LaboratorioDto
        {
            IdLaboratorio = laboratorio.IdLaboratorio,
            Nombre = laboratorio.Nombre,
            TelefonoUnico = laboratorio.TelefonoUnico
        };

        return Ok(dto);
    }

    // POST: api/Laboratorio
    [HttpPost]
    public async Task<ActionResult<LaboratorioDto>> Create([FromBody] LaboratorioCrearDto crearDto)
    {
        var laboratorio = new Laboratorio
        {
            Nombre = crearDto.Nombre,
            TelefonoUnico = crearDto.TelefonoUnico
        };

        _context.Laboratorios.Add(laboratorio);
        await _context.SaveChangesAsync();

        var dto = new LaboratorioDto
        {
            IdLaboratorio = laboratorio.IdLaboratorio,
            Nombre = laboratorio.Nombre,
            TelefonoUnico = laboratorio.TelefonoUnico
        };

        return CreatedAtAction(nameof(GetById), new { id = laboratorio.IdLaboratorio }, dto);
    }

    // PUT: api/Laboratorio/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] LaboratorioActualizarDto actualizarDto)
    {
        var laboratorio = await _context.Laboratorios.FindAsync(id);

        if (laboratorio is null)
            return NotFound();

        laboratorio.Nombre = actualizarDto.Nombre;
        laboratorio.TelefonoUnico = actualizarDto.TelefonoUnico;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Laboratorio/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var laboratorio = await _context.Laboratorios.FindAsync(id);

        if (laboratorio is null)
            return NotFound();

        _context.Laboratorios.Remove(laboratorio);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}