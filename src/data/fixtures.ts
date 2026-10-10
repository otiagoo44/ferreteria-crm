import type { DemoState, Person, Stage } from "../domain/model";
export const team: Person[] = [
  {
    id: "ana",
    name: "Ana Benítez",
    initials: "AB",
    role: "vendedor",
    color: "violet",
  },
  {
    id: "diego",
    name: "Diego Rojas",
    initials: "DR",
    role: "vendedor",
    color: "blue",
  },
  {
    id: "marta",
    name: "Marta Acosta",
    initials: "MA",
    role: "supervisora",
    color: "green",
  },
  {
    id: "owner",
    name: "Propietaria demo",
    initials: "PO",
    role: "propietaria",
    color: "amber",
  },
];
const names = [
  "Carlos Medina",
  "Constructora Arandú",
  "Lucía Fernández",
  "Miguel Duarte",
  "Taller San Miguel",
  "Sofía Vera",
  "Obras del Chaco",
  "Ramón Núñez",
  "Elena Villalba",
  "Pedro González",
];
const subjects = [
  "Materiales para ampliación",
  "Cemento y varillas para obra",
  "Pintura para fachada",
  "Conexiones para baño",
  "Herramientas para el taller",
  "Chapas para techo",
  "Materiales para vereda",
  "Cableado para vivienda",
  "Grifería para cocina",
  "Consulta sobre tornillería",
  "Otra cotización de cemento",
  "Pintura para una habitación",
];
const initialStages: Stage[] = [
  "Por presupuestar",
  "Nueva",
  "Presupuesto enviado",
  "En atención",
  "Por presupuestar",
  "Presupuesto enviado",
  "Nueva",
  "En atención",
  "Aceptada",
  "Cerrada",
  "Por presupuestar",
  "Cerrada",
];
const assigned = [
  "ana",
  null,
  "ana",
  "ana",
  "diego",
  "ana",
  null,
  "diego",
  "ana",
  "ana",
  "diego",
  "diego",
];
const descriptions = [
  "Cemento para mampostería",
  "Cemento y varilla de 10 mm",
  "Pintura exterior blanca",
  "Caño y conexiones de PVC",
  "Juego de herramientas",
  "Chapas galvanizadas",
  "Material para vereda",
  "Cable eléctrico",
  "Grifería monocomando",
  "Tornillos para madera",
  "Cemento para otra etapa de la obra",
  "Pintura interior",
];
export function initialState(): DemoState {
  const customers = names.map((name, i) => ({
    id: `c${i}`,
    name,
    initials: name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join(""),
    type: (i === 1 || i === 4 || i === 6 ? "Empresa" : "Particular") as
      "Empresa" | "Particular",
    location: "Villa Hayes",
    note: "Registro ficticio para la demostración. Identidad y teléfono no verificados.",
  }));
  const inquiries = subjects.map((subject, i) => ({
    id: `q${i}`,
    reference: `OC-${String(1048 - i).padStart(4, "0")}`,
    customerId: `c${i === 10 ? 1 : i === 11 ? 2 : i}`,
    subject,
    message: `Necesito consultar disponibilidad y presupuesto de ${descriptions[i].toLowerCase()}. Quiero confirmar las cantidades con el vendedor antes de preparar el documento.`,
    stage: initialStages[i],
    assignedTo: assigned[i],
    source: (i % 3 === 0 ? "Formulario web" : "Alta manual") as
      "Formulario web" | "Alta manual",
    createdAt: `2026-10-0${i < 6 ? 9 : 8}T13:00:00Z`,
    replyOpenedAt: [0, 1, 3, 6, 7].includes(i) ? "2026-10-10T12:00:00Z" : null,
    replyDueAt: [0, 1, 3, 6, 7].includes(i)
      ? `2026-10-10T${i === 0 || i === 3 ? "13" : "15"}:00:00Z`
      : null,
    primaryTaskId: i === 9 || i === 11 ? null : `t${i}`,
    version: 1,
    items: [
      {
        description: descriptions[i],
        quantity: i === 0 ? 20 : i === 1 ? 30 : 2,
        unit: i === 0 || i === 1 ? "bolsa" : "por confirmar",
      },
    ],
    events: [
      {
        id: `e${i}`,
        at: "2026-10-09T13:00:00Z",
        kind: "sistema" as const,
        text: "Consulta de demostración creada. Origen registrado; no hay mensajes sincronizados de WhatsApp.",
        actor: "Sistema demo",
      },
    ],
    ...(i === 9 ? { outcome: "consulta resuelta" as const } : {}),
    ...(i === 11
      ? {
          outcome: "perdida" as const,
          reason: "El cliente eligió otra opción (demo).",
        }
      : {}),
  }));
  const tasks = inquiries
    .filter((q) => q.primaryTaskId)
    .map((q, i) => ({
      id: q.primaryTaskId!,
      inquiryId: q.id,
      title: [
        "Preparar presupuesto",
        "Asignar y responder",
        "Confirmar decisión del cliente",
        "Confirmar medida de conexión",
        "Revisar lista de herramientas",
        "Consultar validez del presupuesto",
        "Asignar y responder",
        "Confirmar metros de cable",
        "Registrar resultado declarado",
        "Preparar segunda cotización",
      ][i],
      dueAt: `2026-10-${i === 0 || i === 3 ? "10" : i === 2 || i === 5 ? "12" : "10"}T${i === 0 || i === 3 ? "13" : "16"}:00:00Z`,
      assignedTo: q.assignedTo || "marta",
      done: false,
      kind: (q.stage === "Presupuesto enviado"
        ? "seguimiento"
        : q.stage === "Por presupuestar"
          ? "preparación"
          : "atención") as "seguimiento" | "preparación" | "atención",
    }));
  const quotes = [2, 5, 8].map((i, j) => ({
    id: `p${j}`,
    inquiryId: `q${i}`,
    status: (i === 8 ? "Aceptado" : "Enviado") as "Aceptado" | "Enviado",
    versions: [
      {
        version: 1,
        externalRef: `P-2026-${148 + j}`,
        amount: ["1250000", "3480000", "680000"][j],
        date: "2026-10-09",
        validity: i === 5 ? "2026-10-12" : "2026-10-16",
      },
    ],
    ...(i === 8 ? { acceptedVersion: 1 } : {}),
  }));
  return { inquiries, customers, tasks, quotes, savedViews: [] };
}
