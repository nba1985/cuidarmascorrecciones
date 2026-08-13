using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("TRATAMIENTOS")]
public class Tratamiento
{
    [Key]
    [Column("ID_tratamiento")]
    public int IdTratamiento { get; set; }

    [Column("FechaInicio")]
    public DateTime FechaInicio { get; set; }

    [Column("FechaFin")]
    public DateTime? FechaFin { get; set; }

    [Column("Frecuencia")]
    public TimeSpan? Frecuencia { get; set; }

    [Column("TipoPlan")]
    public string TipoPlan { get; set; } = "continuo";

    [Column("DiasActivos")]
    public int? DiasActivos { get; set; }

    [Column("DiasDescanso")]
    public int? DiasDescanso { get; set; }

    [Column("CantidadCiclos")]
    public int? CantidadCiclos { get; set; }

    [Column("ID_usuario")]
    public int IdUsuario { get; set; }

    [Column("ID_medicamento")]
    public int? IdMedicamento { get; set; }

    [Column("ID_receta")]
    public int? IdReceta { get; set; }

    [Column("ID_medico")]
    public int? IdMedico { get; set; }

}
