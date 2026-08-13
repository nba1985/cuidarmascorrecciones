using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TratamientosController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public TratamientosController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/tratamientos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TratamientoDto>>> GetAll()
    {
        var tratamientos = await _context.Tratamientos
            .Select(t => new TratamientoDto
            {
                IdTratamiento = t.IdTratamiento,
                FechaInicio = t.FechaInicio,
                FechaFin = t.FechaFin,
                Frecuencia = t.Frecuencia,
                IdUsuario = t.IdUsuario,
                IdMedicamento = t.IdMedicamento,
                IdReceta = t.IdReceta,
                IdMedico = t.IdMedico
            })
            .ToListAsync();

        return Ok(tratamientos);
    }

    // GET: api/tratamientos/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TratamientoDto>> GetById(int id)
    {
        var tratamiento = await _context.Tratamientos.FindAsync(id);

        if (tratamiento is null)
            return NotFound();

        var dto = new TratamientoDto
        {
            IdTratamiento = tratamiento.IdTratamiento,
            FechaInicio = tratamiento.FechaInicio,
            FechaFin = tratamiento.FechaFin,
            Frecuencia = tratamiento.Frecuencia,
            IdUsuario = tratamiento.IdUsuario,
            IdMedicamento = tratamiento.IdMedicamento,
            IdReceta = tratamiento.IdReceta,
            IdMedico = tratamiento.IdMedico
        };

        return Ok(dto);
    }

    // POST: api/tratamientos
    [HttpPost]
    public async Task<ActionResult<TratamientoDto>> Create(TratamientoCrearDto dto)
    {
        var tratamiento = new Tratamiento
        {
            FechaInicio = dto.FechaInicio,
            FechaFin = dto.FechaFin,
            Frecuencia = dto.Frecuencia,
            IdUsuario = dto.IdUsuario,
            IdMedicamento = dto.IdMedicamento,
            IdReceta = dto.IdReceta,
            IdMedico = dto.IdMedico
        };

        _context.Tratamientos.Add(tratamiento);
        await _context.SaveChangesAsync();

        var result = new TratamientoDto
        {
            IdTratamiento = tratamiento.IdTratamiento,
            FechaInicio = tratamiento.FechaInicio,
            FechaFin = tratamiento.FechaFin,
            Frecuencia = tratamiento.Frecuencia,
            IdUsuario = tratamiento.IdUsuario,
            IdMedicamento = tratamiento.IdMedicamento,
            IdReceta = tratamiento.IdReceta,
            IdMedico = tratamiento.IdMedico
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = tratamiento.IdTratamiento },
            result
        );
    }

    // PUT: api/tratamientos/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, TratamientoActualizarDto dto)
    {
        var tratamiento = await _context.Tratamientos.FindAsync(id);

        if (tratamiento is null)
            return NotFound();

        tratamiento.FechaInicio = dto.FechaInicio;
        tratamiento.FechaFin = dto.FechaFin;
        tratamiento.Frecuencia = dto.Frecuencia;
        tratamiento.IdUsuario = dto.IdUsuario;
        tratamiento.IdMedicamento = dto.IdMedicamento;
        tratamiento.IdReceta = dto.IdReceta;
        tratamiento.IdMedico = dto.IdMedico;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/tratamientos/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tratamiento = await _context.Tratamientos.FindAsync(id);

        if (tratamiento is null)
            return NotFound();

        _context.Tratamientos.Remove(tratamiento);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}