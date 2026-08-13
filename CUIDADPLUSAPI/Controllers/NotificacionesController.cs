using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificacionController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public NotificacionController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/Notificacion
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificacionDto>>> GetAll()
    {
        var notificaciones = await _context.Notificaciones
            .Select(n => new NotificacionDto
            {
                IdNotificacion = n.IdNotificacion,
                Tipo = n.Tipo,
                Mensaje = n.Mensaje,
                IdRecordatorio = n.IdRecordatorio
            })
            .ToListAsync();

        return Ok(notificaciones);
    }

    // GET: api/Notificacion/5
    [HttpGet("{id}")]
    public async Task<ActionResult<NotificacionDto>> GetById(int id)
    {
        var notificacion = await _context.Notificaciones.FindAsync(id);

        if (notificacion is null)
            return NotFound();

        var dto = new NotificacionDto
        {
            IdNotificacion = notificacion.IdNotificacion,
            Tipo = notificacion.Tipo,
            Mensaje = notificacion.Mensaje,
            IdRecordatorio = notificacion.IdRecordatorio
        };

        return Ok(dto);
    }

    // POST: api/Notificacion
    [HttpPost]
    public async Task<ActionResult<NotificacionDto>> Create([FromBody] NotificacionCrearDto crearDto)
    {
        var notificacion = new Notificacion
        {
            Tipo = crearDto.Tipo,
            Mensaje = crearDto.Mensaje,
            IdRecordatorio = crearDto.IdRecordatorio
        };

        _context.Notificaciones.Add(notificacion);
        await _context.SaveChangesAsync();

        var dto = new NotificacionDto
        {
            IdNotificacion = notificacion.IdNotificacion,
            Tipo = notificacion.Tipo,
            Mensaje = notificacion.Mensaje,
            IdRecordatorio = notificacion.IdRecordatorio
        };

        return CreatedAtAction(nameof(GetById), new { id = notificacion.IdNotificacion }, dto);
    }

    // PUT: api/Notificacion/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] NotificacionActualizarDto actualizarDto)
    {
        var notificacion = await _context.Notificaciones.FindAsync(id);

        if (notificacion is null)
            return NotFound();

        notificacion.Tipo = actualizarDto.Tipo;
        notificacion.Mensaje = actualizarDto.Mensaje;
        notificacion.IdRecordatorio = actualizarDto.IdRecordatorio;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Notificacion/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var notificacion = await _context.Notificaciones.FindAsync(id);

        if (notificacion is null)
            return NotFound();

        _context.Notificaciones.Remove(notificacion);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
