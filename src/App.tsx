import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Table,
  Kanban as KanbanIcon,
  ArrowRight,
  Star,
  MagnifyingGlass,
  X,
  ArrowCounterClockwise,
  Funnel,
  ChatCircle,
} from "@phosphor-icons/react";
import {
  AppShell,
  Sidebar,
  objectViews,
  inquiryViews,
  objectColumns,
  inquiryColumns,
  type Section,
} from "./components/AppShell";
import {
  Modal,
  ViewSelector,
  FilterBar,
  StateMessage,
  Avatar,
} from "./components/common";
import { DataTable, Kanban } from "./features/inquiries/Inquiries";
import { RecordPanel } from "./features/inquiries/RecordPanel";
import {
  Customers,
  Quotes,
  Tasks,
  Reports,
  Profile,
  Configuration,
} from "./features/OtherPages";
import { team } from "./data/fixtures";
import { loadDemo, persistDemo, resetDemo } from "./services/demoRepository";
import {
  allowedInquiries,
  changeStage,
  recordAttention,
  overdue,
  viewMatches,
  stages,
  DEMO_NOW,
  type Inquiry,
  type Outcome,
  type SavedView,
} from "./domain/model";

function initialRoute() {
  const hash = decodeURIComponent(location.hash.slice(1));
  const parts = hash.split("?");
  const section = Object.keys(objectViews)
    .concat("Configuración", "Perfil")
    .find((s) => `/${s.toLowerCase()}` === parts[0]) as Section | undefined;
  const rememberedPerson =
    team.find((p) => p.id === localStorage.getItem("occidental-demo-person")) ||
    team[0];
  const targetSection =
    section ||
    (rememberedPerson.role === "vendedor" ? "Consultas" : "Informes");
  return {
    section: targetSection,
    view:
      new URLSearchParams(parts[1]).get("view") ||
      objectViews[targetSection]?.[0] ||
      "",
    id: new URLSearchParams(parts[1]).get("record"),
    full: new URLSearchParams(parts[1]).get("full") === "1",
  };
}
export default function App() {
  const route = initialRoute();
  const [state, setState] = useState(loadDemo);
  const [personId, setPersonId] = useState(
    () => localStorage.getItem("occidental-demo-person") || "ana",
  );
  const person = team.find((p) => p.id === personId) || team[0];
  const [section, setSection] = useState<Section>(route.section);
  const [view, setView] = useState(route.view);
  const [selectedId, setSelectedId] = useState<string | null>(route.id);
  const [full, setFull] = useState(route.full);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const initialView = state.savedViews.find(
    (v) => v.id === route.view && (v.owner === person.id || v.shared),
  );
  const [filterStage, setFilterStage] = useState(initialView?.stage || "");
  const [sort, setSort] = useState(initialView?.sort || "urgency");
  const [columns, setColumns] = useState(
    initialView?.columns ||
      (route.section === "Presupuestos" &&
      route.view === "Pendientes de preparar"
        ? inquiryColumns
        : objectColumns[route.section] || inquiryColumns),
  );
  const [layout, setLayout] = useState<"table" | "kanban">(
    initialView?.layout || "table",
  );
  const [selection, setSelection] = useState<string[]>([]);
  const [modal, setModal] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(false);
  const [scenario, setScenario] = useState("normal");
  const [configTab, setConfigTab] = useState("Usuarios y roles");
  const [globalQuery, setGlobalQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("occidental-demo-favorites") ||
          '["Mis pendientes","En seguimiento"]',
      );
    } catch {
      return ["Mis pendientes"];
    }
  });
  const authorized = useMemo(
    () => allowedInquiries(state, person),
    [state, person],
  );
  const selected = authorized.find((q) => q.id === selectedId);
  const saved = state.savedViews.filter(
    (v) => v.object === section && (v.owner === person.id || v.shared),
  );
  const savedView = saved.find((v) => v.id === view);
  const base = savedView?.base || view;
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timeout);
  }, [search]);
  useEffect(() => {
    try {
      persistDemo(state);
    } catch {
      setToast(
        "No se pudo guardar la demo en este navegador. Los cambios siguen en esta sesión.",
      );
    }
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setModal("search");
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  useEffect(() => {
    const handler = () => {
      const r = initialRoute();
      setSection(r.section);
      setView(r.view);
      setSelectedId(r.id);
      setFull(r.full);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  function url(
    s: Section,
    v: string,
    id: string | null = null,
    isFull = false,
  ) {
    history.pushState(
      {},
      "",
      `#/${s.toLowerCase()}?view=${encodeURIComponent(v)}${id ? `&record=${id}${isFull ? "&full=1" : ""}` : ""}`,
    );
  }
  function navigate(s: Section, v?: string) {
    const next = v || objectViews[s]?.[0] || "";
    const custom = state.savedViews.find(
      (saved) =>
        saved.id === next &&
        saved.object === s &&
        (saved.owner === person.id || saved.shared),
    );
    setSection(s);
    setView(next);
    setSearch("");
    setFilterStage(custom?.stage || "");
    setSort(custom?.sort || "urgency");
    setLayout(custom?.layout || "table");
    setColumns(
      custom?.columns ||
        (s === "Presupuestos" && next === "Pendientes de preparar"
          ? inquiryColumns
          : objectColumns[s] || inquiryColumns),
    );
    setSelection([]);
    setScenario("normal");
    setSelectedId(null);
    setCustomerId(null);
    url(s, next);
  }
  function open(id: string) {
    setCustomerId(null);
    setModal(null);
    setError("");
    setSelectedId(id);
    setFull(false);
    url(section, view, id);
  }
  function closeRecord() {
    setSelectedId(null);
    url(section, view);
  }
  function notify(s: string) {
    setToast(s);
  }
  function update(q: Inquiry) {
    setState((s) => ({
      ...s,
      inquiries: s.inquiries.map((x) => (x.id === q.id ? q : x)),
    }));
  }
  function event(q: Inquiry, text: string): Inquiry {
    return {
      ...q,
      version: q.version + 1,
      events: [
        ...q.events,
        {
          id: crypto.randomUUID(),
          at: DEMO_NOW,
          kind: "sistema",
          actor: person.name,
          text,
        },
      ],
    };
  }
  function stage(q: Inquiry, s: Inquiry["stage"]) {
    if (s === "Cerrada") {
      setSelectedId(q.id);
      setModal("close");
      setError("");
      return;
    }
    try {
      const quote = state.quotes.find((p) => p.inquiryId === q.id);
      update(
        event(
          changeStage(q, s, q.version, {
            hasQuote: !!quote,
            hasAcceptedQuote: quote?.status === "Aceptado",
          }),
          `Etapa cambiada de ${q.stage} a ${s}.`,
        ),
      );
      notify("Etapa actualizada en la demo.");
    } catch (e) {
      setError((e as Error).message);
      setModal("transition-error");
    }
  }
  function taskDone(id: string) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task || !authorized.some((q) => q.id === task.inquiryId)) return;
    const q = state.inquiries.find((q) => q.id === task.inquiryId)!;
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: true } : t)),
      inquiries: s.inquiries.map((x) =>
        x.id === q.id
          ? event(
              {
                ...x,
                primaryTaskId: x.primaryTaskId === id ? null : x.primaryTaskId,
              },
              `Tarea completada: ${task.title}.`,
            )
          : x,
      ),
    }));
    notify("Tarea completada. Revisá si hace falta una próxima acción.");
  }
  function assign(q: Inquiry, id: string | null) {
    if (person.role === "vendedor") return;
    update(
      event(
        { ...q, assignedTo: id },
        id
          ? `Asignada a ${team.find((p) => p.id === id)?.name}.`
          : "Devuelta a la cola de supervisión.",
      ),
    );
    notify("Asignación actualizada; los plazos de atención se conservan.");
  }
  function selectView(v: string) {
    setView(v);
    setSelection([]);
    setSearch("");
    const custom = saved.find((x) => x.id === v);
    if (custom) {
      setLayout(custom.layout);
      setFilterStage(custom.stage);
      setSort(custom.sort);
      setColumns(custom.columns);
    } else {
      setFilterStage("");
      setColumns(
        section === "Presupuestos" && v === "Pendientes de preparar"
          ? inquiryColumns
          : objectColumns[section] || inquiryColumns,
      );
    }
    url(section, v);
  }
  function favorite() {
    const key =
      section === "Consultas" || savedView ? view : `${section}::${view}`;
    const next = favorites.includes(key)
      ? favorites.filter((x) => x !== key)
      : [...favorites, key];
    setFavorites(next);
    localStorage.setItem("occidental-demo-favorites", JSON.stringify(next));
  }
  function action(a: string) {
    setError("");
    if (a.startsWith("accept:") || a.startsWith("reject:")) {
      const id = a.split(":")[1];
      const p = state.quotes.find((x) => x.id === id)!;
      const q = authorized.find((q) => q.id === p.inquiryId)!;
      const accept = a.startsWith("accept:");
      setState((s) => ({
        ...s,
        quotes: s.quotes.map((x) =>
          x.id === id
            ? {
                ...x,
                status: accept ? "Aceptado" : "Rechazado",
                acceptedVersion: accept
                  ? x.versions.at(-1)!.version
                  : undefined,
              }
            : x,
        ),
        inquiries: s.inquiries.map((x) =>
          x.id === q.id
            ? event(
                { ...x, stage: accept ? "Aceptada" : x.stage },
                `${accept ? "Aceptación" : "Rechazo"} registrado de ${p.versions.at(-1)!.externalRef}, versión ${p.versions.at(-1)!.version}. No representa cobro ni entrega.`,
              )
            : x,
        ),
      }));
      notify(`${accept ? "Aceptación" : "Rechazo"} registrado en la demo.`);
      return;
    }
    setModal(a);
  }
  const records = useMemo(
    () =>
      authorized
        .filter(
          (q) =>
            viewMatches(q, base, state.tasks, person.id) &&
            (filterStage ? q.stage === filterStage : true) &&
            `${q.subject} ${state.customers.find((c) => c.id === q.customerId)?.name} ${q.reference}`
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "name"
            ? a.subject.localeCompare(b.subject)
            : Number(overdue(b, state.tasks)) -
                Number(overdue(a, state.tasks)) ||
              a.createdAt.localeCompare(b.createdAt),
        ),
    [
      authorized,
      base,
      state.tasks,
      state.customers,
      person.id,
      filterStage,
      debouncedSearch,
      sort,
    ],
  );
  const counts: Record<string, number> = {
    Consultas: authorized.filter((q) => q.stage !== "Cerrada").length,
    Clientes: new Set(authorized.map((q) => q.customerId)).size,
    Tareas: state.tasks.filter(
      (t) => !t.done && authorized.some((q) => q.id === t.inquiryId),
    ).length,
  };
  for (const v of inquiryViews)
    counts[v] = authorized.filter((q) =>
      viewMatches(q, v, state.tasks, person.id),
    ).length;
  function formSubmit(data: FormData) {
    try {
      if (modal === "save-view") {
        const name = String(data.get("name")).trim();
        if (!name) throw new Error("Dale un nombre a la vista.");
        const v: SavedView = {
          id: crypto.randomUUID(),
          name,
          object: section,
          layout,
          base,
          stage: filterStage as SavedView["stage"],
          owner: person.id,
          shared: data.get("shared") === "on",
          favorite: true,
          sort: sort as SavedView["sort"],
          columns,
        };
        setState((s) => ({ ...s, savedViews: [...s.savedViews, v] }));
        setView(v.id);
        const next = [...favorites, v.id];
        setFavorites(next);
        localStorage.setItem("occidental-demo-favorites", JSON.stringify(next));
        url(section, v.id);
      } else if (modal === "new") {
        const customer = String(data.get("customer"));
        const subject = String(data.get("subject")).trim();
        const message = String(data.get("message")).trim();
        if (!subject || !message)
          throw new Error("Completá el asunto y la solicitud.");
        const id = crypto.randomUUID();
        const customerId = customer || crypto.randomUUID();
        const taskId = crypto.randomUUID();
        const assignTo =
          person.role === "vendedor"
            ? person.id
            : String(data.get("assigned")) || null;
        const at = String(data.get("due"));
        if (!at) throw new Error("Definí la próxima acción.");
        const q: Inquiry = {
          id,
          reference: `OC-DEMO-${state.inquiries.length + 1}`,
          customerId,
          subject,
          message,
          stage: "Nueva",
          assignedTo: assignTo,
          source: "Alta manual",
          createdAt: DEMO_NOW,
          replyOpenedAt: DEMO_NOW,
          replyDueAt: new Date(at + "-03:00").toISOString(),
          primaryTaskId: taskId,
          version: 1,
          items: [],
          events: [
            {
              id: crypto.randomUUID(),
              at: DEMO_NOW,
              kind: "sistema",
              actor: person.name,
              text: "Alta manual demo. Contacto e identidad pendientes de verificación.",
            },
          ],
        };
        const name = String(data.get("name")).trim();
        if (!customer && name.length < 2)
          throw new Error("Ingresá el nombre del cliente.");
        setState((s) => ({
          ...s,
          inquiries: [q, ...s.inquiries],
          customers: customer
            ? s.customers
            : [
                ...s.customers,
                {
                  id: customerId,
                  name,
                  initials: name
                    .split(" ")
                    .slice(0, 2)
                    .map((x) => x[0])
                    .join(""),
                  type: "Particular",
                  location: "Villa Hayes",
                  note: "Alta demo no verificada. No se fusiona por teléfono.",
                },
              ],
          tasks: [
            ...s.tasks,
            {
              id: taskId,
              inquiryId: id,
              title: String(data.get("task")).trim(),
              dueAt: new Date(at + "-03:00").toISOString(),
              assignedTo: assignTo || "marta",
              done: false,
              kind: "atención",
            },
          ],
        }));
        setModal(null);
        navigate(
          "Consultas",
          assignTo === person.id ? "Mis pendientes" : "Todas las abiertas",
        );
        open(id);
        notify("Consulta creada en la demo.");
        return;
      } else if (selected) {
        if (modal === "note") {
          const text = String(data.get("text")).trim();
          if (!text) throw new Error("Escribí la nota.");
          update({
            ...selected,
            version: selected.version + 1,
            events: [
              ...selected.events,
              {
                id: crypto.randomUUID(),
                at: DEMO_NOW,
                kind: "nota",
                actor: person.name,
                text,
              },
            ],
          });
        } else if (modal === "attention") {
          update(
            recordAttention(
              selected,
              selected.replyOpenedAt,
              String(data.get("text")).trim(),
              person.name,
              DEMO_NOW,
            ),
          );
        } else if (modal === "close") {
          const outcome = String(data.get("outcome")) as Outcome;
          update(
            event(
              changeStage(selected, "Cerrada", selected.version, {
                outcome,
                reason: String(data.get("reason")),
                duplicateId: String(data.get("duplicate")) || undefined,
              }),
              `Cierre declarado: ${outcome}.`,
            ),
          );
          setState((s) => ({
            ...s,
            tasks: s.tasks.map((t) =>
              t.inquiryId === selected.id ? { ...t, done: true } : t,
            ),
          }));
        } else if (modal === "task") {
          const id = crypto.randomUUID();
          const at = String(data.get("due"));
          const title = String(data.get("title")).trim();
          if (!title || !at) throw new Error("Completá título y fecha.");
          const dueAt = new Date(at + "-03:00").toISOString();
          setState((s) => ({
            ...s,
            inquiries: s.inquiries.map((q) =>
              q.id === selected.id
                ? event(
                    { ...q, primaryTaskId: id },
                    `Próxima acción designada: ${title}.`,
                  )
                : q,
            ),
            tasks: [
              ...s.tasks,
              {
                id,
                inquiryId: selected.id,
                title,
                dueAt,
                assignedTo: selected.assignedTo || person.id,
                done: false,
                kind: String(data.get("kind")) as
                  "seguimiento" | "atención" | "preparación",
              },
            ],
          }));
        } else if (modal === "quote") {
          if (
            !["Por presupuestar", "Presupuesto enviado"].includes(
              selected.stage,
            )
          )
            throw new Error(
              "Pasá la consulta a Por presupuestar antes de registrar el documento o su revisión.",
            );
          const ref = String(data.get("ref")).trim();
          const amount = String(data.get("amount"));
          const validity = String(data.get("validity"));
          if (!ref || !validity)
            throw new Error("Ingresá referencia y validez.");
          if (amount && !/^\d+$/.test(amount))
            throw new Error("El importe PYG debe ser un entero positivo.");
          const existing = state.quotes.find(
            (p) => p.inquiryId === selected.id,
          );
          const version = {
            version: (existing?.versions.length || 0) + 1,
            externalRef: ref,
            amount,
            date: "2026-10-10",
            validity,
          };
          setState((s) => ({
            ...s,
            quotes: existing
              ? s.quotes.map((p) =>
                  p.id === existing.id
                    ? {
                        ...p,
                        status: "Enviado",
                        versions: [...p.versions, version],
                      }
                    : p,
                )
              : [
                  ...s.quotes,
                  {
                    id: crypto.randomUUID(),
                    inquiryId: selected.id,
                    status: "Enviado",
                    versions: [version],
                  },
                ],
            inquiries: s.inquiries.map((q) =>
              q.id === selected.id
                ? event(
                    { ...q, stage: "Presupuesto enviado" },
                    `Presupuesto externo ${ref}, versión ${version.version}, registrado como enviado manualmente.`,
                  )
                : q,
            ),
          }));
        }
      }
      setModal(null);
      setError("");
      notify("Cambios guardados en la demostración.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const customer = state.customers.find((c) => c.id === customerId);
  const isTable =
    section === "Consultas" ||
    (section === "Presupuestos" && base === "Pendientes de preparar");
  const descriptions: Record<string, string> = {
    Consultas:
      "Qué necesita atención, quién la atiende y cuál es la próxima acción.",
    Clientes:
      "Una relación, varias consultas. El contexto del cliente en un solo lugar.",
    Presupuestos:
      "Documentos externos, versiones y seguimiento de cada propuesta.",
    Tareas: "Lo prometido tiene responsable y fecha.",
    Informes: "Atención, seguimiento y resultados declarados.",
    Configuración: "Las reglas de trabajo de Occidental.",
    Perfil: "Tu espacio de trabajo y preferencias.",
  };
  const favItems = favorites
    .filter(
      (f) =>
        inquiryViews.includes(f) ||
        (f.includes("::") &&
          objectViews[f.split("::")[0]]?.includes(f.split("::")[1])) ||
        state.savedViews.some(
          (v) => v.id === f && (v.owner === person.id || v.shared),
        ),
    )
    .map((f) => ({
      id: f,
      name:
        state.savedViews.find((v) => v.id === f)?.name || f.split("::").at(-1)!,
    }));
  return (
    <AppShell
      section={section}
      onSearch={() => setModal("search")}
      onMenu={() => setMenu(!menu)}
      favorites={favItems}
      onFavorite={(id) =>
        navigate(
          (state.savedViews.find((v) => v.id === id)?.object as Section) ||
            (id.includes("::") ? (id.split("::")[0] as Section) : "Consultas"),
          id.split("::").at(-1),
        )
      }
      sidebar={
        <Sidebar
          section={section}
          view={base}
          onNavigate={navigate}
          counts={counts}
          person={person}
          open={menu}
          onClose={() => setMenu(false)}
        />
      }
    >
      <div className="page-heading">
        <div>
          <h1>{section}</h1>
          <p>{descriptions[section]}</p>
        </div>
        {["Consultas", "Clientes", "Presupuestos", "Tareas"].includes(
          section,
        ) && (
          <button
            className="button primary"
            onClick={() => {
              setError("");
              setModal(
                section === "Tareas"
                  ? "choose-task"
                  : section === "Presupuestos"
                    ? "choose-quote"
                    : "new",
              );
            }}
          >
            <Plus size={17} />
            {section === "Tareas"
              ? "Nueva tarea"
              : section === "Presupuestos"
                ? "Registrar presupuesto"
                : "Nueva consulta"}
          </button>
        )}
      </div>
      {objectViews[section] && (
        <>
          <div className="view-bar">
            <ViewSelector
              value={view}
              views={objectViews[section].filter(
                (v) => person.role !== "vendedor" || v !== "Sin asignar",
              )}
              saved={saved}
              onChange={selectView}
              onSave={() => setModal("save-view")}
              favorite={favorites.includes(
                section === "Consultas" || savedView
                  ? view
                  : `${section}::${view}`,
              )}
              onFavorite={favorite}
            />
            {isTable && (
              <div className="layout-toggle">
                <button
                  className={layout === "table" ? "selected" : ""}
                  onClick={() => setLayout("table")}
                  aria-label="Vista tabla"
                  aria-pressed={layout === "table"}
                >
                  <Table size={16} />
                  <span>Tabla</span>
                </button>
                <button
                  className={layout === "kanban" ? "selected" : ""}
                  onClick={() => setLayout("kanban")}
                  aria-label="Vista kanban"
                  aria-pressed={layout === "kanban"}
                >
                  <KanbanIcon size={16} />
                  <span>Kanban</span>
                </button>
              </div>
            )}
            <span className="view-count">
              {isTable ? records.length : ""} {isTable ? "consultas" : ""}
            </span>
          </div>
          {section !== "Informes" && (
            <FilterBar
              search={search}
              onSearch={setSearch}
              stage={filterStage}
              onStage={setFilterStage}
              stages={
                isTable
                  ? stages
                  : section === "Clientes"
                    ? ["Particular", "Empresa"]
                    : section === "Presupuestos"
                      ? ["Enviado", "Aceptado", "Rechazado"]
                      : ["Seguimiento", "Atención", "Preparación"]
              }
              availableColumns={
                isTable ? inquiryColumns : objectColumns[section]
              }
              filterLabel={
                isTable
                  ? "Filtrar por etapa"
                  : section === "Clientes"
                    ? "Filtrar por tipo"
                    : section === "Presupuestos"
                      ? "Filtrar por estado"
                      : "Filtrar por tipo de tarea"
              }
              nameSortLabel={
                section === "Clientes"
                  ? "Cliente A–Z"
                  : section === "Presupuestos" && !isTable
                    ? "Referencia A–Z"
                    : "Asunto A–Z"
              }
              sort={sort}
              onSort={setSort}
              columns={columns}
              onColumns={setColumns}
            />
          )}
        </>
      )}
      {filterStage && isTable && (
        <div className="active-filters">
          <Funnel size={14} />
          Etapa: {filterStage}
          <button
            className="icon-button"
            aria-label="Quitar filtro de etapa"
            onClick={() => setFilterStage("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {selection.length > 0 && isTable && (
        <div className="bulk-bar">
          <strong>{selection.length} seleccionadas</strong>
          {person.role !== "vendedor" && (
            <select
              aria-label="Asignación masiva"
              defaultValue=""
              onChange={(e) => {
                const id = e.target.value;
                if (id)
                  selection.forEach((qid) => {
                    const q = authorized.find((x) => x.id === qid);
                    if (q && q.stage !== "Cerrada") assign(q, id);
                  });
                setSelection([]);
              }}
            >
              <option value="">Asignar a…</option>
              {team
                .filter((p) => p.role === "vendedor")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          )}
          <button className="text-button" onClick={() => setSelection([])}>
            Cancelar selección
          </button>
        </div>
      )}
      {scenario !== "normal" ? (
        <StateMessage
          kind={
            scenario === "loading"
              ? "loading"
              : scenario === "error"
                ? "error"
                : "empty"
          }
          title={
            scenario === "loading"
              ? "Cargando consultas…"
              : scenario === "error"
                ? "No se pudieron cargar las consultas"
                : "No hay consultas en esta vista"
          }
          action={
            <button className="button" onClick={() => setScenario("normal")}>
              <ArrowCounterClockwise size={16} />
              Volver a los datos demo
            </button>
          }
        >
          {scenario === "error"
            ? "No se cambian datos ni indicadores. En modo real, un error nunca activa fixtures."
            : "Estado de interfaz de demostración."}
        </StateMessage>
      ) : isTable ? (
        records.length ? (
          <>
            {layout === "table" ? (
              <DataTable
                records={records.slice(0, 25)}
                state={state}
                onOpen={open}
                columns={columns}
                selected={selection}
                onSelect={setSelection}
              />
            ) : (
              <Kanban
                records={records}
                state={state}
                onOpen={open}
                onStage={stage}
              />
            )}
            <div className="table-footer">
              <span>{records.length} consultas · Datos de demostración</span>
              <span>
                Ordenadas por{" "}
                {sort === "urgency" ? "vencimiento y antigüedad" : "asunto"}
              </span>
            </div>
            <div className="context-note">
              <ChatCircle size={16} />
              <span>
                WhatsApp es manual. Registrá la atención y programá la próxima
                acción para mantener el seguimiento.
              </span>
              <button
                className="text-button"
                onClick={() => {
                  setConfigTab("Integraciones");
                  navigate("Configuración");
                }}
              >
                Ver integraciones <ArrowRight size={13} />
              </button>
            </div>
          </>
        ) : (
          <StateMessage
            title="Todo en orden en esta vista"
            action={
              <button
                className="button"
                onClick={() => {
                  setSearch("");
                  setFilterStage("");
                  selectView("Todas las abiertas");
                }}
              >
                Ver todas las abiertas
              </button>
            }
          >
            No hay consultas que coincidan con estos filtros.
          </StateMessage>
        )
      ) : section === "Clientes" ? (
        <Customers
          state={state}
          records={authorized}
          search={debouncedSearch}
          view={base}
          onCustomer={setCustomerId}
          filter={filterStage}
          sort={sort}
          columns={columns}
        />
      ) : section === "Presupuestos" ? (
        <Quotes
          state={state}
          records={authorized}
          search={debouncedSearch}
          view={base}
          onOpen={open}
          filter={filterStage}
          sort={sort}
          columns={columns}
        />
      ) : section === "Tareas" ? (
        <Tasks
          state={state}
          records={authorized}
          view={base}
          search={debouncedSearch}
          onDone={taskDone}
          filter={filterStage}
          sort={sort}
          columns={columns}
          onOpen={open}
        />
      ) : section === "Informes" ? (
        <Reports
          state={state}
          records={authorized}
          view={base}
          person={person}
          onView={(v) => navigate("Consultas", v)}
          onRecord={open}
        />
      ) : section === "Perfil" ? (
        <Profile
          person={person}
          onPerson={(id) => {
            setPersonId(id);
            localStorage.setItem("occidental-demo-person", id);
            const p = team.find((p) => p.id === id)!;
            navigate(
              p.role === "vendedor" ? "Consultas" : "Informes",
              p.role === "vendedor" ? "Mis pendientes" : "Resumen de atención",
            );
            notify(`Perfil demo: ${p.name}`);
          }}
          onReset={() => {
            setState(resetDemo());
            notify("Datos demo restablecidos.");
          }}
        />
      ) : (
        <Configuration
          tab={configTab}
          onTab={setConfigTab}
          person={person}
          onSave={(data) => {
            localStorage.setItem(
              `occidental-demo-config-${configTab}`,
              JSON.stringify(Object.fromEntries(data)),
            );
            notify(
              "Ejemplo guardado. No modifica los indicadores ni el calendario operativo.",
            );
          }}
          onScenario={(s) => {
            navigate("Consultas");
            setScenario(s);
          }}
        />
      )}
      {selected && (
        <RecordPanel
          inquiry={selected}
          state={state}
          person={person}
          onClose={closeRecord}
          full={full}
          onFull={() => {
            setFull(!full);
            url(section, view, selected.id, !full);
          }}
          onCustomer={(id) => {
            closeRecord();
            setCustomerId(id);
          }}
          onAssign={(id) => assign(selected, id)}
          onStage={(s) => stage(selected, s)}
          onAction={action}
          onTaskDone={taskDone}
        />
      )}{" "}
      {customer && (
        <Modal title={customer.name} onClose={() => setCustomerId(null)} side>
          <div className="record-title">
            <Avatar name={customer.name} initials={customer.initials} />
            <h1>{customer.name}</h1>
            <p className="muted">
              {customer.type} · {customer.location} · Cliente demo
            </p>
          </div>
          <div className="record-body">
            <h2>Historial autorizado</h2>
            <p className="notice">
              {customer.note} Teléfono omitido para evitar contactar a personas
              reales.
            </p>
            {authorized
              .filter((q) => q.customerId === customer.id)
              .map((q) => (
                <button
                  key={q.id}
                  className="related-record"
                  onClick={() => open(q.id)}
                >
                  <span>
                    <small>
                      {q.reference} · {q.stage}
                    </small>
                    <strong>{q.subject}</strong>
                  </span>
                  <ArrowRight size={18} />
                </button>
              ))}
            <small className="muted">
              Compartir cliente no da acceso a consultas de otro vendedor.
            </small>
          </div>
        </Modal>
      )}
      {modal && (
        <Modal
          title={
            modal === "search"
              ? "Buscar en Occidental"
              : modal === "new"
                ? "Nueva consulta"
                : modal === "save-view"
                  ? "Guardar vista"
                  : modal === "task"
                    ? "Programar próxima acción"
                    : modal === "quote"
                      ? "Registrar presupuesto externo"
                      : modal === "attention"
                        ? "Registrar atención manual"
                        : modal === "note"
                          ? "Añadir nota interna"
                          : modal === "close"
                            ? "Cerrar consulta"
                            : modal === "choose-task"
                              ? "Elegir consulta para la tarea"
                              : modal === "choose-quote"
                                ? "Elegir consulta para el presupuesto"
                                : "Información de la demostración"
          }
          onClose={() => {
            setModal(null);
            setError("");
          }}
        >
          <div className="modal-body">
            {modal === "search" ? (
              <>
                <label className="search-dialog">
                  <MagnifyingGlass size={20} />
                  <input
                    autoFocus
                    placeholder="Cliente, asunto o referencia…"
                    aria-label="Búsqueda global"
                    value={globalQuery}
                    onChange={(e) => setGlobalQuery(e.target.value)}
                  />
                </label>
                <p className="muted">Resultados según el perfil demo actual</p>
                {authorized
                  .filter((q) =>
                    `${q.subject} ${q.reference} ${state.customers.find((c) => c.id === q.customerId)?.name}`
                      .toLowerCase()
                      .includes(globalQuery.toLowerCase()),
                  )
                  .slice(0, 8)
                  .map((q) => (
                    <button
                      className="search-result"
                      key={q.id}
                      onClick={() => open(q.id)}
                    >
                      <ChatCircle size={19} />
                      <span>
                        <strong>{q.subject}</strong>
                        <small>
                          {q.reference} ·{" "}
                          {
                            state.customers.find((c) => c.id === q.customerId)
                              ?.name
                          }
                        </small>
                      </span>
                      <ArrowRight size={16} />
                    </button>
                  ))}
              </>
            ) : modal === "choose-task" || modal === "choose-quote" ? (
              <>
                {authorized
                  .filter((q) => q.stage !== "Cerrada")
                  .map((q) => (
                    <button
                      className="related-record"
                      key={q.id}
                      onClick={() => {
                        setSelectedId(q.id);
                        setModal(modal === "choose-task" ? "task" : "quote");
                      }}
                    >
                      <span>
                        <small>{q.reference}</small>
                        <strong>{q.subject}</strong>
                      </span>
                      <ArrowRight size={17} />
                    </button>
                  ))}
              </>
            ) : [
                "save-view",
                "new",
                "note",
                "attention",
                "task",
                "quote",
                "close",
              ].includes(modal) ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  formSubmit(new FormData(e.currentTarget));
                }}
              >
                {modal === "save-view" ? (
                  <>
                    <p className="muted">
                      Guarda objeto, filtros, orden, columnas y disposición en
                      este navegador.
                    </p>
                    <label className="field">
                      Nombre
                      <input
                        name="name"
                        autoFocus
                        required
                        maxLength={80}
                        placeholder="Ej. Seguimientos de la semana"
                      />
                    </label>
                    {person.role !== "vendedor" && (
                      <label className="checkbox-label">
                        <input name="shared" type="checkbox" />
                        Compartir con el equipo demo
                      </label>
                    )}
                    <p className="notice slim">
                      <Star size={17} />
                      Compartir la vista no amplía permisos sobre registros.
                    </p>
                  </>
                ) : modal === "new" ? (
                  <>
                    <label className="field">
                      Cliente existente
                      <select name="customer">
                        <option value="">Nuevo contacto de demostración</option>
                        {state.customers
                          .filter((c) =>
                            authorized.some((q) => q.customerId === c.id),
                          )
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="field">
                      Nombre del nuevo contacto
                      <input
                        name="name"
                        placeholder="Nombre ficticio"
                        maxLength={100}
                      />
                    </label>
                    <label className="field">
                      Asunto
                      <input
                        name="subject"
                        required
                        maxLength={160}
                        placeholder="¿Qué necesita el cliente?"
                      />
                    </label>
                    <label className="field">
                      Solicitud
                      <textarea name="message" required maxLength={2000} />
                    </label>
                    {person.role !== "vendedor" && (
                      <label className="field">
                        Responsable
                        <select name="assigned">
                          <option value="">Cola sin asignar</option>
                          {team
                            .filter((p) => p.role === "vendedor")
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </label>
                    )}
                    <label className="field">
                      Próxima acción
                      <input
                        name="task"
                        required
                        defaultValue="Responder y confirmar solicitud"
                        maxLength={200}
                      />
                    </label>
                    <label className="field">
                      Fecha de la acción (Asunción)
                      <input
                        name="due"
                        type="datetime-local"
                        required
                        defaultValue="2026-10-10T12:00"
                      />
                    </label>
                    <p className="muted">
                      Alta manual, sin enviar mensajes y sin capturar teléfonos
                      reales.
                    </p>
                  </>
                ) : modal === "task" ? (
                  <TaskComposer />
                ) : modal === "quote" ? (
                  <>
                    <p className="notice slim">
                      Declaración manual de documento enviado. Una revisión
                      conserva las versiones anteriores.
                    </p>
                    <label className="field">
                      Referencia externa
                      <input
                        name="ref"
                        required
                        maxLength={100}
                        placeholder="P-2026-150"
                      />
                    </label>
                    <label className="field">
                      Importe PYG (opcional)
                      <input
                        name="amount"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Sin separadores"
                      />
                    </label>
                    <label className="field">
                      Válido hasta
                      <input
                        name="validity"
                        type="date"
                        required
                        defaultValue="2026-10-17"
                      />
                    </label>
                    <p className="muted">
                      Sin archivo real. No calcula impuestos, stock, cobros ni
                      entrega.
                    </p>
                  </>
                ) : modal === "close" ? (
                  <>
                    <label className="field">
                      Resultado declarado
                      <select name="outcome" required>
                        {[
                          "consulta resuelta",
                          "venta declarada",
                          "perdida",
                          "cancelada",
                          "duplicada",
                          "spam",
                        ].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Motivo (obligatorio para pérdida / cancelación)
                      <textarea name="reason" maxLength={500} />
                    </label>
                    <label className="field">
                      Consulta vinculada (para duplicada)
                      <select name="duplicate">
                        <option value="">Sin vincular</option>
                        {authorized
                          .filter((q) => q.id !== selected?.id)
                          .map((q) => (
                            <option key={q.id} value={q.id}>
                              {q.reference} · {q.subject}
                            </option>
                          ))}
                      </select>
                    </label>
                    <p className="notice slim">
                      Venta declarada no significa cobro. El cierre y su
                      resultado quedan en el historial demo.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="notice slim">
                      {modal === "attention"
                        ? "La atención es una declaración manual del usuario. No verifica envío ni lectura en WhatsApp. Una nota o clic de WhatsApp no resuelve la deuda."
                        : "Una nota interna no se registra como respuesta al cliente."}
                    </p>
                    <label className="field">
                      {modal === "attention"
                        ? "Resultado / evidencia manual"
                        : "Nota"}
                      <textarea
                        name="text"
                        required
                        maxLength={2000}
                        autoFocus
                        placeholder={
                          modal === "attention"
                            ? "Qué se respondió y qué se acordó…"
                            : "Información útil para el equipo…"
                        }
                      />
                    </label>
                  </>
                )}
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="form-actions">
                  <button
                    type="button"
                    className="button"
                    onClick={() => setModal(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="button primary">
                    {modal === "close"
                      ? "Confirmar cierre demo"
                      : "Guardar en demo"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className={error ? "form-error" : "notice"}>
                  {error ||
                    (modal === "whatsapp"
                      ? "WhatsApp se atiende fuera del CRM. Esta demo no abre conversaciones ni envía mensajes. Después de atender, registrá el resultado manual y una próxima acción."
                      : modal === "files"
                        ? "Los archivos reales requieren Storage privado configurado y políticas probadas. No se simula una carga exitosa."
                        : "Esta función depende de configurar el backend real de Occidental.")}
                </p>
                {modal === "whatsapp" && (
                  <button
                    className="button primary"
                    onClick={() => setModal("attention")}
                  >
                    Registrar atención manual
                  </button>
                )}
                <button className="button" onClick={() => setModal(null)}>
                  Volver
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button aria-label="Cerrar aviso" onClick={() => setToast("")}>
            <X size={17} />
          </button>
        </div>
      )}
    </AppShell>
  );
}
export function TaskComposer() {
  return (
    <>
      <label className="field">
        Próxima acción
        <input
          name="title"
          required
          maxLength={200}
          placeholder="Ej. Confirmar decisión del cliente"
        />
      </label>
      <label className="field">
        Tipo
        <select name="kind">
          <option value="seguimiento">Seguimiento</option>
          <option value="atención">Atención</option>
          <option value="preparación">Preparación de presupuesto</option>
        </select>
      </label>
      <label className="field">
        Fecha y hora (America/Asuncion)
        <input
          name="due"
          type="datetime-local"
          required
          defaultValue="2026-10-12T09:00"
        />
      </label>
      <p className="muted">
        Esta tarea será la próxima acción principal. Las tareas previas
        permanecen en el historial.
      </p>
    </>
  );
}
