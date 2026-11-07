import { expect, test } from "@playwright/test";
import { toReading } from "../lib/temperature";

// Lógica pura (no necesita servidor ni red): interpretación de la respuesta del NWS.
test.describe("toReading", () => {
  test("lee °C del NWS y redondea a 1 decimal", () => {
    const r = toReading({ properties: { temperature: { value: 21.7777, unitCode: "wmoUnit:degC" }, timestamp: "2026-11-06T22:00:00Z" } });
    expect(r).toEqual({ celsius: 21.8, observedAt: "2026-11-06T22:00:00Z", station: "KSMO" });
  });
  test("convierte °F si el servicio cambiara de unidad", () => {
    expect(toReading({ properties: { temperature: { value: 68, unitCode: "wmoUnit:degF" } } })?.celsius).toBe(20);
  });
  test("sin temperatura (null) → null, para probar otra observación", () => {
    expect(toReading({ properties: { temperature: { value: null } } })).toBeNull();
    expect(toReading({ properties: {} })).toBeNull();
    expect(toReading(undefined)).toBeNull();
  });
  test("lecturas imposibles se descartan", () => {
    expect(toReading({ properties: { temperature: { value: 400, unitCode: "wmoUnit:degC" } } })).toBeNull();
  });
});
