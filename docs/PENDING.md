# Pendientes y bloqueos reales

## Por acceso/entorno

- Confirmar Supabase de Occidental en local/staging. No hay URL/credenciales configuradas ni conector Supabase disponible. Docker/CLI no instalados. Migraciones, Edge y tests pgTAP no ejecutados.
- Configurar Auth/invitaciones/email/redirects, enrolamiento y recuperación MFA; demostrar vendedor A/B y supervisora autenticados.
- Conectar servicios del panel real; habilitar operación sólo después del corte vertical.

## Por implementación antes del piloto

- Revisar/ejecutar SQL y probar RLS/grants, aislamiento de archivos/counts/búsquedas, desactivación con token anterior y RPC concurrentes. No auditar sólo texto de SQL.
- Alta manual real, resolución de contacto autorizado/auditado/reversible; no merge por teléfono. Comunicación con landing real y timeout después del commit.
- Filtros tipados persistentes, búsqueda/paginación/counts servidor; selección masiva validada por fila. La demo filtra en memoria, sin escala ilimitada ni servidor.
- Vistas guardadas/preferencias en DB y filtros autorizados por campo. Demo personal/compartida en este navegador.
- Storage privado: subida, MIME/tamaño/registro, versionado, misma consulta de archivo y presupuesto, revocación/TTL y descarga autorizada. Demo no sube archivos reales.
- Calendario/versiones/SLA servidor; historial de asignación y excepción explícita de espera sin tarea. Entrada humana posterior/cierre y cobertura de respuesta concurrente con event refs.
- Reconexión/refresco, polling y error visible; alertas durables/revisión de fallos y monitorización.
- Backup DB + bytes de Storage, restore aislado medido; ensayos de carga y operación.

## Decisiones de la propietaria

- Política final de acceso e informes, responsables/turnos y criterios de atención.
- Horario laboral, feriados, SLA y motivos de pérdida/cancelación.
- Retención/consentimiento, contacto compartido, revisión/merge y excepciones de seguimiento.
- WhatsApp: número/proveedor y bandeja con agentes identificados. Integración aún desactivada.
- RPO/RTO, volumen representativo, disponibilidad operativa, mantenimiento y gastos. No se contrataron por iniciativa propia.

## Bloquea declarar producción

Cada gate en ACCEPTANCE debe ejecutarse con evidencias. No considerar el mockup, build ni tests de strings/snapshots como seguridad. Se preservaron la landing, Dental CRM y assets/docs recibidos; no se aplicaron migraciones en otros proyectos ni se publicó el repo.
