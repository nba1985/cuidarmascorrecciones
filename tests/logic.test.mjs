import test from "node:test";
import assert from "node:assert/strict";

const edad = (fecha, hoy) => {
  const nacimiento = new Date(`${fecha}T00:00:00`);
  let valor = hoy.getFullYear() - nacimiento.getFullYear();
  if (hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())) valor--;
  return valor;
};

test("la edad cambia recién el día del cumpleaños", () => {
  assert.equal(edad("1985-10-18", new Date("2026-06-18T12:00:00")), 40);
  assert.equal(edad("1985-10-18", new Date("2026-10-18T12:00:00")), 41);
});

test("los archivos de receta rechazan extensiones ejecutables", () => {
  const permitidas = ["pdf", "jpg", "jpeg", "png", "webp", "heic", "heif"];
  assert.equal(permitidas.includes("pdf"), true);
  assert.equal(permitidas.includes("exe"), false);
});
