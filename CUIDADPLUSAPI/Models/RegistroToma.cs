using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("REGISTROS_TOMAS")]
public class RegistroToma
{
    [Key]
    [Column("ID_registro_toma")]
    public int IdRegistroToma { get; set; }

    [Column("Estado")]
    public bool Estado { get; set; }

    [Column("Fecha_hora_real")]
    public DateTime FechaHoraReal { get; set; }

    [Column("Observaciones")]
    public string? Observaciones { get; set; }

    [Column("ID_recordatorio")]
    public int? IdRecordatorio { get; set; }

    [Column("ID_historial_animo")]
    public int? IdHistorialAnimo { get; set; }

}