using Microsoft.EntityFrameworkCore;
using CuidarPlusAPI.Models;

namespace CuidarPlusAPI.Data;

public class CuidarPlusContext : DbContext
{
    public CuidarPlusContext(DbContextOptions<CuidarPlusContext> options) : base(options) { }

    public DbSet<GrupoSanguineo> GrupoSanguineos { get; set; }
    public DbSet<Alergia> Alergias { get; set; }
    public DbSet<Condicion> Condiciones { get; set; }
    public DbSet<SeguroMedico> SeguroMedicos { get; set; }
    public DbSet<UsuarioTipo> UsuariosTipos { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Telefono> Telefonos { get; set; }
    public DbSet<Laboratorio> Laboratorios { get; set; }
    public DbSet<Medicamento> Medicamentos { get; set; }
    public DbSet<Componente> Componentes { get; set; }
    public DbSet<Medico> Medicos { get; set; }
    public DbSet<Especialidad> Especialidades { get; set; }
    public DbSet<Estado> Estados { get; set; }
    public DbSet<HistorialAnimo> HistorialesAnimo { get; set; }
    public DbSet<Recordatorio> Recordatorios { get; set; }
    public DbSet<Horario> Horarios { get; set; }
    public DbSet<Notificacion> Notificaciones { get; set; }
    public DbSet<Receta> Recetas { get; set; }
    public DbSet<RegistroToma> RegistrosTomas { get; set; }
    public DbSet<Tratamiento> Tratamientos { get; set; }
    public DbSet<PerfilUsuario> PerfilesUsuario { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Mail)
            .IsUnique()
            .HasFilter("[Mail] IS NOT NULL");

        modelBuilder.Entity<Usuario>()
            .Property(u => u.FechaAlta)
            .HasDefaultValueSql("getdate()");

        modelBuilder.Entity<PasswordResetToken>()
            .Property(t => t.FechaCreacion)
            .HasDefaultValueSql("getutcdate()");

        modelBuilder.Entity<PasswordResetToken>()
            .Property(t => t.Usado)
            .HasDefaultValue(false);

        modelBuilder.Entity<Horario>()
            .Property(h => h.Activo)
            .HasDefaultValue(true);

        modelBuilder.Entity<RegistroToma>()
            .Property(r => r.FechaHoraReal)
            .HasDefaultValueSql("getdate()");

        modelBuilder.Entity<PerfilUsuario>()
            .ToView("VW_PerfilUsuario")
            .HasNoKey();

        modelBuilder.Entity<Usuario>()
            .HasOne<GrupoSanguineo>()
            .WithMany()
            .HasForeignKey(u => u.IdGrupoSanguineo)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Usuario>()
            .HasOne<UsuarioTipo>()
            .WithMany()
            .HasForeignKey(u => u.IdUsuarioTipo)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Usuario>()
            .HasOne<Alergia>()
            .WithMany()
            .HasForeignKey(u => u.IdAlergia)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Usuario>()
            .HasOne<Condicion>()
            .WithMany()
            .HasForeignKey(u => u.IdCondicion)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Usuario>()
            .HasOne<SeguroMedico>()
            .WithMany()
            .HasForeignKey(u => u.IdSeguroMedico)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Usuario>()
            .HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(u => u.IdUsuarioPadre)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Telefono>()
            .HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(t => t.IdUsuario)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Medicamento>()
            .HasOne<Laboratorio>()
            .WithMany()
            .HasForeignKey(m => m.IdLaboratorio)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Componente>()
            .HasOne<Medicamento>()
            .WithMany()
            .HasForeignKey(c => c.IdMedicamento)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Especialidad>()
            .HasOne<Medico>()
            .WithMany()
            .HasForeignKey(e => e.IdMedico)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<HistorialAnimo>()
            .HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(h => h.IdUsuario)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<HistorialAnimo>()
            .HasOne<Estado>()
            .WithMany()
            .HasForeignKey(h => h.IdEstado)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Horario>()
            .HasOne<Recordatorio>()
            .WithMany()
            .HasForeignKey(h => h.IdRecordatorio)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Horario>()
            .HasOne<Tratamiento>()
            .WithMany()
            .HasForeignKey(h => h.IdTratamiento)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Notificacion>()
            .HasOne<Recordatorio>()
            .WithMany()
            .HasForeignKey(n => n.IdRecordatorio)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Receta>()
            .HasOne<Medico>()
            .WithMany()
            .HasForeignKey(r => r.IdMedico)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<RegistroToma>()
            .HasOne<Recordatorio>()
            .WithMany()
            .HasForeignKey(r => r.IdRecordatorio)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<RegistroToma>()
            .HasOne<HistorialAnimo>()
            .WithMany()
            .HasForeignKey(r => r.IdHistorialAnimo)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Tratamiento>()
            .HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(t => t.IdUsuario)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Tratamiento>()
            .HasOne<Medicamento>()
            .WithMany()
            .HasForeignKey(t => t.IdMedicamento)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Tratamiento>()
            .HasOne<Receta>()
            .WithMany()
            .HasForeignKey(t => t.IdReceta)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Tratamiento>()
            .HasOne<Medico>()
            .WithMany()
            .HasForeignKey(t => t.IdMedico)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<PasswordResetToken>()
            .HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(t => t.IdUsuario)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
