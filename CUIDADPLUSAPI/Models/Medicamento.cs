using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("MEDICAMENTOS")]
public class Medicamento
{
    [Key]
    [Column("ID_medicamento")]
    public int IdMedicamento { get; set; }

    [Column("Nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("Descripcion")]
    public string? Descripcion { get; set; }

    [Column("Presentacion")]
    public string? Presentacion { get; set; }

    [Column("ID_laboratorio")]
    public int? IdLaboratorio { get; set; }

    [Column("Contraindicaciones")]
    public string? Contraindicaciones { get; set; }

    [Column("Efectos_secundarios")]
    public string? EfectosSecundarios { get; set; }

}
