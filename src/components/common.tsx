import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  MagnifyingGlass,
  CaretDown,
  Star,
  Funnel,
  ArrowsDownUp,
  Columns,
  Plus,
  CheckCircle,
  Tray,
  WarningCircle,
  CircleNotch,
} from "@phosphor-icons/react";
import { useRef, type ReactNode } from "react";
import type { Stage, SavedView } from "../domain/model";

export function Modal({
  title,
  children,
  onClose,
  side = false,
  full = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  side?: boolean;
  full?: boolean;
}) {
  const previousFocus = useRef(document.activeElement as HTMLElement | null);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={`overlay ${side ? "panel-overlay" : ""}`} />
        <Dialog.Content
          className={side ? `record-panel ${full ? "full" : ""}` : "modal"}
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            if (previousFocus.current?.isConnected) {
              event.preventDefault();
              previousFocus.current.focus();
            }
          }}
        >
          <div className="dialog-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-button" aria-label="Cerrar">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function StatusBadge({ stage }: { stage: Stage | string }) {
  return (
    <span className={`badge stage-${stage.toLowerCase().replaceAll(" ", "-")}`}>
      <span className="status-dot" />
      {stage}
    </span>
  );
}
export function Avatar({
  name,
  initials,
  color = "violet",
  small = false,
}: {
  name: string;
  initials: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar ${color} ${small ? "small" : ""}`}
      title={name}
      aria-label={name}
    >
      {initials}
    </span>
  );
}
export function StateMessage({
  kind = "empty",
  title,
  children,
  action,
}: {
  kind?: "empty" | "loading" | "error" | "success";
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const Icon =
    kind === "loading"
      ? CircleNotch
      : kind === "error"
        ? WarningCircle
        : kind === "success"
          ? CheckCircle
          : Tray;
  return (
    <div
      className={`state-message ${kind}`}
      role={kind === "error" ? "alert" : "status"}
    >
      <Icon size={32} />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function ViewSelector({
  value,
  views,
  saved,
  onChange,
  onSave,
  favorite,
  onFavorite,
}: {
  value: string;
  views: string[];
  saved: SavedView[];
  onChange: (v: string) => void;
  onSave: () => void;
  favorite: boolean;
  onFavorite: () => void;
}) {
  return (
    <div className="view-selector">
      <span className="view-icon">
        <Tray size={17} />
      </span>
      <select
        aria-label="Vista"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {views.map((v) => (
          <option key={v}>{v}</option>
        ))}
        {saved.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
            {v.shared ? " · Equipo" : ""}
          </option>
        ))}
      </select>
      <CaretDown size={12} />
      <button
        className="icon-button star"
        aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        aria-pressed={favorite}
        onClick={onFavorite}
      >
        <Star size={17} weight={favorite ? "fill" : "regular"} />
      </button>
      <button
        className="icon-button"
        aria-label="Guardar vista"
        onClick={onSave}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
export function FilterBar({
  search,
  onSearch,
  stage,
  onStage,
  stages,
  sort,
  onSort,
  columns,
  onColumns,
  availableColumns,
  filterLabel = "Filtrar por etapa",
  nameSortLabel = "Asunto A–Z",
}: {
  search: string;
  onSearch: (v: string) => void;
  stage: string;
  onStage: (v: string) => void;
  stages: readonly string[];
  sort: "urgency" | "name";
  onSort: (v: "urgency" | "name") => void;
  columns: string[];
  onColumns: (v: string[]) => void;
  availableColumns?: string[];
  filterLabel?: string;
  nameSortLabel?: string;
}) {
  const available = availableColumns || [
    "Etapa",
    "Responsable",
    "Atención",
    "Próxima acción",
    "Vencimiento",
  ];
  return (
    <div className="filter-bar">
      <label className="local-search">
        <MagnifyingGlass size={17} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar en esta vista…"
          aria-label="Buscar en esta vista"
        />
      </label>
      <div className="toolbar-options">
        <label className={`filter-select ${stage ? "selected" : ""}`}>
          <Funnel size={16} />
          <select
            aria-label={filterLabel}
            value={stage}
            onChange={(e) => onStage(e.target.value)}
          >
            <option value="">Filtros</option>
            {stages.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <ArrowsDownUp size={16} />
          <select
            aria-label="Ordenar"
            value={sort}
            onChange={(e) => onSort(e.target.value as "urgency" | "name")}
          >
            <option value="urgency">Prioridad</option>
            <option value="name">{nameSortLabel}</option>
          </select>
        </label>
        <details className="column-picker">
          <summary>
            <Columns size={16} />
            Columnas
          </summary>
          <div className="popover">
            {available.map((c) => (
              <label key={c}>
                <input
                  type="checkbox"
                  aria-label={`Mostrar columna ${c}`}
                  checked={columns.includes(c)}
                  onChange={() =>
                    onColumns(
                      columns.includes(c)
                        ? columns.filter((x) => x !== c)
                        : [...columns, c],
                    )
                  }
                />
                {c}
              </label>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
