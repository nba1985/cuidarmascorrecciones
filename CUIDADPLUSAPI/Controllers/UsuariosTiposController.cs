using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosTiposController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public UsuariosTiposController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/usuariostipos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioTipoDto>>> GetAll()
    {
        var usuariosTipos = await _context.UsuariosTipos
            .Select(u => new UsuarioTipoDto
            {
                IdUsuarioTipo = u.IdUsuarioTipo,
                Nombre = u.Nombre
            })
            .ToListAsync();

        return Ok(usuariosTipos);
    }

    // GET: api/usuariostipos/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioTipoDto>> GetById(int id)
    {
        var usuarioTipo = await _context.UsuariosTipos.FindAsync(id);

        if (usuarioTipo is null)
            return NotFound();

        var dto = new UsuarioTipoDto
        {
            IdUsuarioTipo = usuarioTipo.IdUsuarioTipo,
            Nombre = usuarioTipo.Nombre
        };

        return Ok(dto);
    }

    // POST: api/usuariostipos
    [HttpPost]
    public async Task<ActionResult<UsuarioTipoDto>> Create(UsuarioTipoCrearDto dto)
    {
        var usuarioTipo = new UsuarioTipo
        {
            Nombre = dto.Nombre
        };

        _context.UsuariosTipos.Add(usuarioTipo);
        await _context.SaveChangesAsync();

        var result = new UsuarioTipoDto
        {
            IdUsuarioTipo = usuarioTipo.IdUsuarioTipo,
            Nombre = usuarioTipo.Nombre
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = usuarioTipo.IdUsuarioTipo },
            result
        );
    }

    // PUT: api/usuariostipos/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UsuarioTipoActualizarDto dto)
    {
        var usuarioTipo = await _context.UsuariosTipos.FindAsync(id);

        if (usuarioTipo is null)
            return NotFound();

        usuarioTipo.Nombre = dto.Nombre;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/usuariostipos/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var usuarioTipo = await _context.UsuariosTipos.FindAsync(id);

        if (usuarioTipo is null)
            return NotFound();

        _context.UsuariosTipos.Remove(usuarioTipo);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}