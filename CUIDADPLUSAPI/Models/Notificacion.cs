using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("NOTIFICACIONES")]
public class Notificacion
{
    [Key]
    [Column("ID_notificacion")]
    public int IdNotificacion { get; set; }

    [Column("Tipo")]
    public string? Tipo { get; set; }

    [Column("Mensaje")]
    public string? Mensaje { get; set; }

    [Column("ID_recordatorio")]
    public int IdRecordatorio { get; set; }

}