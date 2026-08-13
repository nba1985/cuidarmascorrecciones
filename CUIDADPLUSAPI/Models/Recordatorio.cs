using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("RECORDATORIOS")]
public class Recordatorio
{
    [Key]
    [Column("ID_recordatorio")]
    public int IdRecordatorio { get; set; }

    [Column("Canal")]
    public string? Canal { get; set; }

    [Column("FechaHoraProgramada")]
    public DateTime FechaHoraProgramada { get; set; }

}