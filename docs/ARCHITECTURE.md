# Arquitectura y estado de implementación

La entrega del 10/10/2026 es un mockup interactivo local. No es un sistema de producción. El panel real está deshabilitado deliberadamente: puede verificar credenciales si se configura, pero no carga fixtures ni habilita operación cuando falla Supabase.

## Componentes

- React + TypeScript + Vite + Tailwind; features de consultas y secciones secundarias. `src/domain` concentra filtros, transiciones, tareas, evidencia y calendario de ejemplo.
- `demoRepository` persiste exclusivamente datos ficticios en localStorage versionado. No representa persistencia compartida, autenticación ni aislamiento de seguridad. Reinicio desde Perfil.
- Supabase es la única base operativa prevista: PostgreSQL, Auth, RLS y Storage privado. Tres migraciones originales y Edge Function `public-intake` son candidatos para staging, todavía no ejecutados.
- Landing separada en ferreteria-occidental. Contrato v1 idéntico. No se incluye catálogo dentro del panel ni se habilitan lecturas anónimas de tablas.

## ADR 001: CRM propio con Supabase

Decisión: implementar CRM de atención propio, con alcance acotado a una sucursal. Twenty y Odoo son referencias, no dependencias desplegadas. No se importa núcleo, metadata engine, backend, esquema, Redis ni módulos ERP. Dental CRM aporta patrones de validación y relaciones por organización; no navegación, agenda dental ni deduplicación por tratamiento. Motivo: mantener invariantes de negocio y permisos claros sin un framework genérico de objetos.

## Flujo previsto

Landing → public-intake → limitador durable → receive_intake transaccional → consulta en cola sin asignar + canal no verificado + ítems + evento + ciclo de atención. El éxito se entrega tras retorno de RPC (commit); un reintento usa misma organización/UUID y hash JSONB normalizado. Otro UUID produce otra solicitud.

Personal Auth → membresía activa consultada en DB → RLS → RPC autorizadas con expected_version y bloqueo de fila → auditoría. Supervisora/propietaria requieren aal2; vendedor ve sus consultas, no la cola sin asignar. El actor deriva de auth.uid(), nunca de payload. La UI real y sus servicios paginados todavía deben conectarse a estas operaciones y probarse.

## Lo pendiente en B/C

No hay proyecto Supabase de Occidental identificado, credenciales nuevas ni migraciones aplicadas. Docker y CLI Supabase no están disponibles. No se usaron credenciales de Dental ni otros repositorios. Falta: setup de usuarios, enrolamiento/recuperación MFA, recuperación email, alta manual real, resolución autorizada de contacto, filtros/paginación/búsqueda de servidor, persistencia de vistas, descarga/subida de archivos y calendario operativo/SLA. Las RPC implementadas cubren recepción, asignación, transición, atención manual, tarea principal y versiones/decisiones de presupuesto; son código sin validación de ejecución real.

La función de calendario del dominio se prueba con ejemplos; no asigna plazos históricos reales. receive_intake deja due_at nulo hasta confirmar un calendario versionado. Toda deuda sigue visible en Por responder y sin asignar, aunque no tenga SLA. Las políticas deniegan todas las escrituras directas desde cliente. Vistas/preferencias son sólo lectura en la migración inicial; no se presentan como persistencia real completa.

## Concurrencia y frescura

Expected_version y bloqueos previenen overwrite en las RPC escritas. record_manual_attention cubre un evento humano de la consulta; si llegó una entrada posterior, conserva deuda y reloj. No existe integración que inserte mensajes posteriores todavía. Esa API debe serializarse por consulta, reutilizar el ciclo abierto y mantener visible una entrada tras cierre con decisión de reapertura/vinculación auditada.

Realtime/polling/outbox no están implementados. Antes de piloto: refresco desde DB al reconectar, aviso de desconexión, polling de respaldo, errores sin mutación optimista permanente. Si se agregan alertas: outbox transaccional, leases, backoff, límite de intentos, alertas/revisión de fallos. No cola de memoria que responda éxito, Redis ni n8n obligatorio.

## Dependencias

Radix Dialog: foco atrapado, Escape y semántica. Phosphor: iconografía uniforme. Fontsource DM Sans: fuente local OFL. Supabase JS: acceso real y Edge. AJV: validación de compatibilidad del contrato en pruebas. Vitest: dominio/límites. Playwright: interacción y capturas. Prettier/ESLint/TypeScript: mantenimiento. Sin Motion/GSAP porque el movimiento requerido es mínimo. Lockfile incluido; npm audit registrado en ACCEPTANCE.
