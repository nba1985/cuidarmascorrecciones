using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("COMPONENTES")]
public class Componente
{
    [Key]
    [Column("ID_componente")]
    public int IdComponente { get; set; }

    [Column("Nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("Descripcion")]
    public string? Descripcion { get; set; }

    [Column("ID_medicamento")]
    public int? IdMedicamento { get; set; }

}