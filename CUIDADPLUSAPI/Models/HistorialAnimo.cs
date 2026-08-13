using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("HISTORIALES_ANIMO")]
public class HistorialAnimo
{
    [Key]
    [Column("ID_historial_animo")]
    public int IdHistorialAnimo { get; set; }

    [Column("Fecha")]
    public DateTime Fecha { get; set; }

    [Column("Hora")]
    public TimeSpan Hora { get; set; }

    [Column("Observaciones")]
    public string? Observaciones { get; set; }

    [Column("ID_usuario")]
    public int? IdUsuario { get; set; }

    [Column("ID_estado")]
    public int? IdEstado { get; set; }

}