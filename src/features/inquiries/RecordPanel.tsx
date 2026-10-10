import { useState } from "react";
import {
  ArrowSquareOut,
  ChatCircle,
  CheckSquare,
  Clock,
  FileText,
  NotePencil,
  Plus,
  User,
  Globe,
  ArrowRight,
  ShieldCheck,
} from "@phosphor-icons/react";
import {
  Modal,
  Avatar,
  StatusBadge,
  StateMessage,
} from "../../components/common";
import { team } from "../../data/fixtures";
import {
  primaryTask,
  transitions,
  type Inquiry,
  type DemoState,
  type Person,
  type Event,
} from "../../domain/model";
import { dueLabel } from "./Inquiries";
export function ActivityTimeline({ events }: { events: Event[] }) {
  return (
    <div className="activity-timeline">
      {[...events].reverse().map((e) => (
        <div className="activity-event" key={e.id}>
          <span className={`event-icon ${e.kind}`}>
            {e.kind === "nota" ? (
              <NotePencil size={16} />
            ) : e.kind === "manual" ? (
              <User size={16} />
            ) : (
              <Clock size={16} />
            )}
          </span>
          <div>
            <div className="event-meta">
              <strong>{e.actor}</strong>
              <span>
                {e.kind === "manual"
                  ? "Atención manual"
                  : e.kind === "nota"
                    ? "Nota interna"
                    : "Evento de sistema"}
              </span>
            </div>
            <p>{e.text}</p>
            <small>
              {new Intl.DateTimeFormat("es-PY", {
                timeZone: "America/Asuncion",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(e.at))}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}
export function DetailPage({
  inquiry: q,
  state,
  person,
  tab,
  setTab,
  onCustomer,
  onAssign,
  onStage,
  onAction,
  onTaskDone,
}: {
  inquiry: Inquiry;
  state: DemoState;
  person: Person;
  tab: string;
  setTab: (s: string) => void;
  onCustomer: (s: string) => void;
  onAssign: (s: string | null) => void;
  onStage: (s: Inquiry["stage"]) => void;
  onAction: (s: string) => void;
  onTaskDone: (s: string) => void;
}) {
  const customer = state.customers.find((c) => c.id === q.customerId)!;
  const task = primaryTask(q, state.tasks);
  const quotes = state.quotes.filter((p) => p.inquiryId === q.id);
  const tasks = state.tasks.filter((t) => t.inquiryId === q.id);
  const tabs = ["Resumen", "Actividad", "Presupuestos", "Tareas", "Archivos"];
  return (
    <>
      <div className="record-title">
        <span className="record-reference">
          <ChatCircle size={17} />
          {q.reference}
          <span>Datos de demostración</span>
        </span>
        <h1>{q.subject}</h1>
        <button
          className="customer-detail-link"
          onClick={() => onCustomer(customer.id)}
        >
          <Avatar name={customer.name} initials={customer.initials} small />
          {customer.name}
          <ArrowRight size={14} />
        </button>
      </div>
      <div
        className="record-tabs"
        role="tablist"
        aria-label="Ficha de consulta"
      >
        {tabs.map((t, index) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            id={`record-tab-${index}`}
            aria-controls="record-tabpanel"
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
              else if (event.key === "ArrowLeft")
                next = (index + tabs.length - 1) % tabs.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = tabs.length - 1;
              else return;
              event.preventDefault();
              setTab(tabs[next]);
              document.getElementById(`record-tab-${next}`)?.focus();
            }}
          >
            {t}
            {t === "Tareas" && (
              <span>{tasks.filter((x) => !x.done).length}</span>
            )}
          </button>
        ))}
      </div>
      <div
        className="record-body"
        role="tabpanel"
        id="record-tabpanel"
        aria-labelledby={`record-tab-${tabs.indexOf(tab)}`}
      >
        {tab === "Resumen" ? (
          <>
            <div className="record-properties">
              <label>
                Etapa
                <select
                  aria-label="Cambiar etapa"
                  value={q.stage}
                  onChange={(e) => onStage(e.target.value as Inquiry["stage"])}
                >
                  <option>{q.stage}</option>
                  {transitions[q.stage].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Responsable
                <select
                  value={q.assignedTo || ""}
                  disabled={person.role === "vendedor"}
                  onChange={(e) => onAssign(e.target.value || null)}
                >
                  <option value="">Sin asignar</option>
                  {team
                    .filter((p) => p.role === "vendedor")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <div>
                <span>Origen</span>
                <strong>
                  {q.source === "Formulario web" ? (
                    <Globe size={15} />
                  ) : (
                    <User size={15} />
                  )}{" "}
                  {q.source}
                </strong>
              </div>
              <div>
                <span>Atención</span>
                <strong
                  className={q.replyOpenedAt ? "text-warning" : "text-success"}
                >
                  {q.replyOpenedAt
                    ? "Respuesta pendiente"
                    : "Sin deuda de respuesta"}
                </strong>
              </div>
            </div>
            {q.replyOpenedAt && (
              <div className="attention-callout">
                <div>
                  <Clock size={18} />
                  <strong>Esta consulta espera una respuesta</strong>
                </div>
                <p>
                  Origen: {q.source.toLowerCase()}. Plazo demo:{" "}
                  {q.replyDueAt ? dueLabel(q.replyDueAt) : "Por definir"}.
                </p>
                <button
                  className="button primary"
                  onClick={() => onAction("attention")}
                >
                  Registrar atención <ArrowRight size={15} />
                </button>
              </div>
            )}
            <section className="detail-section">
              <h2>Solicitud del cliente</h2>
              <p className="request-message">{q.message}</p>
              <div className="item-list">
                {q.items.map((item, i) => (
                  <div key={i}>
                    <span className="item-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{item.description}</span>
                    <strong>
                      {item.quantity} <small>{item.unit}</small>
                    </strong>
                  </div>
                ))}
              </div>
              <small className="muted">
                Cantidades solicitadas. Disponibilidad y especificaciones por
                confirmar.
              </small>
            </section>
            <section className="detail-section">
              <div className="section-heading">
                <h2>Próxima acción</h2>
                <button
                  className="text-button"
                  onClick={() => onAction("task")}
                >
                  <Plus size={15} /> {task ? "Cambiar" : "Crear tarea"}
                </button>
              </div>
              {task ? (
                <div className="next-action">
                  <CheckSquare size={22} />
                  <div>
                    <strong>{task.title}</strong>
                    <span>
                      {dueLabel(task.dueAt)} ·{" "}
                      {team.find((p) => p.id === task.assignedTo)?.name}
                    </span>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => onTaskDone(task.id)}
                    aria-label="Completar próxima acción"
                  >
                    <CheckSquare size={21} />
                  </button>
                </div>
              ) : (
                <p className="muted">
                  {q.stage === "Cerrada"
                    ? "Consulta finalizada."
                    : "Definí una tarea para que el seguimiento quede visible."}
                </p>
              )}
            </section>
            {q.stage === "Cerrada" && (
              <div className="notice">
                <strong>Resultado: {q.outcome}</strong>
                {q.reason && <p>{q.reason}</p>}
                {q.duplicateId && (
                  <p>
                    Vinculada a{" "}
                    {
                      state.inquiries.find((x) => x.id === q.duplicateId)
                        ?.reference
                    }
                  </p>
                )}
              </div>
            )}
            <section className="detail-section">
              <div className="section-heading">
                <h2>Última actividad</h2>
                <button
                  className="text-button"
                  onClick={() => setTab("Actividad")}
                >
                  Ver todo <ArrowRight size={14} />
                </button>
              </div>
              <ActivityTimeline events={q.events.slice(-2)} />
            </section>
          </>
        ) : tab === "Actividad" ? (
          <>
            <div className="section-heading">
              <h2>Historial de atención</h2>
              <button className="button" onClick={() => onAction("note")}>
                <NotePencil size={17} />
                Añadir nota
              </button>
            </div>
            <div className="notice slim">
              <ShieldCheck size={17} /> Notas, eventos y atención manual se
              distinguen. No hay mensajes verificados de WhatsApp.
            </div>
            <ActivityTimeline events={q.events} />
          </>
        ) : tab === "Presupuestos" ? (
          <>
            <div className="section-heading">
              <h2>Documentos y versiones</h2>
              <button className="button" onClick={() => onAction("quote")}>
                <Plus size={16} />
                Registrar
              </button>
            </div>
            {quotes.length ? (
              quotes.map((p) => (
                <div className="quote-card" key={p.id}>
                  <div className="flex justify-between">
                    <strong>{p.versions.at(-1)!.externalRef}</strong>
                    <StatusBadge stage={p.status} />
                  </div>
                  {[...p.versions].reverse().map((v) => (
                    <div className="quote-version" key={v.version}>
                      <FileText size={22} />
                      <div>
                        <strong>
                          Versión {v.version}
                          {p.acceptedVersion === v.version
                            ? " · Aceptación registrada"
                            : ""}
                        </strong>
                        <span>
                          {v.date} · Válido hasta {v.validity}
                        </span>
                      </div>
                      <strong>
                        {v.amount
                          ? `₲ ${Number(v.amount).toLocaleString("es-PY")}`
                          : "Sin importe"}
                      </strong>
                    </div>
                  ))}
                  <div className="quote-actions">
                    <button
                      className="text-button"
                      onClick={() => onAction("quote")}
                    >
                      Registrar revisión
                    </button>
                    {p.status === "Enviado" && (
                      <>
                        <button
                          className="text-button"
                          onClick={() => onAction(`accept:${p.id}`)}
                        >
                          Registrar aceptación
                        </button>
                        <button
                          className="text-button text-danger"
                          onClick={() => onAction(`reject:${p.id}`)}
                        >
                          Registrar rechazo
                        </button>
                      </>
                    )}
                  </div>
                  <small className="muted">
                    Referencia de un documento externo. Sin archivo real en la
                    demo.
                  </small>
                </div>
              ))
            ) : (
              <StateMessage title="Todavía no hay un presupuesto">
                Prepará el documento fuera del CRM y registrá su referencia
                aquí.
              </StateMessage>
            )}
          </>
        ) : tab === "Tareas" ? (
          <>
            <div className="section-heading">
              <h2>Acciones de esta consulta</h2>
              <button className="button" onClick={() => onAction("task")}>
                <Plus size={16} />
                Crear tarea
              </button>
            </div>
            {tasks.length ? (
              tasks.map((t) => (
                <div
                  className={`task-detail ${t.done ? "completed" : ""}`}
                  key={t.id}
                >
                  <button
                    className="icon-button"
                    aria-label={t.done ? "Tarea completada" : "Completar tarea"}
                    disabled={t.done}
                    onClick={() => onTaskDone(t.id)}
                  >
                    <CheckSquare
                      size={22}
                      weight={t.done ? "fill" : "regular"}
                    />
                  </button>
                  <div>
                    <strong>{t.title}</strong>
                    <span>
                      {dueLabel(t.dueAt)} · {t.kind}
                      {t.id === q.primaryTaskId && !t.done
                        ? " · Principal"
                        : ""}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <StateMessage title="Sin tareas">
                Creá una próxima acción para esta consulta.
              </StateMessage>
            )}
          </>
        ) : (
          <StateMessage
            title="Sin archivos adjuntos"
            action={
              <button className="button" onClick={() => onAction("files")}>
                Ver estado de archivos
              </button>
            }
          >
            Los documentos reales se guardarán en Storage privado. Esta
            demostración no sube ni publica archivos.
          </StateMessage>
        )}
      </div>
      <div className="record-footer">
        <span>WhatsApp manual · sin sincronización</span>
        <button className="button" onClick={() => onAction("whatsapp")}>
          <ChatCircle size={17} />
          Ver atención manual
        </button>
      </div>
    </>
  );
}
export function RecordPanel(
  props: Omit<Parameters<typeof DetailPage>[0], "tab" | "setTab"> & {
    onClose: () => void;
    full: boolean;
    onFull: () => void;
  },
) {
  const [tab, setTab] = useState("Resumen");
  return (
    <Modal title="Consulta" onClose={props.onClose} side full={props.full}>
      <div className="panel-context">
        <span>Ficha de consulta</span>
        <button className="text-button" onClick={props.onFull}>
          <ArrowSquareOut size={16} />
          {props.full ? "Volver al panel" : "Abrir ficha completa"}
        </button>
      </div>
      <DetailPage {...props} tab={tab} setTab={setTab} />
    </Modal>
  );
}
