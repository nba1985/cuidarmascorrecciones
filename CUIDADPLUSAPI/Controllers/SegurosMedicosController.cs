using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeguroMedicoController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public SeguroMedicoController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/SeguroMedico
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SeguroMedicoDto>>> GetAll()
    {
        var seguros = await _context.SeguroMedicos
            .Select(s => new SeguroMedicoDto
            {
                IdSeguroMedico = s.IdSeguroMedico,
                Compania = s.Compania,
                NumeroPoliza = s.NumeroPoliza
            })
            .ToListAsync();

        return Ok(seguros);
    }

    // GET: api/SeguroMedico/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SeguroMedicoDto>> GetById(int id)
    {
        var seguro = await _context.SeguroMedicos.FindAsync(id);

        if (seguro is null)
            return NotFound();

        var dto = new SeguroMedicoDto
        {
            IdSeguroMedico = seguro.IdSeguroMedico,
            Compania = seguro.Compania,
            NumeroPoliza = seguro.NumeroPoliza
        };

        return Ok(dto);
    }

    // POST: api/SeguroMedico
    [HttpPost]
    public async Task<ActionResult<SeguroMedicoDto>> Create([FromBody] SeguroMedicoCrearDto crearDto)
    {
        var seguro = new SeguroMedico
        {
            Compania = crearDto.Compania,
            NumeroPoliza = crearDto.NumeroPoliza
        };

        _context.SeguroMedicos.Add(seguro);
        await _context.SaveChangesAsync();

        var dto = new SeguroMedicoDto
        {
            IdSeguroMedico = seguro.IdSeguroMedico,
            Compania = seguro.Compania,
            NumeroPoliza = seguro.NumeroPoliza
        };

        return CreatedAtAction(nameof(GetById), new { id = seguro.IdSeguroMedico }, dto);
    }

    // PUT: api/SeguroMedico/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SeguroMedicoActualizarDto actualizarDto)
    {
        var seguro = await _context.SeguroMedicos.FindAsync(id);

        if (seguro is null)
            return NotFound();

        seguro.Compania = actualizarDto.Compania;
        seguro.NumeroPoliza = actualizarDto.NumeroPoliza;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/SeguroMedico/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var seguro = await _context.SeguroMedicos.FindAsync(id);

        if (seguro is null)
            return NotFound();

        _context.SeguroMedicos.Remove(seguro);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}