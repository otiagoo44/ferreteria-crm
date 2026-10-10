import {
  ArrowRight,
  ChatCircle,
  CheckSquare,
  Clock,
  FileText,
  Globe,
  ShieldCheck,
  User,
  Users,
  WarningCircle,
} from "@phosphor-icons/react";
import { Avatar, StatusBadge, StateMessage } from "../components/common";
import { team } from "../data/fixtures";
import {
  overdue,
  localDate,
  isPast,
  type DemoState,
  type Inquiry,
  type Person,
} from "../domain/model";
import { dueLabel } from "./inquiries/Inquiries";
export function Customers({
  state,
  records,
  search,
  view,
  filter,
  sort,
  columns,
  onCustomer,
}: {
  state: DemoState;
  records: Inquiry[];
  search: string;
  view: string;
  filter: string;
  sort: string;
  columns: string[];
  onCustomer: (s: string) => void;
}) {
  const customers = state.customers
    .filter(
      (c) =>
        records.some((q) => q.customerId === c.id) &&
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        (!filter || c.type === filter) &&
        (view === "Particulares"
          ? c.type === "Particular"
          : view === "Empresas"
            ? c.type === "Empresa"
            : true),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : records.filter((q) => q.customerId === b.id && q.stage !== "Cerrada")
            .length -
          records.filter((q) => q.customerId === a.id && q.stage !== "Cerrada")
            .length,
    );
  return (
    <div className="standard-list">
      {customers.length ? (
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              {columns.includes("Tipo") && <th>Tipo</th>}
              {columns.includes("Localidad") && <th>Localidad</th>}
              {columns.includes("Consultas autorizadas") && (
                <th>Consultas autorizadas</th>
              )}
              {columns.includes("Abiertas") && <th>Abiertas</th>}
              <th />
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <button
                    className="person-cell record-link"
                    onClick={() => onCustomer(c.id)}
                  >
                    <Avatar name={c.name} initials={c.initials} />
                    {c.name}
                  </button>
                </td>
                {columns.includes("Tipo") && (
                  <td>
                    <StatusBadge stage={c.type} />
                  </td>
                )}
                {columns.includes("Localidad") && <td>{c.location}</td>}
                {columns.includes("Consultas autorizadas") && (
                  <td>{records.filter((q) => q.customerId === c.id).length}</td>
                )}
                {columns.includes("Abiertas") && (
                  <td>
                    {
                      records.filter(
                        (q) => q.customerId === c.id && q.stage !== "Cerrada",
                      ).length
                    }
                  </td>
                )}
                <td>
                  <button
                    className="icon-button"
                    onClick={() => onCustomer(c.id)}
                    aria-label={`Ver ${c.name}`}
                  >
                    <ArrowRight size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <StateMessage title="No encontramos clientes">
          Probá otra búsqueda o vista.
        </StateMessage>
      )}
      <div className="list-note">
        <ShieldCheck size={16} />
        El historial muestra sólo las consultas autorizadas. Un teléfono
        compartido no fusiona clientes.
      </div>
    </div>
  );
}
export function Quotes({
  state,
  records,
  search,
  view,
  filter,
  sort,
  columns,
  onOpen,
}: {
  state: DemoState;
  records: Inquiry[];
  search: string;
  view: string;
  filter: string;
  sort: string;
  columns: string[];
  onOpen: (s: string) => void;
}) {
  const quotes = state.quotes
    .filter(
      (p) =>
        records.some((q) => q.id === p.inquiryId) &&
        (!filter || p.status === filter) &&
        p.versions
          .at(-1)!
          .externalRef.toLowerCase()
          .includes(search.toLowerCase()) &&
        (view === "Enviados"
          ? p.status === "Enviado"
          : view === "Aceptados"
            ? p.status === "Aceptado"
            : view === "Rechazados"
              ? p.status === "Rechazado"
              : view === "Por vencer"
                ? p.status === "Enviado" &&
                  p.versions.at(-1)!.validity <= "2026-10-13"
                : true),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.versions
            .at(-1)!
            .externalRef.localeCompare(b.versions.at(-1)!.externalRef)
        : a.versions
            .at(-1)!
            .validity.localeCompare(b.versions.at(-1)!.validity),
    );
  return (
    <div className="standard-list">
      {quotes.length ? (
        <table>
          <thead>
            <tr>
              <th>Referencia externa</th>
              {columns.includes("Consulta / cliente") && (
                <th>Consulta / cliente</th>
              )}
              {columns.includes("Estado") && <th>Estado</th>}
              {columns.includes("Importe PYG") && <th>Importe PYG</th>}
              {columns.includes("Validez") && <th>Validez</th>}
              {columns.includes("Versión") && <th>Versión</th>}
            </tr>
          </thead>
          <tbody>
            {quotes.map((p) => {
              const q = records.find((q) => q.id === p.inquiryId)!;
              const v = p.versions.at(-1)!;
              return (
                <tr key={p.id}>
                  <td>
                    <button
                      className="record-link person-cell"
                      onClick={() => onOpen(q.id)}
                    >
                      <span className="record-icon">
                        <FileText size={19} />
                      </span>
                      {v.externalRef}
                    </button>
                  </td>
                  {columns.includes("Consulta / cliente") && (
                    <td>
                      <strong className="block">{q.subject}</strong>
                      <span className="muted">
                        {
                          state.customers.find((c) => c.id === q.customerId)
                            ?.name
                        }
                      </span>
                    </td>
                  )}
                  {columns.includes("Estado") && (
                    <td>
                      <StatusBadge stage={p.status} />
                    </td>
                  )}
                  {columns.includes("Importe PYG") && (
                    <td>
                      {v.amount
                        ? `₲ ${Number(v.amount).toLocaleString("es-PY")}`
                        : "Sin importe"}
                    </td>
                  )}
                  {columns.includes("Validez") && <td>{v.validity}</td>}
                  {columns.includes("Versión") && (
                    <td>
                      v{v.version}
                      {p.acceptedVersion
                        ? ` · aceptada v${p.acceptedVersion}`
                        : ""}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <StateMessage title="No hay presupuestos en esta vista">
          Los presupuestos registrados aparecerán aquí.
        </StateMessage>
      )}
      <div className="list-note">
        <FileText size={16} />
        Seguimiento de documentos externos. Un presupuesto aceptado no significa
        cobro ni entrega.
      </div>
    </div>
  );
}
export function Tasks({
  state,
  records,
  view,
  search,
  filter,
  sort,
  columns,
  onDone,
  onOpen,
}: {
  state: DemoState;
  records: Inquiry[];
  view: string;
  search: string;
  filter: string;
  sort: string;
  columns: string[];
  onDone: (s: string) => void;
  onOpen: (s: string) => void;
}) {
  const tasks = state.tasks.filter(
    (t) =>
      records.some((q) => q.id === t.inquiryId) &&
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      (!filter || t.kind === filter.toLowerCase()) &&
      (view === "Completadas"
        ? t.done
        : !t.done &&
          (view === "Vencidas"
            ? isPast(t.dueAt)
            : view === "Próximas"
              ? localDate(t.dueAt) > "2026-10-10"
              : localDate(t.dueAt) === "2026-10-10")),
  );
  return (
    <div className="task-list-page">
      {tasks.length ? (
        tasks
          .sort((a, b) =>
            sort === "name"
              ? a.title.localeCompare(b.title)
              : a.dueAt.localeCompare(b.dueAt),
          )
          .map((t) => {
            const q = records.find((q) => q.id === t.inquiryId)!;
            return (
              <div
                className={`task-list-row ${t.done ? "completed" : ""}`}
                key={t.id}
              >
                <button
                  className="icon-button"
                  disabled={t.done}
                  aria-label={`Completar ${t.title}`}
                  onClick={() => onDone(t.id)}
                >
                  <CheckSquare size={23} weight={t.done ? "fill" : "regular"} />
                </button>
                <div>
                  <strong>{t.title}</strong>
                  {columns.includes("Consulta") && (
                    <button
                      className="text-button muted"
                      onClick={() => onOpen(q.id)}
                    >
                      {q.reference} · {q.subject}
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
                {columns.includes("Responsable") && (
                  <span className="task-owner">
                    <Avatar
                      {...team.find((p) => p.id === t.assignedTo)!}
                      small
                    />
                    {
                      team
                        .find((p) => p.id === t.assignedTo)
                        ?.name.split(" ")[0]
                    }
                  </span>
                )}
                {columns.includes("Vencimiento") && (
                  <span
                    className={
                      isPast(t.dueAt) && !t.done ? "due overdue" : "due"
                    }
                  >
                    <Clock size={15} />
                    {dueLabel(t.dueAt)}
                  </span>
                )}
              </div>
            );
          })
      ) : (
        <StateMessage
          title={
            view === "Completadas"
              ? "Aún no hay tareas completadas"
              : "Todo en orden en esta vista"
          }
        >
          Probá Hoy o Próximas para revisar otras acciones.
        </StateMessage>
      )}
    </div>
  );
}
export function Reports({
  state,
  records,
  view,
  person,
  onView,
  onRecord,
}: {
  state: DemoState;
  records: Inquiry[];
  view: string;
  person: Person;
  onView: (s: string) => void;
  onRecord: (id: string) => void;
}) {
  if (person.role === "vendedor")
    return (
      <StateMessage title="Informe reservado a supervisión">
        Cambiá al perfil demo de Marta o Propietaria desde Perfil para revisar
        la atención del equipo.
      </StateMessage>
    );
  const stats = [
    {
      name: "Por responder",
      value: records.filter((q) => q.stage !== "Cerrada" && q.replyOpenedAt)
        .length,
      icon: ChatCircle,
      desc: "Ciclos de atención abiertos",
      view: "Por responder",
    },
    {
      name: "Vencidas",
      value: records.filter((q) => overdue(q, state.tasks)).length,
      icon: WarningCircle,
      desc: "Respuesta o tarea fuera de plazo",
      view: "Vencidas",
    },
    {
      name: "Sin asignar",
      value: records.filter((q) => !q.assignedTo && q.stage !== "Cerrada")
        .length,
      icon: User,
      desc: "En la cola de supervisión",
      view: "Sin asignar",
    },
    {
      name: "En seguimiento",
      value: records.filter(
        (q) =>
          q.stage !== "Cerrada" &&
          state.tasks.some(
            (t) => t.inquiryId === q.id && !t.done && t.kind === "seguimiento",
          ),
      ).length,
      icon: Clock,
      desc: "Con seguimiento activo",
      view: "En seguimiento",
    },
  ];
  const manual = records
    .flatMap((q) => q.events)
    .filter((e) => e.kind === "manual").length;
  return (
    <div className="reports">
      <div className="report-intro">
        <span>Equipo Occidental</span>
        <h2>
          {view === "Resultados"
            ? "Resultados declarados"
            : view === "Seguimiento"
              ? "Lo prometido, con una próxima acción"
              : "Una mirada a la atención del equipo"}
        </h2>
        <p>
          Datos de demostración · Corte al 10 de octubre, 11:00 ·
          America/Asuncion
        </p>
      </div>
      <div className="report-stats">
        {stats.map((s) => (
          <button key={s.name} onClick={() => onView(s.view)}>
            <s.icon size={21} />
            <span>{s.name}</span>
            <strong>{s.value}</strong>
            <small>{s.desc}</small>
            <ArrowRight size={17} />
          </button>
        ))}
      </div>
      {view === "Resumen de atención" && (
        <div className="report-section">
          <div className="section-heading">
            <h3>Carga por responsable</h3>
            <span className="muted">Consultas abiertas</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Responsable</th>
                <th>Abiertas</th>
                <th>Por responder</th>
                <th>Vencidas</th>
              </tr>
            </thead>
            <tbody>
              {team
                .filter((p) => p.role === "vendedor")
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="person-cell">
                        <Avatar {...p} />
                        {p.name}
                      </div>
                    </td>
                    <td>
                      {
                        records.filter(
                          (q) => q.assignedTo === p.id && q.stage !== "Cerrada",
                        ).length
                      }
                    </td>
                    <td>
                      {
                        records.filter(
                          (q) =>
                            q.assignedTo === p.id &&
                            q.replyOpenedAt &&
                            q.stage !== "Cerrada",
                        ).length
                      }
                    </td>
                    <td>
                      {
                        records.filter(
                          (q) =>
                            q.assignedTo === p.id && overdue(q, state.tasks),
                        ).length
                      }
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {view === "Seguimiento" && (
        <div className="report-section">
          <h3>Seguimientos programados</h3>
          {state.tasks
            .filter(
              (t) =>
                !t.done &&
                t.kind === "seguimiento" &&
                records.some(
                  (q) => q.id === t.inquiryId && q.stage !== "Cerrada",
                ),
            )
            .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))
            .map((task) => {
              const inquiry = records.find((q) => q.id === task.inquiryId)!;
              return (
                <button
                  className="related-record"
                  key={task.id}
                  onClick={() => onRecord(inquiry.id)}
                >
                  <span>
                    <small>
                      {inquiry.reference} · {dueLabel(task.dueAt)}
                    </small>
                    <strong>{task.title}</strong>
                    <small>
                      {
                        state.customers.find((c) => c.id === inquiry.customerId)
                          ?.name
                      }{" "}
                      · {inquiry.subject}
                    </small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              );
            })}
        </div>
      )}
      {view === "Resultados" && (
        <div className="report-section">
          <h3>Resultados registrados</h3>
          {records
            .filter(
              (q) =>
                q.stage === "Cerrada" ||
                state.quotes.some(
                  (p) => p.inquiryId === q.id && p.status === "Aceptado",
                ),
            )
            .map((q) => (
              <button
                key={q.id}
                className="related-record"
                onClick={() => onRecord(q.id)}
              >
                <span>
                  <small>
                    {q.reference} · {q.outcome || "Presupuesto aceptado"}
                  </small>
                  <strong>{q.subject}</strong>
                  <small>
                    {q.reason ||
                      "Resultado declarado; no demuestra cobro ni entrega."}
                  </small>
                </span>
                <ArrowRight size={17} />
              </button>
            ))}
        </div>
      )}
      <div className="report-section">
        <h3>Resultados y cobertura</h3>
        <div className="result-grid">
          <div>
            <span>Presupuestos aceptados</span>
            <strong>
              {
                state.quotes.filter(
                  (p) =>
                    p.status === "Aceptado" &&
                    records.some((q) => q.id === p.inquiryId),
                ).length
              }
            </strong>
            <small>Aceptación de una revisión, sin duplicar versiones</small>
          </div>
          <div>
            <span>Ventas declaradas</span>
            <strong>
              {
                records.filter(
                  (q) =>
                    q.stage === "Cerrada" && q.outcome === "venta declarada",
                ).length
              }
            </strong>
            <small>Resultado de cierre; no son cobros</small>
          </div>
          <div>
            <span>Atenciones manuales</span>
            <strong>{manual}</strong>
            <small>Declaradas por un usuario; no verificadas</small>
          </div>
          <div>
            <span>Mensajes verificados</span>
            <strong>0</strong>
            <small>WhatsApp todavía no está integrado</small>
          </div>
        </div>
      </div>
      <div className="notice coverage">
        <Globe size={20} />
        <div>
          <strong>Cobertura: formulario y altas manuales</strong>
          <p>
            Los mensajes directos de WhatsApp no se descubren automáticamente.
            Plazos y calendario son ejemplos configurables, no el horario
            confirmado de la ferretería.
          </p>
        </div>
      </div>
    </div>
  );
}
export function Profile({
  person,
  onPerson,
  onReset,
}: {
  person: Person;
  onPerson: (s: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="settings-page">
      <h2>Perfil de demostración</h2>
      <p className="muted">
        Explorá las vistas con distintos roles. Esto no autentica a usuarios
        reales.
      </p>
      <div className="profile-card">
        <Avatar {...person} />
        <div>
          <strong>{person.name}</strong>
          <span>{person.role}</span>
        </div>
      </div>
      <label className="field">
        Cambiar perfil demo
        <select value={person.id} onChange={(e) => onPerson(e.target.value)}>
          {team.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.role}
            </option>
          ))}
        </select>
      </label>
      <div className="notice">
        <ShieldCheck size={20} />
        <div>
          <strong>Acceso real pendiente de configuración</strong>
          <p>
            Auth, invitaciones, MFA y recuperación deben verificarse en un
            Supabase identificado de Occidental antes del piloto.
          </p>
        </div>
      </div>
      <button className="button" onClick={onReset}>
        Restablecer datos de demostración
      </button>
    </div>
  );
}
export function Configuration({
  tab,
  onTab,
  onSave,
  onScenario,
  person,
}: {
  tab: string;
  onTab: (s: string) => void;
  onSave: (data: FormData) => void;
  onScenario: (s: string) => void;
  person: Person;
}) {
  if (person.role === "vendedor")
    return (
      <StateMessage title="Configuración reservada">
        Seleccioná supervisora o propietaria en el perfil demo.
      </StateMessage>
    );
  return (
    <div className="settings-layout">
      <nav className="settings-nav">
        {[
          "Usuarios y roles",
          "Calendario laboral",
          "Límites de atención",
          "Motivos de cierre",
          "Integraciones",
          "Estados de demo",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => onTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      <section className="settings-page">
        <h2>{tab}</h2>
        {tab === "Usuarios y roles" ? (
          <>
            <p className="muted">
              Equipo ficticio. La política definitiva se confirma con la
              propietaria.
            </p>
            {team.map((p) => (
              <div className="user-row" key={p.id}>
                <Avatar {...p} />
                <strong>{p.name}</strong>
                <StatusBadge stage={p.role} />
              </div>
            ))}
            <div className="notice">
              <Users size={19} />
              <p>
                Vendedor: sus consultas y clientes relacionados. Supervisora:
                atención del equipo. Propietaria: administración. Compartir una
                vista no amplía permisos.
              </p>
            </div>
          </>
        ) : tab === "Integraciones" ? (
          <>
            {[
              {
                name: "WhatsApp",
                state: "Manual",
                text: "Sin proveedor conectado. No se reciben ni envían mensajes desde esta demo.",
              },
              {
                name: "Formulario web",
                state: "Contrato v1",
                text: "Contrato compartido con ferreteria-occidental. Endpoint real sin desplegar.",
              },
              {
                name: "Supabase",
                state: "Sin conectar",
                text: "No hay backend de Occidental identificado ni migraciones ejecutadas.",
              },
              {
                name: "Archivos privados",
                state: "Pendiente",
                text: "Storage, límites MIME y descarga autorizada por verificar.",
              },
            ].map((i) => (
              <div className="integration-row" key={i.name}>
                <div>
                  <strong>{i.name}</strong>
                  <p>{i.text}</p>
                </div>
                <StatusBadge stage={i.state} />
              </div>
            ))}
          </>
        ) : tab === "Estados de demo" ? (
          <>
            <p className="muted">
              Controles para revisar estados de interfaz. No alteran la conexión
              real.
            </p>
            <div className="flex gap-2 flex-wrap">
              {["normal", "loading", "empty", "error"].map((s) => (
                <button
                  className="button"
                  key={s}
                  onClick={() => onScenario(s)}
                >
                  {s === "normal"
                    ? "Normal"
                    : s === "loading"
                      ? "Carga"
                      : s === "empty"
                        ? "Vacío"
                        : "Error"}
                </button>
              ))}
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(new FormData(e.currentTarget));
            }}
          >
            <p className="notice">
              Configuración de ejemplo guardada sólo para la demo. No es un
              horario ni SLA confirmado.
            </p>
            {tab === "Calendario laboral" ? (
              <>
                <label className="field">
                  Zona horaria
                  <input value="America/Asuncion" readOnly />
                </label>
                <label className="field">
                  Días de atención
                  <input
                    name="days"
                    defaultValue="Lunes a viernes (ejemplo)"
                    required
                  />
                </label>
                <div className="form-grid">
                  <label className="field">
                    Inicio
                    <input
                      name="start"
                      type="time"
                      defaultValue="08:00"
                      required
                    />
                  </label>
                  <label className="field">
                    Fin
                    <input
                      name="end"
                      type="time"
                      defaultValue="15:00"
                      required
                    />
                  </label>
                </div>
                <label className="field">
                  Excepciones / feriados
                  <textarea
                    name="exceptions"
                    placeholder="Pendiente de confirmar con la propietaria"
                  />
                </label>
                <small className="muted">
                  Cada cambio requiere nueva versión del calendario para
                  conservar tiempos históricos.
                </small>
              </>
            ) : tab === "Límites de atención" ? (
              <>
                <label className="field">
                  Objetivo de primera atención (minutos laborables)
                  <input
                    name="sla"
                    type="number"
                    min="1"
                    max="480"
                    defaultValue="60"
                    required
                  />
                </label>
                <p className="muted">
                  Ejemplo de 60 minutos. La deuda se mantiene al reasignar y no
                  se reinicia por otro mensaje.
                </p>
              </>
            ) : (
              <label className="field">
                Motivos de pérdida / cancelación
                <textarea
                  name="reasons"
                  defaultValue={
                    "Precio\nSin disponibilidad confirmada\nCliente desistió\nOtro motivo documentado"
                  }
                  required
                />
              </label>
            )}
            <button className="button primary" type="submit">
              Guardar ejemplo
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
