using CuidarPlusAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace CuidarPlusAPI.Services;

public static class SchemaCiclosInitializer
{
    public static async Task AsegurarAsync(IServiceProvider services)
    {
        try
        {
            await using var scope = services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<CuidarPlusContext>();
            await context.Database.ExecuteSqlRawAsync("""
                IF COL_LENGTH('dbo.TRATAMIENTOS', 'TipoPlan') IS NULL
                    ALTER TABLE dbo.TRATAMIENTOS ADD TipoPlan nvarchar(20) NOT NULL
                    CONSTRAINT DF_TRATAMIENTOS_TipoPlan DEFAULT N'continuo';
                IF COL_LENGTH('dbo.TRATAMIENTOS', 'DiasActivos') IS NULL
                    ALTER TABLE dbo.TRATAMIENTOS ADD DiasActivos int NULL;
                IF COL_LENGTH('dbo.TRATAMIENTOS', 'DiasDescanso') IS NULL
                    ALTER TABLE dbo.TRATAMIENTOS ADD DiasDescanso int NULL;
                IF COL_LENGTH('dbo.TRATAMIENTOS', 'CantidadCiclos') IS NULL
                    ALTER TABLE dbo.TRATAMIENTOS ADD CantidadCiclos int NULL;
                """);
        }
        catch
        {
            // La API puede iniciar aunque SQL Server todavía no esté disponible.
            // El script Scripts/AgregarTratamientosCiclicos.sql permite aplicar
            // manualmente el mismo cambio antes de volver a ejecutar la API.
        }
    }
}
