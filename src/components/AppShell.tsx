import {
  MagnifyingGlass,
  Star,
  ChatsCircle,
  Users,
  Files,
  CheckSquare,
  ChartBar,
  GearSix,
  CaretDown,
  SidebarSimple,
  ArrowUpRight,
  Clock,
  WarningCircle,
  Tray,
  Circle,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Avatar } from "./common";
import type { Person } from "../domain/model";
export const sections = [
  "Consultas",
  "Clientes",
  "Presupuestos",
  "Tareas",
  "Informes",
] as const;
export type Section = (typeof sections)[number] | "Configuración" | "Perfil";
export const inquiryViews = [
  "Mis pendientes",
  "Todas las abiertas",
  "Sin asignar",
  "Por responder",
  "Vencidas",
  "Por presupuestar",
  "En seguimiento",
  "Cerradas",
];
export const inquiryColumns = [
  "Etapa",
  "Responsable",
  "Atención",
  "Próxima acción",
  "Vencimiento",
];
export const objectColumns: Record<string, string[]> = {
  Consultas: inquiryColumns,
  Clientes: ["Tipo", "Localidad", "Consultas autorizadas", "Abiertas"],
  Presupuestos: [
    "Consulta / cliente",
    "Estado",
    "Importe PYG",
    "Validez",
    "Versión",
  ],
  Tareas: ["Consulta", "Responsable", "Vencimiento"],
};
export const objectViews: Record<string, string[]> = {
  Consultas: inquiryViews,
  Clientes: ["Todos los clientes", "Particulares", "Empresas"],
  Presupuestos: [
    "Pendientes de preparar",
    "Enviados",
    "Por vencer",
    "Aceptados",
    "Rechazados",
  ],
  Tareas: ["Hoy", "Vencidas", "Próximas", "Completadas"],
  Informes: ["Resumen de atención", "Seguimiento", "Resultados"],
};
const icons = [ChatsCircle, Users, Files, CheckSquare, ChartBar];
export function Sidebar({
  section,
  view,
  onNavigate,
  counts,
  person,
  open,
  onClose,
}: {
  section: Section;
  view: string;
  onNavigate: (s: Section, v?: string) => void;
  counts: Record<string, number>;
  person: Person;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={`mobile-nav-shade ${open ? "visible" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`sidebar ${open ? "open" : ""}`}
        aria-label="Navegación principal"
      >
        <div className="brand">
          <div className="brand-mark">
            fo
            <span />
          </div>
          <div>
            <strong>Occidental</strong>
            <span>Ferretería · CRM</span>
          </div>
          <CaretDown size={14} />
        </div>
        <div className="branch">
          <span className="branch-dot" />
          Villa Hayes <span className="demo-pill">Demo</span>
        </div>
        <div className="nav-label">Espacio de trabajo</div>
        <nav>
          {sections.map((s, i) => {
            const Icon = icons[i];
            return (
              <div key={s}>
                <a
                  href={`#/${s.toLowerCase()}`}
                  aria-label={s}
                  className={`nav-item ${section === s ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(s);
                    onClose();
                  }}
                >
                  <Icon size={19} />
                  <span>{s}</span>
                  {counts[s] !== undefined && (
                    <span className="nav-count">{counts[s]}</span>
                  )}
                </a>
                {s === "Consultas" && section === "Consultas" && (
                  <div className="subviews">
                    {inquiryViews.map((v, j) => {
                      if (v === "Sin asignar" && person.role === "vendedor")
                        return null;
                      const VIcon =
                        j === 0
                          ? Clock
                          : j === 4
                            ? WarningCircle
                            : j === 7
                              ? Tray
                              : Circle;
                      return (
                        <a
                          key={v}
                          href={`#/consultas?view=${encodeURIComponent(v)}`}
                          className={view === v ? "selected" : ""}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate("Consultas", v);
                            onClose();
                          }}
                        >
                          <VIcon size={14} />
                          <span>{v}</span>
                          {counts[v] !== undefined && (
                            <span className={j === 4 ? "danger-count" : ""}>
                              {counts[v]}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-help">
          <div className="help-icon">
            <ChatsCircle size={18} />
          </div>
          <strong>Cada consulta, a tiempo.</strong>
          <p>
            Un lugar para atender, hacer seguimiento y cumplir lo prometido.
          </p>
          <a
            href="#/informes"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("Informes");
              onClose();
            }}
          >
            Ver resumen de atención <ArrowUpRight size={14} />
          </a>
        </div>
        <a
          className={`nav-item settings ${section === "Configuración" ? "active" : ""}`}
          href="#/configuración"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("Configuración");
            onClose();
          }}
        >
          <GearSix size={19} />
          Configuración
        </a>
        <a
          className="profile-link"
          aria-label="Perfil"
          href="#/perfil"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("Perfil");
            onClose();
          }}
        >
          <Avatar {...person} />
          <span>
            <strong>{person.name}</strong>
            <small>{person.role} · perfil demo</small>
          </span>
          <CaretDown size={14} />
        </a>
      </aside>
    </>
  );
}
export function GlobalSearch({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="global-search" onClick={onOpen}>
      <MagnifyingGlass size={18} />
      <span>Buscar en Occidental</span>
      <kbd>Ctrl K</kbd>
    </button>
  );
}
export function AppShell({
  children,
  sidebar,
  section,
  onSearch,
  onMenu,
  favorites,
  onFavorite,
}: {
  children: ReactNode;
  sidebar: ReactNode;
  section: Section;
  onSearch: () => void;
  onMenu: () => void;
  favorites: { id: string; name: string }[];
  onFavorite: (id: string) => void;
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Ir al contenido
      </a>
      {sidebar}
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button menu-toggle"
            onClick={onMenu}
            aria-label="Abrir navegación"
          >
            <SidebarSimple size={20} />
          </button>
          <div className="breadcrumb">
            Espacio de trabajo <span>/</span>
            <strong>{section}</strong>
          </div>
          <GlobalSearch onOpen={onSearch} />
          <div className="top-favorites">
            <Star size={15} />
            {favorites.slice(0, 2).map((f) => (
              <button key={f.id} onClick={() => onFavorite(f.id)}>
                {f.name}
              </button>
            ))}
          </div>
        </header>
        <div className="demo-banner">
          <span className="demo-indicator" />
          Demostración interactiva{" "}
          <span className="demo-explanation">
            · Datos ficticios. Cambios guardados sólo en este navegador.
          </span>
          <span className="demo-date">10 oct 2026</span>
        </div>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
