import { describe, it, expect } from "vitest";
import { initialState, team } from "../src/data/fixtures";
import {
  allowedInquiries,
  changeStage,
  overdue,
  primaryTask,
  recordAttention,
  viewMatches,
  businessMinutes,
  localDate,
  isPast,
} from "../src/domain/model";
describe("consultas y permisos demo", () => {
  it("agrupa por día de Asunción y compara instantes sin confundir formatos ISO", () => {
    expect(localDate("2026-10-11T01:00:00Z")).toBe("2026-10-10");
    expect(isPast("2026-10-10T14:00:00.000Z")).toBe(false);
    expect(isPast("2026-10-10T13:59:59.999Z")).toBe(true);
  });
  it("mis pendientes no incluye el vendedor B ni cerradas", () => {
    const s = initialState();
    const list = allowedInquiries(s, team[0]);
    expect(list.every((q) => q.assignedTo === "ana")).toBe(true);
    expect(
      list
        .filter((q) => viewMatches(q, "Mis pendientes", s.tasks, "ana"))
        .every((q) => q.stage !== "Cerrada"),
    ).toBe(true);
  });
  it("supervisora conserva dos consultas legítimas del mismo cliente/material", () => {
    const s = initialState();
    expect(
      allowedInquiries(s, team[2]).filter((q) => q.customerId === "c1"),
    ).toHaveLength(2);
  });
  it("la próxima acción deriva sólo de una tarea activa", () => {
    const s = initialState();
    const q = s.inquiries[0];
    expect(primaryTask(q, s.tasks)?.id).toBe(q.primaryTaskId);
    expect(
      primaryTask(
        q,
        s.tasks.map((t) => ({ ...t, done: true })),
      ),
    ).toBeUndefined();
  });
  it("vencida es independiente de etapa y asignación", () => {
    const s = initialState();
    const q = s.inquiries[0];
    expect(overdue({ ...q, assignedTo: null }, s.tasks)).toBe(true);
    expect(overdue({ ...q, stage: "Cerrada" }, s.tasks)).toBe(false);
  });
  it("rechaza transición inválida y versión obsoleta", () => {
    const q = initialState().inquiries[1];
    expect(() => changeStage(q, "Aceptada", q.version)).toThrow("transición");
    expect(() => changeStage(q, "En atención", 0)).toThrow("cambió");
  });
  it("cierre exige resultado, motivos o vínculo", () => {
    const q = initialState().inquiries[0];
    expect(() => changeStage(q, "Cerrada", 1)).toThrow();
    expect(() =>
      changeStage(q, "Cerrada", 1, { outcome: "perdida" }),
    ).toThrow();
    expect(() =>
      changeStage(q, "Cerrada", 1, { outcome: "duplicada", duplicateId: q.id }),
    ).toThrow();
    expect(
      changeStage(q, "Cerrada", 1, { outcome: "consulta resuelta" }).outcome,
    ).toBe("consulta resuelta");
  });
  it("una respuesta manual no cubre una entrada posterior", () => {
    const q = initialState().inquiries[0];
    const later = { ...q, replyOpenedAt: "2026-10-10T14:01:00Z" };
    expect(
      recordAttention(
        later,
        q.replyOpenedAt,
        "Atención manual",
        "Ana",
        "2026-10-10T14:02:00Z",
      ).replyOpenedAt,
    ).toBe(later.replyOpenedAt);
    expect(
      recordAttention(
        q,
        q.replyOpenedAt,
        "Atendida",
        "Ana",
        "2026-10-10T14:02:00Z",
      ).replyOpenedAt,
    ).toBeNull();
  });
  it("calendario excluye noche, fin de semana y feriado en Asunción", () => {
    const schedule = {
      days: [1, 2, 3, 4, 5],
      startHour: 8,
      endHour: 15,
      holidays: ["2026-10-12"],
    };
    expect(
      businessMinutes(
        new Date("2026-10-09T17:30:00Z"),
        new Date("2026-10-12T12:00:00Z"),
        schedule,
      ),
    ).toBe(30);
  });
});
