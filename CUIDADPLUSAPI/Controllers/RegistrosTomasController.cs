using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/RegistrosTomas")]
public class RegistroTomaController : ControllerBase
{
    private readonly CuidarPlusContext _context;

    public RegistroTomaController(CuidarPlusContext context)
    {
        _context = context;
    }

    // GET: api/RegistroToma
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RegistroTomaDto>>> GetAll([FromQuery] int? idUsuario)
    {
        var query =
            from r in _context.RegistrosTomas
            join h in _context.Horarios on r.IdRecordatorio equals h.IdRecordatorio into horarios
            from h in horarios.DefaultIfEmpty()
            join t in _context.Tratamientos on h.IdTratamiento equals t.IdTratamiento into tratamientos
            from t in tratamientos.DefaultIfEmpty()
            join m in _context.Medicamentos on t.IdMedicamento equals m.IdMedicamento into medicamentos
            from m in medicamentos.DefaultIfEmpty()
            select new { Registro = r, Tratamiento = t, Medicamento = m };

        if (idUsuario.HasValue)
        {
            query = query.Where(x =>
                (x.Tratamiento != null && x.Tratamiento.IdUsuario == idUsuario.Value) ||
                (x.Registro.IdHistorialAnimo != null && _context.HistorialesAnimo.Any(h => h.IdHistorialAnimo == x.Registro.IdHistorialAnimo && h.IdUsuario == idUsuario.Value))
            );
        }

        var registros = await query
            .OrderByDescending(x => x.Registro.FechaHoraReal)
            .Select(x => new RegistroTomaDto
            {
                IdRegistroToma = x.Registro.IdRegistroToma,
                Estado = x.Registro.Estado,
                FechaHoraReal = x.Registro.FechaHoraReal,
                Observaciones = x.Registro.Observaciones,
                IdRecordatorio = x.Registro.IdRecordatorio,
                IdHistorialAnimo = x.Registro.IdHistorialAnimo,
                Medicamento = x.Medicamento != null ? x.Medicamento.Nombre : null
            })
            .ToListAsync();

        return Ok(registros);
    }

    // GET: api/RegistroToma/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RegistroTomaDto>> GetById(int id)
    {
        var registro = await _context.RegistrosTomas.FindAsync(id);

        if (registro is null)
            return NotFound();

        var dto = new RegistroTomaDto
        {
            IdRegistroToma = registro.IdRegistroToma,
            Estado = registro.Estado,
            FechaHoraReal = registro.FechaHoraReal,
            Observaciones = registro.Observaciones,
            IdRecordatorio = registro.IdRecordatorio,
            IdHistorialAnimo = registro.IdHistorialAnimo
        };

        return Ok(dto);
    }

    // POST: api/RegistroToma
    [HttpPost]
    public async Task<ActionResult<RegistroTomaDto>> Create([FromBody] RegistroTomaCrearDto crearDto)
    {
        var registro = new RegistroToma
        {
            Estado = crearDto.Estado,
            FechaHoraReal = crearDto.FechaHoraReal,
            Observaciones = crearDto.Observaciones,
            IdRecordatorio = crearDto.IdRecordatorio,
            IdHistorialAnimo = crearDto.IdHistorialAnimo
        };

        _context.RegistrosTomas.Add(registro);
        await _context.SaveChangesAsync();

        var dto = new RegistroTomaDto
        {
            IdRegistroToma = registro.IdRegistroToma,
            Estado = registro.Estado,
            FechaHoraReal = registro.FechaHoraReal,
            Observaciones = registro.Observaciones,
            IdRecordatorio = registro.IdRecordatorio,
            IdHistorialAnimo = registro.IdHistorialAnimo
        };

        return CreatedAtAction(nameof(GetById), new { id = registro.IdRegistroToma }, dto);
    }

    // PUT: api/RegistroToma/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] RegistroTomaActualizarDto actualizarDto)
    {
        var registro = await _context.RegistrosTomas.FindAsync(id);

        if (registro is null)
            return NotFound();

        registro.Estado = actualizarDto.Estado;
        registro.FechaHoraReal = actualizarDto.FechaHoraReal;
        registro.Observaciones = actualizarDto.Observaciones;
        registro.IdRecordatorio = actualizarDto.IdRecordatorio;
        registro.IdHistorialAnimo = actualizarDto.IdHistorialAnimo;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/RegistroToma/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var registro = await _context.RegistrosTomas.FindAsync(id);

        if (registro is null)
            return NotFound();

        _context.RegistrosTomas.Remove(registro);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
