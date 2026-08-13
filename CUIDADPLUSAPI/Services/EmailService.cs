using System.Net;
using System.Net.Mail;

namespace CuidarPlusAPI.Services;

public interface IEmailService
{
    bool EstaConfigurado { get; }
    Task EnviarTokenRecuperacionAsync(string destinatario, string nombre, string token, DateTime expiraUtc, CancellationToken cancellationToken);
}

public sealed class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public SmtpEmailService(IConfiguration configuration) => _configuration = configuration;

    public bool EstaConfigurado =>
        !string.IsNullOrWhiteSpace(_configuration["Email:Host"]) &&
        !string.IsNullOrWhiteSpace(_configuration["Email:FromAddress"]);

    public async Task EnviarTokenRecuperacionAsync(string destinatario, string nombre, string token, DateTime expiraUtc, CancellationToken cancellationToken)
    {
        if (!EstaConfigurado)
            throw new InvalidOperationException("El envío de correo todavía no está configurado en la API.");

        var port = int.TryParse(_configuration["Email:Port"], out var puerto) ? puerto : 587;
        var enableSsl = !bool.TryParse(_configuration["Email:EnableSsl"], out var ssl) || ssl;
        var usuario = _configuration["Email:Username"];

        using var mensaje = new MailMessage
        {
            From = new MailAddress(_configuration["Email:FromAddress"]!, _configuration["Email:FromName"] ?? "CUIDAR+"),
            Subject = "Token para recuperar tu contraseña de CUIDAR+",
            IsBodyHtml = true,
            Body = $"""
                <div style="font-family:Arial,sans-serif;color:#212121;line-height:1.5">
                  <h2 style="color:#2E7D32">Recuperación de contraseña</h2>
                  <p>Hola {WebUtility.HtmlEncode(nombre)},</p>
                  <p>Copiá este token y pegalo en la pantalla de recuperación de CUIDAR+:</p>
                  <p style="padding:16px;border-radius:12px;background:#E8F5E9;font-family:monospace;font-size:18px;word-break:break-all"><strong>{WebUtility.HtmlEncode(token)}</strong></p>
                  <p>El token vence a las {expiraUtc.ToLocalTime():dd/MM/yyyy HH:mm} y solo puede utilizarse una vez.</p>
                  <p>Si no solicitaste este cambio, ignorá este correo.</p>
                </div>
                """
        };
        mensaje.To.Add(destinatario);

        using var cliente = new SmtpClient(_configuration["Email:Host"]!, port)
        {
            EnableSsl = enableSsl,
            UseDefaultCredentials = false,
            Credentials = string.IsNullOrWhiteSpace(usuario)
                ? CredentialCache.DefaultNetworkCredentials
                : new NetworkCredential(usuario, _configuration["Email:Password"])
        };

        await cliente.SendMailAsync(mensaje, cancellationToken);
    }
}
