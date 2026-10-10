import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../contracts/intake-v1.schema.json";
import fixture from "../contracts/intake-v1.fixture.json";
import {
  validateIntake,
  boundedBody,
  canonicalJSON,
} from "../supabase/functions/_shared/intake";
const ajv = new Ajv({ strict: false });
addFormats(ajv);
const contract = ajv.compile(schema);
describe("contrato compartido y límites de recepción", () => {
  it("fixture cumple JSON Schema y validador Edge", () => {
    expect(contract(fixture), JSON.stringify(contract.errors)).toBe(true);
    expect(validateIntake(fixture)).toBe(true);
  });
  it.each([
    { ...fixture, contact_consent: false },
    { ...fixture, organization_id: "otro" },
    { ...fixture, assigned_to: "ana" },
    { ...fixture, name: " x" },
    { ...fixture, message: "", items: [] },
    { ...fixture, phone: "0971000000" },
    {
      ...fixture,
      items: [{ description: "Cemento", quantity: 1.5, unit: "bolsa" }],
    },
    { ...fixture, items: Array(51).fill(fixture.items[0]) },
    {
      ...fixture,
      items: [{ description: "Material", quantity: 0, unit: "kg" }],
    },
    { ...fixture, message: "x".repeat(2001) },
  ])("rechaza campos inválidos y routing manipulado", (payload) => {
    expect(contract(payload)).toBe(false);
    expect(validateIntake(payload)).toBe(false);
  });
  it("admite solicitud por ítems sin mensaje y cantidades decimales por unidad", () => {
    const p = {
      ...fixture,
      message: "",
      items: [{ description: "Cable de prueba", quantity: 2.5, unit: "m" }],
    };
    expect(contract(p)).toBe(true);
    expect(validateIntake(p)).toBe(true);
  });
  it("hash canónico no depende del orden de claves y distingue cambios", () => {
    expect(canonicalJSON({ b: 2, a: 1 })).toBe(canonicalJSON({ a: 1, b: 2 }));
    expect(canonicalJSON({ ...fixture, message: "Otro mensaje" })).not.toBe(
      canonicalJSON(fixture),
    );
  });
  it("rechaza tamaño excesivo aun sin Content-Length", async () => {
    const req = new Request("https://test.invalid", {
      method: "POST",
      body: JSON.stringify({ x: "a".repeat(32768) }),
    });
    await expect(boundedBody(req)).rejects.toThrow("size");
  });
  it("lee JSON válido y conserva payload sin truncar", async () => {
    const req = new Request("https://test.invalid", {
      method: "POST",
      body: JSON.stringify(fixture),
    });
    expect(await boundedBody(req)).toEqual(fixture);
  });
});
