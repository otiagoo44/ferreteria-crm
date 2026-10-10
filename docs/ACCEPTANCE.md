# Aceptación y evidencia

Fecha de ejecución: 10/10/2026, entorno Windows local, Node 24.15.0. **Hito A entregado como demo; B/C/D no certificados.** El mockup no demuestra seguridad de producción.

## Funciona en demo

- Consultas: las ocho vistas pedidas, búsqueda con debounce, filtro, orden, columnas, tabla/kanban sobre los mismos registros, favoritos y vistas personales/compartidas persistidas en este navegador. Compartir no amplía el subconjunto del perfil demo. Filtros por tipo/estado en otros objetos.
- Ficha lateral sin perder el listado; ficha completa con URL. Resumen, Actividad, Presupuestos, Tareas y Archivos; este último explica el almacenamiento pendiente y no simula uploads.
- Crear consulta/cliente ficticios, vincular varias solicitudes al mismo cliente, asignar como supervisora, notas, atención manual, próxima acción derivada de tarea, completar tareas, transiciones, reapertura y cierre con resultado/motivo/vínculo.
- Presupuesto externo con importe opcional, revisión conservada, aceptación/rechazo e historial. Aceptación no es cobro/entrega. No editor contable, stock ni ERP.
- Clientes e historial autorizado por perfil de presentación; vendedores Ana/Diego, supervisora Marta y propietaria demo. **Selector de perfiles, no autenticación real.** Datos demo en localStorage: no guardar información real ni confidencial aquí.
- Informes de atención/seguimiento/resultados y cobertura formulario/alta manual. Los indicadores operativos abren sus listados. WhatsApp manual, cero mensajes verificados inventados y sin envíos al número del negocio.
- Configuración navegable: roles, calendario/SLA de ejemplo, motivos e integración desactivada. Guardar configuración demo no recalcula indicadores históricos.
- Estados vacío/error/carga revisables desde Perfil; demo explícita y reloj fijo. Modo real sin configuración falla y no cae a fixtures.

## Checks ejecutados

| Comando | Evidencia / alcance |
|---|---|
| `npm run build` | TypeScript + bundle Vite en modo demo; compilación local, no despliegue |
| `npm run lint` | ESLint; sin errores |
| `npm test` | 24 tests, 2 archivos: dominio y contrato/validador |
| `npm run test:ui` | 6 recorridos Chromium; formularios, relaciones, revisiones, permisos demo, búsqueda/vistas, cierre, modo real sin config, teclado, móvil y contraste de tokens |
| Ampliación del recorrido escritorio | Reejecutado: entrada de supervisión al abrir raíz, seguimiento y resultados con apertura de sus fichas; 1 test pasado adicionalmente |
| `npm run design:lint` | Google CLI: 0 errores, 0 advertencias |
| `npm audit` | 0 vulnerabilidades reportadas al ejecutar; no auditoría integral de seguridad |
| SHA256 del schema v1 | Idéntico a la copia local de ferreteria-occidental: `BA8CB6B9AE6E2B9A7A6104761647D544DB921455B155C2ABB5940A1DB5FB6F16` |

Dominio: consultas legítimas repetidas, separación de responsabilidad/etapa/vencimiento, restricciones de transición/cierre/versionado, tarea principal única, cobertura manual limitada, noches/fin de semana/feriado, fecha local de Asunción e igualdad de instantes ISO. Calendario probado es fixture de 08:00–15:00, nunca horario confirmado.

Contrato: AJV sobre schema compartido y validador Edge; consentimiento, mensaje o ítems, cantidades positivas/decimales finitas, unidades cerradas, teléfono, campos desconocidos/routing, límites y cuerpo mayor a 32 KiB. Estas pruebas **no prueban** concurrencia, commit, deduplicación ni disponibilidad de PostgreSQL.

Navegador: escritorio 1440×1000, móvil 390×844 y 360×780, tablet 768×1024. Móvil usa lista de consultas y ficha, sin encoger la tabla. Tab queda dentro del diálogo; Escape cierra y devuelve foco; flechas seleccionan pestañas. Tokens de texto contrastan al menos 4.5:1 y borde de control al menos 3:1. No se afirma una auditoría WCAG completa ni prueba con lector de pantalla.

Capturas generadas y examinadas visualmente:

- [Consultas escritorio](screenshots/consultas-desktop.png), [ficha escritorio](screenshots/ficha-desktop.png), [kanban](screenshots/kanban-desktop.png).
- [Informes](screenshots/informes-desktop.png), [consultas móvil](screenshots/consultas-mobile.png), [ficha móvil](screenshots/ficha-mobile.png), [tareas tablet](screenshots/tareas-tablet.png).

Los primeros runs detectaron selectores de test ambiguos y un filtro de empresas sin registros autorizados para Ana; se precisaron los locators y se verificó la vista vacía esperada. Un lint concurrente recorrió test-results mientras Playwright lo reemplazaba; los artefactos ahora están excluidos. No se ocultaron errores con reintentos ni timeouts ampliados.

## Preparado, sin ejecutar con backend real

Tres migraciones originales, RLS/grants, Storage privado sin upload habilitado, RPC transaccionales con autorización/locks/versionado y auditoría, rate limit durable y public-intake. Schema/response compartidos sin variantes incompatibles. No se conecta al Supabase de Dental ni se migró ningún proyecto existente.

`supabase/tests/access.test.sql` contiene 10 pruebas pgTAP candidatas con roles authenticated y anon, perfiles A/B y supervisión, organizaciones aisladas, cliente compartido, MFA y membresía desactivada. **No se ejecutaron:** no hay Docker/CLI de Supabase ni entorno/configuración identificados de Occidental. Tampoco se ejecutó Edge en Deno/HTTP contra una DB. La revisión de SQL es de lectura, sin afirmar validez de todas las transacciones/policies en un servidor.

El diagnóstico de Auth real no habilita operación. Recuperación/invitaciones/email/MFA, panel conectado, archivos, filtros/paginación servidor, calendario operacional, entrada posterior al cierre/reconexión y monitorización siguen pendientes según [PENDING](PENDING.md).

## Gates pendientes, bloqueantes de producción

| Gate | Prueba exigida en local/staging identificado |
|---|---|
| Corte vertical B | Auth → formulario → recepción persistida → asignación → revisión externa → tarea → resultado, con sesiones reales |
| Aislamiento | Anónimo sin lectura; vendedor A no lee B por registros/cliente compartido/búsqueda/counts/export/Storage; supervisión sólo su organización |
| Revocación y MFA | Membresía desactivada sin acceso con token anterior; MFA requerido para propietaria/supervisión, enrolamiento y recuperación reales |
| Idempotencia | Dos requests concurrentes idénticos → referencia/fecha única; mismo UUID diferente → 409; dos UUID mismo material/teléfono → dos casos |
| Disponibilidad | Timeout después de commit recupera resultado original; caída DB → error real, UI conserva el envío; no éxito ficticio |
| Abuso e integridad | Tamaño/campos/cantidades/teléfono/consentimiento, rate limit/Retry-After, organización/actor/rol manipulados; relaciones cruzadas rechazadas |
| Concurrencia | Reasignación y tarea/presupuesto concurrentes, expected_version ausente/obsoleto rechazado; permisos revalidados después del lock |
| Ciclos | Entrada nueva durante/después de respuesta conserva deuda correcta; reasignación no reinicia reloj; entrada tras cierre queda visible con decisión auditada |
| Calendario | No contar noche/días cerrados/feriados; versiones conservan historia; distinguir demora del equipo e individuo |
| Archivos | Subida autorizada, MIME/tamaño, aislamiento, versiones, descarga y TTL/revocación; ninguna URL pública permanente |
| Recuperación | Pérdida/reconexión refresca DB con aviso; jobs durables/leases/backoff/fallos cuando se implementen |
| Backup/carga | Restaurar DB y bytes Storage en entorno aislado y medir; acordar RPO/RTO, carga/latencias y responsables operativos |
| WhatsApp posterior | Proveedor/número/bandeja definidos, firmas/dedupe/desorden/reintentos/atribución/reconciliación; integración desactivada hasta entonces |

No se midió carga, no se restauró backup, no se probaron permisos con Supabase real y no hay garantía 24/7 o cero pérdida. Esos límites no se reemplazan por pantallas.
