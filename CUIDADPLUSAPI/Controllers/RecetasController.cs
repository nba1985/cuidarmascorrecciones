using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;
using CuidarPlusAPI.DTOs;
using CuidarPlusAPI.Data;

namespace CuidarPlusAPI.Controllers;

[ApiController]
[Route("api/Recetas")]
public class RecetaController : ControllerBase
{
    private readonly CuidarPlusContext _context;
    private readonly IWebHostEnvironment _environment;

    public RecetaController(CuidarPlusContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpPost("archivo")]
    public async Task<ActionResult<object>> UploadArchivo(IFormFile archivo)
    {
        const long limiteBytes = 10 * 1024 * 1024;
        var extensionesPermitidas = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"
        };

        if (archivo.Length == 0 || archivo.Length > limiteBytes)
            return BadRequest("El archivo debe pesar entre 1 byte y 10 MB.");

        var extension = Path.GetExtension(archivo.FileName);
        if (!extensionesPermitidas.Contains(extension))
            return BadRequest("Formato no permitido. Usá PDF, JPG, PNG, WEBP, HEIC o HEIF.");

        var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
            ? Path.Combine(_environment.ContentRootPath, "wwwroot")
            : _environment.WebRootPath;
        var carpeta = Path.Combine(webRoot, "uploads", "recetas");
        Directory.CreateDirectory(carpeta);

        var nombreArchivo = $"receta-{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var rutaFisica = Path.Combine(carpeta, nombreArchivo);

        await using var stream = System.IO.File.Create(rutaFisica);
        await archivo.CopyToAsync(stream);

        return Ok(new { ruta = $"/uploads/recetas/{nombreArchivo}", nombreOriginal = Path.GetFileName(archivo.FileName) });
    }

    // GET: api/Receta
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecetaDto>>> GetAll([FromQuery] int? idUsuario)
    {
        IQueryable<Receta> query = _context.Recetas;

        if (idUsuario.HasValue)
        {
            var idsRecetas = _context.Tratamientos
                .Where(t => t.IdUsuario == idUsuario.Value && t.IdReceta.HasValue)
                .Select(t => t.IdReceta!.Value);

            query = query.Where(r => idsRecetas.Contains(r.IdReceta));
        }

        var recetas = await query
            .Select(r => new RecetaDto
            {
                IdReceta = r.IdReceta,
                Archivos = r.Archivos,
                Observaciones = r.Observaciones,
                IdMedico = r.IdMedico
            })
            .ToListAsync();

        return Ok(recetas);
    }

    // GET: api/Receta/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RecetaDto>> GetById(int id)
    {
        var receta = await _context.Recetas.FindAsync(id);

        if (receta is null)
            return NotFound();

        var dto = new RecetaDto
        {
            IdReceta = receta.IdReceta,
            Archivos = receta.Archivos,
            Observaciones = receta.Observaciones,
            IdMedico = receta.IdMedico
        };

        return Ok(dto);
    }

    // POST: api/Receta
    [HttpPost]
    public async Task<ActionResult<RecetaDto>> Create([FromBody] RecetaCrearDto crearDto)
    {
        var receta = new Receta
        {
            Archivos = crearDto.Archivos,
            Observaciones = crearDto.Observaciones,
            IdMedico = crearDto.IdMedico
        };

        _context.Recetas.Add(receta);
        await _context.SaveChangesAsync();

        if (crearDto.IdUsuario.HasValue)
        {
            _context.Tratamientos.Add(new Tratamiento
            {
                FechaInicio = DateTime.Today,
                IdUsuario = crearDto.IdUsuario.Value,
                IdReceta = receta.IdReceta,
                IdMedico = receta.IdMedico
            });

            await _context.SaveChangesAsync();
        }

        var dto = new RecetaDto
        {
            IdReceta = receta.IdReceta,
            Archivos = receta.Archivos,
            Observaciones = receta.Observaciones,
            IdMedico = receta.IdMedico
        };

        return CreatedAtAction(nameof(GetById), new { id = receta.IdReceta }, dto);
    }

    // PUT: api/Receta/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] RecetaActualizarDto actualizarDto)
    {
        var receta = await _context.Recetas.FindAsync(id);

        if (receta is null)
            return NotFound();

        receta.Archivos = actualizarDto.Archivos;
        receta.Observaciones = actualizarDto.Observaciones;
        receta.IdMedico = actualizarDto.IdMedico;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Receta/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] int? idUsuario)
    {
        var receta = await _context.Recetas.FindAsync(id);

        if (receta is null)
            return NotFound();

        if (idUsuario.HasValue)
        {
            var tratamientosUsuario = await _context.Tratamientos
                .Where(t => t.IdUsuario == idUsuario.Value && t.IdReceta == id)
                .ToListAsync();

            _context.Tratamientos.RemoveRange(tratamientosUsuario);
            await _context.SaveChangesAsync();

            var usadaPorOtroUsuario = await _context.Tratamientos.AnyAsync(t => t.IdReceta == id);
            if (usadaPorOtroUsuario)
            {
                return NoContent();
            }
        }

        _context.Recetas.Remove(receta);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
