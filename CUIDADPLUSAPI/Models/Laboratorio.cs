using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("LABORATORIOS")]
public class Laboratorio
{
    [Key]
    [Column("ID_laboratorio")]
    public int IdLaboratorio { get; set; }

    [Column("Nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("Telefono_unico")]
    public string? TelefonoUnico { get; set; }

}