import {
  ArrowUpRight,
  Clock,
  ChatCircle,
  Globe,
  User,
  CaretRight,
  CheckCircle,
  Plus,
} from "@phosphor-icons/react";
import { Avatar, StatusBadge } from "../../components/common";
import { team } from "../../data/fixtures";
import {
  primaryTask,
  overdue,
  stages,
  localDate,
  isPast,
  type Inquiry,
  type DemoState,
} from "../../domain/model";
export function attentionLabel(q: Inquiry) {
  return q.replyOpenedAt
    ? "Por responder"
    : q.stage === "Cerrada"
      ? "Finalizada"
      : "Sin deuda de respuesta";
}
export function dueLabel(at: string) {
  const day = localDate(at);
  const time = new Intl.DateTimeFormat("es-PY", {
    timeZone: "America/Asuncion",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(at));
  return `${day === "2026-10-10" ? "Hoy" : new Intl.DateTimeFormat("es-PY", { timeZone: "America/Asuncion", day: "numeric", month: "short" }).format(new Date(at))}, ${time}`;
}
export function DataTable({
  records,
  state,
  onOpen,
  columns,
  selected,
  onSelect,
}: {
  records: Inquiry[];
  state: DemoState;
  onOpen: (id: string) => void;
  columns: string[];
  selected: string[];
  onSelect: (v: string[]) => void;
}) {
  return (
    <>
      <div className="data-table desktop-table">
        <table>
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  aria-label="Seleccionar consultas visibles"
                  checked={
                    records.length > 0 &&
                    records.every((q) => selected.includes(q.id))
                  }
                  onChange={(e) =>
                    onSelect(e.target.checked ? records.map((q) => q.id) : [])
                  }
                />
              </th>
              <th className="subject-col">
                <ChatCircle size={14} /> Asunto / cliente
              </th>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {records.map((q) => {
              const customer = state.customers.find(
                (c) => c.id === q.customerId,
              )!;
              const person = team.find((p) => p.id === q.assignedTo);
              const task = primaryTask(q, state.tasks);
              const isLate = overdue(q, state.tasks);
              return (
                <tr
                  key={q.id}
                  className={selected.includes(q.id) ? "row-selected" : ""}
                >
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar ${q.reference}`}
                      checked={selected.includes(q.id)}
                      onChange={(e) =>
                        onSelect(
                          e.target.checked
                            ? [...selected, q.id]
                            : selected.filter((id) => id !== q.id),
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="subject-cell">
                      <span
                        className={`record-icon ${q.source === "Formulario web" ? "web" : ""}`}
                      >
                        {q.source === "Formulario web" ? (
                          <Globe size={17} />
                        ) : (
                          <ChatCircle size={17} />
                        )}
                      </span>
                      <div>
                        <button
                          className="record-link"
                          onClick={() => onOpen(q.id)}
                        >
                          {q.subject}
                        </button>
                        <span className="customer-line">
                          {customer.name}
                          <span>· {q.reference}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  {columns.map((c) => (
                    <td key={c}>
                      {c === "Etapa" ? (
                        <StatusBadge stage={q.stage} />
                      ) : c === "Responsable" ? (
                        person ? (
                          <div className="person-cell">
                            <Avatar {...person} small />
                            <span>
                              {person.name.split(" ")[0]}{" "}
                              {person.name.split(" ")[1][0]}.
                            </span>
                          </div>
                        ) : (
                          <span className="unassigned">
                            <User size={14} />
                            Sin asignar
                          </span>
                        )
                      ) : c === "Atención" ? (
                        <span
                          className={`attention ${q.replyOpenedAt ? "owed" : ""}`}
                        >
                          <span className="status-dot" />
                          {attentionLabel(q)}
                        </span>
                      ) : c === "Próxima acción" ? (
                        task ? (
                          <span className="task-cell">
                            <CheckCircle size={15} />
                            {task.title}
                          </span>
                        ) : (
                          <span className="muted">Sin acción pendiente</span>
                        )
                      ) : (
                        <span className={isLate ? "due overdue" : "due"}>
                          <Clock size={14} />
                          {task
                            ? dueLabel(task.dueAt)
                            : q.replyDueAt
                              ? dueLabel(q.replyDueAt)
                              : "Sin vencimiento"}
                          {isLate && (
                            <small>
                              Vencida
                              {q.replyOpenedAt &&
                              q.replyDueAt &&
                              isPast(q.replyDueAt)
                                ? " · respuesta"
                                : " · tarea"}
                            </small>
                          )}
                        </span>
                      )}
                    </td>
                  ))}
                  <td>
                    <button
                      className="icon-button row-open"
                      onClick={() => onOpen(q.id)}
                      aria-label={`Abrir ${q.reference}`}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mobile-list">
        {records.map((q) => {
          const customer = state.customers.find((c) => c.id === q.customerId)!;
          const task = primaryTask(q, state.tasks);
          return (
            <button
              className="mobile-record"
              key={q.id}
              onClick={() => onOpen(q.id)}
            >
              <span className="flex justify-between items-center">
                <small>
                  {q.reference} · {customer.name}
                </small>
                <CaretRight size={18} />
              </span>
              <strong>{q.subject}</strong>
              <span>
                <StatusBadge stage={q.stage} />
                {overdue(q, state.tasks) && (
                  <span className="text-danger">Vencida</span>
                )}
              </span>
              <span className="muted">{task?.title || attentionLabel(q)}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
export function Kanban({
  records,
  state,
  onOpen,
  onStage,
}: {
  records: Inquiry[];
  state: DemoState;
  onOpen: (id: string) => void;
  onStage: (q: Inquiry, s: Inquiry["stage"]) => void;
}) {
  return (
    <div className="kanban">
      {stages.map((stage) => {
        const qs = records.filter((q) => q.stage === stage);
        return (
          <section
            className="kanban-column"
            key={stage}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const q = records.find(
                (q) => q.id === e.dataTransfer.getData("text/plain"),
              );
              if (q) onStage(q, stage);
            }}
          >
            <div className="kanban-heading">
              <StatusBadge stage={stage} />
              <span>{qs.length}</span>
            </div>
            {qs.map((q) => (
              <article
                className="kanban-card"
                key={q.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", q.id)}
              >
                <small>{q.reference}</small>
                <button className="record-link" onClick={() => onOpen(q.id)}>
                  {q.subject}
                </button>
                <p>
                  {state.customers.find((c) => c.id === q.customerId)?.name}
                </p>
                <div className="kanban-bottom">
                  <span
                    className={
                      overdue(q, state.tasks) ? "text-danger" : "muted"
                    }
                  >
                    <Clock size={14} />
                    {primaryTask(q, state.tasks)
                      ? dueLabel(primaryTask(q, state.tasks)!.dueAt)
                      : "Sin tarea"}
                  </span>
                  <button
                    className="icon-button"
                    onClick={() => onOpen(q.id)}
                    aria-label="Abrir para cambiar etapa"
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            ))}
            {qs.length === 0 && (
              <div className="kanban-empty">
                <Plus size={16} />
                Sin consultas en esta etapa
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
