using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuidarPlusAPI.Models;

[Table("SEGUROS_MEDICOS")]
public class SeguroMedico
{
    [Key]
    [Column("ID_Seguro_medico")]
    public int IdSeguroMedico { get; set; }

    [Column("Compania")]
    public string Compania { get; set; } = string.Empty;

    [Column("Numero_poliza")]
    public string NumeroPoliza { get; set; } = string.Empty;

}