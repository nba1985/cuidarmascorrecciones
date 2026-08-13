using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;
namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicoController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public MedicoController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/Medico
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MedicoDto>>> GetAll()
    {
        var medicos = await _context.Medicos
            .Select(m => new MedicoDto
            {
                IdMedico = m.IdMedico,
                Nombre = m.Nombre,
                Apellido = m.Apellido,
                Matricula = m.Matricula,
                TelefonoUnico = m.TelefonoUnico,
                Email = m.Email
            })
            .ToListAsync();

        return Ok(medicos);
    }

    // GET: api/Medico/5
    [HttpGet("{id}")]
    public async Task<ActionResult<MedicoDto>> GetById(int id)
    {
        var medico = await _context.Medicos.FindAsync(id);

        if (medico is null)
            return NotFound();

        var dto = new MedicoDto
        {
            IdMedico = medico.IdMedico,
            Nombre = medico.Nombre,
            Apellido = medico.Apellido,
            Matricula = medico.Matricula,
            TelefonoUnico = medico.TelefonoUnico,
            Email = medico.Email
        };

        return Ok(dto);
    }

    // POST: api/Medico
    [HttpPost]
    public async Task<ActionResult<MedicoDto>> Create([FromBody] MedicoCrearDto crearDto)
    {
        var medico = new Medico
        {
            Nombre = crearDto.Nombre,
            Apellido = crearDto.Apellido,
            Matricula = crearDto.Matricula,
            TelefonoUnico = crearDto.TelefonoUnico,
            Email = crearDto.Email
        };

        _context.Medicos.Add(medico);
        await _context.SaveChangesAsync();

        var dto = new MedicoDto
        {
            IdMedico = medico.IdMedico,
            Nombre = medico.Nombre,
            Apellido = medico.Apellido,
            Matricula = medico.Matricula,
            TelefonoUnico = medico.TelefonoUnico,
            Email = medico.Email
        };

        return CreatedAtAction(nameof(GetById), new { id = medico.IdMedico }, dto);
    }

    // PUT: api/Medico/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] MedicoActualizarDto actualizarDto)
    {
        var medico = await _context.Medicos.FindAsync(id);

        if (medico is null)
            return NotFound();

        medico.Nombre = actualizarDto.Nombre;
        medico.Apellido = actualizarDto.Apellido;
        medico.Matricula = actualizarDto.Matricula;
        medico.TelefonoUnico = actualizarDto.TelefonoUnico;
        medico.Email = actualizarDto.Email;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Medico/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var medico = await _context.Medicos.FindAsync(id);

        if (medico is null)
            return NotFound();

        _context.Medicos.Remove(medico);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}