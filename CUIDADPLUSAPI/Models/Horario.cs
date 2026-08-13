using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("HORARIOS")]
public class Horario
{
    [Key]
    [Column("ID_horario")]
    public int IdHorario { get; set; }

    [Column("Hora_programada")]
    public TimeSpan HoraProgramada { get; set; }

    [Column("Activo")]
    public bool Activo { get; set; }

    [Column("ID_recordatorio")]
    public int? IdRecordatorio { get; set; }

    [Column("ID_tratamiento")]
    public int? IdTratamiento { get; set; }

}