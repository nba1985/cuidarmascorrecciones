using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelefonoController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public TelefonoController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/Telefono
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TelefonoDto>>> GetAll()
    {
        var telefonos = await _context.Telefonos
            .Select(t => new TelefonoDto
            {
                IdTelefono = t.IdTelefono,
                Numero = t.Numero,
                Tipo = t.Tipo,
                IdUsuario = t.IdUsuario
            })
            .ToListAsync();

        return Ok(telefonos);
    }

    // GET: api/Telefono/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TelefonoDto>> GetById(int id)
    {
        var telefono = await _context.Telefonos.FindAsync(id);

        if (telefono is null)
            return NotFound();

        var dto = new TelefonoDto
        {
            IdTelefono = telefono.IdTelefono,
            Numero = telefono.Numero,
            Tipo = telefono.Tipo,
            IdUsuario = telefono.IdUsuario
        };

        return Ok(dto);
    }

    // POST: api/Telefono
    [HttpPost]
    public async Task<ActionResult<TelefonoDto>> Create([FromBody] TelefonoCrearDto crearDto)
    {
        var telefono = new Telefono
        {
            Numero = crearDto.Numero,
            Tipo = crearDto.Tipo,
            IdUsuario = crearDto.IdUsuario
        };

        _context.Telefonos.Add(telefono);
        await _context.SaveChangesAsync();

        var dto = new TelefonoDto
        {
            IdTelefono = telefono.IdTelefono,
            Numero = telefono.Numero,
            Tipo = telefono.Tipo,
            IdUsuario = telefono.IdUsuario
        };

        return CreatedAtAction(nameof(GetById), new { id = telefono.IdTelefono }, dto);
    }

    // PUT: api/Telefono/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] TelefonoActualizarDto actualizarDto)
    {
        var telefono = await _context.Telefonos.FindAsync(id);

        if (telefono is null)
            return NotFound();

        telefono.Numero = actualizarDto.Numero;
        telefono.Tipo = actualizarDto.Tipo;
        telefono.IdUsuario = actualizarDto.IdUsuario;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Telefono/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var telefono = await _context.Telefonos.FindAsync(id);

        if (telefono is null)
            return NotFound();

        _context.Telefonos.Remove(telefono);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}