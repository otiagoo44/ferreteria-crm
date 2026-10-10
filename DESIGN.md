---
version: alpha
name: Occidental CRM
description: Espacio de atención claro, compacto y azul violáceo para una ferretería de Villa Hayes.
colors:
  primary: "#3E4095"
  primary-hover: "#303273"
  on-primary: "#FFFFFF"
  ink: "#292A35"
  muted: "#696A78"
  canvas: "#FFFFFF"
  surface: "#FAFAFB"
  sidebar: "#F8F8FA"
  soft: "#EFEFF8"
  border: "#E8E8ED"
  control-border: "#898B98"
  error: "#AC3942"
  error-soft: "#FFF0F1"
  warning: "#855B17"
  warning-soft: "#FBF3DF"
  success: "#347052"
  success-soft: "#EAF5EE"
typography:
  heading:
    fontFamily: DM Sans Variable
    fontSize: 26px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.03em
  subheading:
    fontFamily: DM Sans Variable
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: DM Sans Variable
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: DM Sans Variable
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: DM Sans Variable
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.6
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  full: 9999px
components:
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  selected-view:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.primary}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 8px 13px
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.muted}"
    width: 234px
  surface:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: 44px
  input-border:
    backgroundColor: "{colors.control-border}"
    height: 1px
  warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
  success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
  error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
---

## Overview

Panel interno para vendedores y propietaria de Ferretería Occidental. Lenguaje tranquilo y funcional: se debe entender qué requiere atención, quién responde y qué sigue. Este documento es autoridad visual; Twenty aporta interacción. Taste: DESIGN_VARIANCE 2, MOTION_INTENSITY 1, VISUAL_DENSITY 7. Tema claro solicitado. No hay hero, fotos, gráficos iniciales ni métricas de relleno.

Se leyeron las cinco skills instaladas en `.agents/skills` y se comprobó la existencia de sus copias en `C:/htdocs/skin.expert/.agents/skills`. No se copiaron assets de Skin Expert. Awesome Design MD: dos análisis completos, Notion y Airtable. Se adoptan superficies continuas, jerarquía tipográfica moderada, separación fina y geometría rectangular. Se descartan sus identidades, fuentes propietarias, marketing, hero oscuro, paletas y cards gigantes. La referencia Dovetail recibida está conservada en `docs/references/DOVETAIL.original.md`; se toma densidad y uso funcional del acento, se descarta su tema oscuro. La captura local de reproductor musical fue revisada; sólo respalda separación de sidebar/contenido, no es una referencia CRM ni una fuente de assets reutilizados.

UI UX Pro Max: Python y py del sistema no estaban disponibles. Se ejecutó el script local con Python oficial portable en `.tools` (ignorado por git). La consulta `CRM internal workspace dense` con diales 2/1/7 devolvió Minimalism & Swiss Style; se toma sobriedad y se descarta el patrón de landing/video, azul genérico, Poppins y scroll reveal por no ajustarse al panel. Las consultas UX `focus modal keyboard` y React `table filtering state` respaldan foco visible/no tapado y debounce de búsqueda. También se leyeron las reglas reales locales de `quick-reference.md`. Impeccable: auditoría de componentes y captura real según `docs/ACCEPTANCE.md`. Referencias y procedencia en `docs/REFERENCES.md`.

## Colors

{colors.primary} coincide con el color aproximado documentado en la landing, #3E4095. Base {colors.canvas}, sidebar {colors.sidebar}, texto {colors.ink} y secundario {colors.muted}. {colors.border} separa contenido, no es borde identificador de campos; los controles usan {colors.control-border}. Rojo, ámbar y verde sólo comunican estado, con etiquetas. No llenar superficies grandes con violeta. Monograma tipográfico original provisional junto a marca textual; no se presenta como logo oficial.

## Typography

DM Sans Variable autoalojada desde Fontsource (OFL), Segoe UI como fallback. 26px título, 17px sección, 14px cuerpo, 12–13px UI; filas compactas con metadatos secundarios de 10–11px sólo en escritorio. En móvil sube cuerpo a 14–16px y contenido prioritario a 15px. Pesos 400, 500 y 600; cifras tabulares donde corresponde, sin fuente mono ni display comercial.

## Layout

Sidebar 234px; topbar 58px con búsqueda y favoritos; aviso demo 33px. Contenido fluido con margen 30px. Selector de vista antes de búsqueda/filtros. Tabla por defecto con filas de 68px; sin apilar cards en el inicio. Panel 560px mantiene contexto; ficha completa con URL por hash. Móvil ≤767px: navegación desplegable, lista resumida en lugar de tabla, ficha de ancho completo. No barra inferior redundante. Objetivos táctiles 44px para acciones principales. Scroll en kanban y tablas secundarias contenido, sin desbordar página.

## Elevation & Depth

Base por superficie/borde. Sombras sólo para modal, panel y feedback. Capas: sidebar 10, navegación móvil 25, overlay 30, panel 35, modal 40, toast 50, skip-link 60. Motion restringido a feedback; reduced-motion elimina animación/transición.

## Shapes

{rounded.sm} badges; {rounded.md} botones/campos; {rounded.lg} paneles de contenido. Avatares circulares, sin fotos inventadas. Iconos Phosphor, una familia. No emojis como iconos.

## Components

AppShell, Sidebar, GlobalSearch, ViewSelector, FilterBar, DataTable, Kanban, RecordPanel, DetailPage, ActivityTimeline, TaskComposer, StatusBadge y StateMessage. Dialog de Radix gestiona foco atrapado, Escape y restauración; controles nativos etiquetados. Tabla abre ficha por botón accesible; drag tiene alternativa por selector en la ficha. Cambios inválidos muestran explicación, sin mover tarjeta. Mensajes de estado usan `role=status`; errores usan `role=alert`. Consulta conserva etapa, asignación, deuda y próxima acción como dimensiones distintas. No editar dos fechas de próxima acción independientes.

## Do's and Don'ts

- Mostrar claramente demo, procedencia y cobertura manual de WhatsApp.
- Una acción principal por contexto. Las notas y clics no verifican una respuesta.
- No copiar núcleo ni marca de Twenty/Odoo/Dental; implementación original.
- No inventar login seguro, datos reales, stock, cobros ni tiempos de SLA confirmados.
- Verificar capturas, foco y contraste. Lint de tokens no certifica WCAG.
- Mantener referencias/licencias preexistentes de las skills; no borrarlas.
