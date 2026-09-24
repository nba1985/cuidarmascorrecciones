import { createWorker } from "tesseract.js";

export type DatosDni = { nombre?: string; apellido?: string; dni?: string; fechaNacimiento?: string };

function limpiar(valor: string) { return valor.replace(/[^\p{L}\s'-]/gu, " ").replace(/\s+/g, " ").trim(); }

export async function leerDni(archivo: File): Promise<DatosDni> {
  const worker = await createWorker("spa+eng");
  try {
    const { data } = await worker.recognize(archivo);
    const texto = data.text.replace(/\r/g, "");
    const campo = (patron: RegExp) => limpiar(texto.match(patron)?.[1] ?? "");
    const dni = texto.match(/(?:DNI|DOCUMENTO|DOC\.?\s*N[°º.]?)\s*[:#-]?\s*([\d.]{7,11})/i)?.[1]?.replace(/\D/g, "")
      ?? texto.match(/\b\d{2}\.\d{3}\.\d{3}\b/)?.[0].replace(/\D/g, "");
    const fechaTexto = texto.match(/(?:FECHA\s+DE\s+NACIMIENTO|NACIMIENTO|BIRTH)\s*[:\s]*([0-3]?\d[./-][01]?\d[./-]\d{4})/i)?.[1];
    let fechaNacimiento: string | undefined;
    if (fechaTexto) {
      const [dia, mes, anio] = fechaTexto.split(/[./-]/).map(Number);
      const fecha = new Date(anio, mes - 1, dia);
      if (fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia) fechaNacimiento = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    }
    return { nombre: campo(/(?:^|\n)\s*NOMBRES?\s*[:\s]+([^\n]+)/i) || undefined,
      apellido: campo(/(?:^|\n)\s*APELLIDOS?\s*[:\s]+([^\n]+)/i) || undefined,
      dni, fechaNacimiento };
  } finally {
    await worker.terminate();
  }
}
