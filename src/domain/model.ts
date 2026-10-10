export const stages = [
  "Nueva",
  "En atención",
  "Por presupuestar",
  "Presupuesto enviado",
  "Aceptada",
  "Cerrada",
] as const;
export type Stage = (typeof stages)[number];
export type Role = "propietaria" | "supervisora" | "vendedor";
export type Outcome =
  | "consulta resuelta"
  | "venta declarada"
  | "perdida"
  | "cancelada"
  | "duplicada"
  | "spam";
export type Person = {
  id: string;
  name: string;
  initials: string;
  role: Role;
  color: string;
};
export type Customer = {
  id: string;
  name: string;
  initials: string;
  type: "Particular" | "Empresa";
  location: string;
  note: string;
};
export type Task = {
  id: string;
  inquiryId: string;
  title: string;
  dueAt: string;
  assignedTo: string;
  done: boolean;
  kind: "seguimiento" | "atención" | "preparación";
};
export type Event = {
  id: string;
  at: string;
  kind: "nota" | "sistema" | "manual";
  text: string;
  actor: string;
};
export type Inquiry = {
  id: string;
  reference: string;
  customerId: string;
  subject: string;
  message: string;
  stage: Stage;
  assignedTo: string | null;
  source: "Formulario web" | "Alta manual";
  createdAt: string;
  replyDueAt: string | null;
  replyOpenedAt: string | null;
  primaryTaskId: string | null;
  version: number;
  items: { description: string; quantity: number; unit: string }[];
  events: Event[];
  outcome?: Outcome;
  reason?: string;
  duplicateId?: string;
};
export type QuoteVersion = {
  version: number;
  externalRef: string;
  amount: string;
  date: string;
  validity: string;
};
export type Quote = {
  id: string;
  inquiryId: string;
  status: "Enviado" | "Aceptado" | "Rechazado";
  versions: QuoteVersion[];
  acceptedVersion?: number;
};
export type SavedView = {
  id: string;
  name: string;
  object: string;
  layout: "table" | "kanban";
  base: string;
  stage:
    | Stage
    | ""
    | "Particular"
    | "Empresa"
    | "Enviado"
    | "Aceptado"
    | "Rechazado"
    | "Seguimiento"
    | "Atención"
    | "Preparación";
  owner: string;
  shared: boolean;
  favorite: boolean;
  sort: "urgency" | "name";
  columns: string[];
};
export type DemoState = {
  inquiries: Inquiry[];
  customers: Customer[];
  tasks: Task[];
  quotes: Quote[];
  savedViews: SavedView[];
};
export const DEMO_NOW = "2026-10-10T14:00:00Z";
export function localDate(at: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Asuncion",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date(at))
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export const isPast = (at: string, now = DEMO_NOW) =>
  Date.parse(at) < Date.parse(now);
export const transitions: Record<Stage, readonly Stage[]> = {
  Nueva: ["En atención", "Por presupuestar", "Cerrada"],
  "En atención": ["Por presupuestar", "Cerrada"],
  "Por presupuestar": ["En atención", "Presupuesto enviado", "Cerrada"],
  "Presupuesto enviado": [
    "En atención",
    "Por presupuestar",
    "Aceptada",
    "Cerrada",
  ],
  Aceptada: ["Cerrada", "En atención"],
  Cerrada: ["En atención"],
};
export const primaryTask = (q: Inquiry, tasks: Task[]) =>
  tasks.find((t) => t.id === q.primaryTaskId && !t.done);
export function overdue(q: Inquiry, tasks: Task[], now = DEMO_NOW) {
  if (q.stage === "Cerrada") return false;
  const task = primaryTask(q, tasks);
  return !!(
    (q.replyOpenedAt && q.replyDueAt && isPast(q.replyDueAt, now)) ||
    (task && isPast(task.dueAt, now))
  );
}
export function viewMatches(
  q: Inquiry,
  view: string,
  tasks: Task[],
  userId: string,
  now = DEMO_NOW,
) {
  const open = q.stage !== "Cerrada";
  switch (view) {
    case "Mis pendientes":
      return (
        open &&
        q.assignedTo === userId &&
        (!!q.replyOpenedAt || !!primaryTask(q, tasks))
      );
    case "Sin asignar":
      return open && !q.assignedTo;
    case "Por responder":
      return open && !!q.replyOpenedAt;
    case "Vencidas":
      return overdue(q, tasks, now);
    case "Por presupuestar":
    case "Pendientes de preparar":
      return open && q.stage === "Por presupuestar";
    case "En seguimiento":
      return (
        open &&
        tasks.some(
          (t) => t.inquiryId === q.id && !t.done && t.kind === "seguimiento",
        )
      );
    case "Cerradas":
      return !open;
    default:
      return open;
  }
}
export function allowedInquiries(state: DemoState, person: Person) {
  return state.inquiries.filter(
    (q) => person.role !== "vendedor" || q.assignedTo === person.id,
  );
}
export function changeStage(
  q: Inquiry,
  stage: Stage,
  expectedVersion: number,
  options: {
    outcome?: Outcome;
    reason?: string;
    duplicateId?: string;
    hasQuote?: boolean;
    hasAcceptedQuote?: boolean;
  } = {},
): Inquiry {
  if (q.version !== expectedVersion)
    throw new Error("La consulta cambió. Actualizá antes de continuar.");
  if (!transitions[q.stage].includes(stage))
    throw new Error("Esta transición no está permitida.");
  if (stage === "Presupuesto enviado" && !options.hasQuote)
    throw new Error("Registrá primero el presupuesto externo.");
  if (stage === "Aceptada" && !options.hasAcceptedQuote)
    throw new Error("Registrá la aceptación de una versión del presupuesto.");
  if (
    stage === "Cerrada" &&
    (!options.outcome ||
      (["perdida", "cancelada"].includes(options.outcome) &&
        !options.reason?.trim()) ||
      (options.outcome === "duplicada" &&
        (!options.duplicateId || options.duplicateId === q.id)))
  )
    throw new Error("Indicá un resultado y su motivo o consulta vinculada.");
  return {
    ...q,
    stage,
    version: q.version + 1,
    outcome: stage === "Cerrada" ? options.outcome : undefined,
    reason: options.reason,
    duplicateId: options.duplicateId,
  };
}
// The covered event is captured before recording attention. Later entries remain owed.
export function recordAttention(
  q: Inquiry,
  coveredOpenedAt: string | null,
  text: string,
  actor: string,
  at: string,
): Inquiry {
  if (!text.trim()) throw new Error("Describí el resultado de la atención.");
  const covered = q.replyOpenedAt === coveredOpenedAt;
  return {
    ...q,
    replyOpenedAt: covered ? null : q.replyOpenedAt,
    replyDueAt: covered ? null : q.replyDueAt,
    version: q.version + 1,
    events: [
      ...q.events,
      { id: crypto.randomUUID(), at, kind: "manual", text, actor },
    ],
  };
}
export function businessMinutes(
  start: Date,
  end: Date,
  schedule: {
    days: number[];
    startHour: number;
    endHour: number;
    holidays: string[];
  },
) {
  let minutes = 0;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Asuncion",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let time = start.getTime(); time < end.getTime(); time += 60000) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(time)).map((p) => [p.type, p.value]),
    );
    const date = `${parts.year}-${parts.month}-${parts.day}`;
    if (
      schedule.days.includes(weekdays.indexOf(parts.weekday)) &&
      !schedule.holidays.includes(date) &&
      +parts.hour >= schedule.startHour &&
      +parts.hour < schedule.endHour
    )
      minutes += Math.min(1, (end.getTime() - time) / 60000);
  }
  return minutes;
}
