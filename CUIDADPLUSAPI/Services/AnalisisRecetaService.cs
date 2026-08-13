using System.Text.Json;
using CuidarPlusAPI.DTOs;
using Google.GenAI;
using Google.GenAI.Types;
using GeminiType = Google.GenAI.Types.Type;

namespace CuidarPlusAPI.Services;

public interface IAnalisisRecetaService
{
    Task<AnalisisRecetaDto> AnalizarAsync(IFormFile archivo, CancellationToken cancellationToken);
}

public sealed class AnalisisRecetaService : IAnalisisRecetaService
{
    private const int LimiteBytes = 10 * 1024 * 1024;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AnalisisRecetaService> _logger;

    public AnalisisRecetaService(IConfiguration configuration, ILogger<AnalisisRecetaService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AnalisisRecetaDto> AnalizarAsync(IFormFile archivo, CancellationToken cancellationToken)
    {
        ValidarArchivo(archivo);

        var apiKey = _configuration["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "La lectura inteligente todavía no está configurada. Definí Gemini__ApiKey en el backend.");
        }

        if (apiKey.StartsWith("AQ.", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "La credencial configurada es de Google Cloud Agent Platform y no sirve como clave de Gemini Developer API. Creá una API key en Google AI Studio y guardala como Gemini__ApiKey.");
        }

        await using var stream = archivo.OpenReadStream();
        using var memoria = new MemoryStream();
        await stream.CopyToAsync(memoria, cancellationToken);

        var mime = ObtenerMime(Path.GetExtension(archivo.FileName).ToLowerInvariant());
        var contenido = new Content
        {
            Role = "user",
            Parts =
            [
                Part.FromText(Instrucciones),
                Part.FromBytes(memoria.ToArray(), mime)
            ]
        };

        var configuracion = new GenerateContentConfig
        {
            Temperature = 0,
            ResponseMimeType = "application/json",
            ResponseSchema = CrearEsquema()
        };

        string? texto;
        try
        {
            var cliente = new Client(apiKey: apiKey);
            var respuesta = await cliente.Models.GenerateContentAsync(
                model: _configuration["Gemini:Model"] ?? "gemini-2.5-flash",
                contents: contenido,
                config: configuracion,
                cancellationToken: cancellationToken);
            texto = respuesta.Text;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini no pudo analizar la receta");
            var mensaje = ex.Message.Contains("API_KEY_INVALID", StringComparison.OrdinalIgnoreCase) ||
                          ex.Message.Contains("API key not valid", StringComparison.OrdinalIgnoreCase)
                ? "La API key de Gemini no es válida. Generá una clave en Google AI Studio y actualizá Gemini__ApiKey."
                : ex.Message.Contains("quota", StringComparison.OrdinalIgnoreCase) || ex.Message.Contains("429")
                    ? "Gemini alcanzó el límite gratuito temporal. Esperá unos minutos y volvé a intentar."
                    : "Gemini no pudo analizar el archivo en este momento.";
            throw new HttpRequestException(mensaje, ex);
        }

        if (string.IsNullOrWhiteSpace(texto))
            throw new InvalidOperationException("Gemini no devolvió una lectura utilizable de la receta.");

        AnalisisRecetaDto? resultado;
        try
        {
            resultado = JsonSerializer.Deserialize<AnalisisRecetaDto>(texto, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Gemini devolvió JSON inválido para la receta");
            throw new InvalidOperationException("No se pudo interpretar la respuesta estructurada de Gemini.", ex);
        }

        if (resultado is null)
            throw new InvalidOperationException("No se pudo interpretar la respuesta de la lectura inteligente.");

        resultado.Medicamentos ??= [];
        resultado.AdvertenciasLectura ??= [];
        return resultado;
    }

    private static void ValidarArchivo(IFormFile archivo)
    {
        if (archivo.Length == 0 || archivo.Length > LimiteBytes)
            throw new ArgumentException("El archivo debe pesar entre 1 byte y 10 MB.");

        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        if (extension is not (".pdf" or ".jpg" or ".jpeg" or ".png" or ".webp"))
            throw new ArgumentException("Para la lectura inteligente usá PDF, JPG, PNG o WEBP.");
    }

    private static string ObtenerMime(string extension) => extension switch
    {
        ".pdf" => "application/pdf",
        ".png" => "image/png",
        ".webp" => "image/webp",
        _ => "image/jpeg"
    };

    private static Schema CrearEsquema()
    {
        Schema Texto(string descripcion, bool nullable = false) => new()
        {
            Type = GeminiType.String,
            Description = descripcion,
            Nullable = nullable
        };

        Schema Entero(string descripcion, bool nullable = false) => new()
        {
            Type = GeminiType.Integer,
            Description = descripcion,
            Nullable = nullable
        };

        var medico = new Schema
        {
            Type = GeminiType.Object,
            Properties = new Dictionary<string, Schema>
            {
                ["nombre"] = Texto("Nombre completo visible del médico", true),
                ["matricula"] = Texto("Matrícula profesional visible", true)
            },
            Required = ["nombre", "matricula"],
            PropertyOrdering = ["nombre", "matricula"]
        };

        var medicamento = new Schema
        {
            Type = GeminiType.Object,
            Properties = new Dictionary<string, Schema>
            {
                ["nombre"] = Texto("Nombre del medicamento tal como aparece en la receta"),
                ["presentacion"] = Texto("Dosis o presentación, por ejemplo 500 mg", true),
                ["cantidad"] = Entero("Cantidad total indicada", true),
                ["frecuencia"] = Texto("Frecuencia escrita en lenguaje natural", true),
                ["frecuenciaHoras"] = Entero("Intervalo inequívoco expresado en horas", true),
                ["duracionDias"] = Entero("Duración inequívoca del tratamiento en días", true),
                ["indicaciones"] = Texto("Indicaciones visibles de administración", true),
                ["confianza"] = new Schema
                {
                    Type = GeminiType.Number,
                    Description = "Confianza de lectura entre 0 y 1",
                    Minimum = 0,
                    Maximum = 1
                }
            },
            Required = ["nombre", "presentacion", "cantidad", "frecuencia", "frecuenciaHoras", "duracionDias", "indicaciones", "confianza"],
            PropertyOrdering = ["nombre", "presentacion", "cantidad", "frecuencia", "frecuenciaHoras", "duracionDias", "indicaciones", "confianza"]
        };

        return new Schema
        {
            Type = GeminiType.Object,
            Properties = new Dictionary<string, Schema>
            {
                ["medico"] = medico,
                ["fechaEmision"] = Texto("Fecha de emisión en formato YYYY-MM-DD", true),
                ["medicamentos"] = new Schema
                {
                    Type = GeminiType.Array,
                    Description = "Medicamentos visibles en la receta",
                    Items = medicamento
                },
                ["advertenciasLectura"] = new Schema
                {
                    Type = GeminiType.Array,
                    Description = "Datos ilegibles, ambiguos o que el usuario debe revisar",
                    Items = Texto("Advertencia breve en español")
                },
                ["resumen"] = Texto("Resumen breve de la lectura para revisión del paciente")
            },
            Required = ["medico", "fechaEmision", "medicamentos", "advertenciasLectura", "resumen"],
            PropertyOrdering = ["medico", "fechaEmision", "medicamentos", "advertenciasLectura", "resumen"]
        };
    }

    private const string Instrucciones = """
        Leé esta receta médica y extraé únicamente información visible en el documento.
        No diagnostiques, no completes datos ausentes y no recomiendes cambios de tratamiento.
        Si un dato es ilegible o dudoso, devolvelo como null y agregá una advertencia clara.
        fechaEmision debe usar YYYY-MM-DD cuando pueda determinarse sin ambigüedad.
        frecuenciaHoras solo debe completarse cuando la receta indique un intervalo inequívoco.
        El resumen debe ser breve, en español rioplatense y apto para que el paciente revise la carga.
        La confianza corresponde a la legibilidad de cada medicamento, de 0 a 1.
        """;
}
