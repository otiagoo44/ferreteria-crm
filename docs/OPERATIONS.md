# Operación y habilitación por hitos

## A: Demo

`npm ci; npm run dev` inicia en 127.0.0.1:5173, modo demo explícito. Sólo localStorage, reloj fijo y fixtures. No introducir datos reales. Un perfil cambiado representa una experiencia, no autorización autenticada. Restablecer desde Perfil. Configuración de calendario/SLA sólo guarda ejemplos y no reescribe indicadores.

## B: Corte real aislado (pendiente)

1. Identificar proyecto Occidental con nombre, project ref, propietario y entorno; registrar esa evidencia sin secretos. No usar Dental, landing Supabase ajeno ni producción. No ejecutar `db push` a un proyecto ambiguo.
2. Disponer Docker + CLI Supabase; en este repo `supabase start` y `supabase db reset --local` crean/aplican el entorno occidental-crm-local. No ejecutados en esta entrega. Config local tiene signup=false; comprobar CLI contra versión actual antes de correr.
3. Revisar migraciones con SQL/RLS linter. Crear organización y usuarios de prueba/invitaciones sin personas reales. Sembrar profiles/memberships desde administración controlada. No auto membresía por JWT ni email.
4. Configurar email, redirects del entorno y recuperación; probar enlace, caducidad y retorno. Enrolar TOTP propietario/supervisión y probar aal1 bloqueado, aal2 permitido, recuperación, revocación y desactivación de membresía con token anterior.
5. Guardar secretos de Edge en fichero fuera de git y sin mostrarlos. `supabase functions serve public-intake --env-file <archivo-privado> --no-verify-jwt` sólo en local. OCCIDENTAL_ORGANIZATION_ID debe existir; CORS sólo origins de landing de prueba. Salt aleatoria privada. El endpoint público no usa signup/lectura privada.
6. `supabase test db` ejecuta los tests candidatos de rol/RLS. Completar tests REST/Storage con dos sesiones vendedor y supervisora MFA, no sólo service-role. Enviar fixture reservado del contrato al endpoint, concurrente y con DB caída.
7. Conectar repositorio de datos frontend real, listar con paginación/filtros servidor tipados, counts RLS, búsqueda con debounce y cancelación; RPC asignación/presupuesto/tarea/resultado. Registrar recepción→asignación→revisión→tarea→resultado con evidencias de DB.

No hay proyecto staging seleccionado ni credenciales proporcionadas. No se contactó un servicio Supabase ni números reales en esta sesión. No se compró infraestructura. Los comandos anteriores son instrucciones pendientes de ejecución, no resultados.

## C: Operación

Completar resolución de clientes no verificados (coincidencias sólo sugeridas), alta manual real, notas, vistas y preferencias persistentes mediante funciones específicas; validación JSON de filtros con field/operator permitidos. Compartir vista no amplía RLS. Archivos privados con registro, MIME/tamaño real y download por sesión, signed TTL corto cuando corresponda. Validar igual organización **y misma consulta** para archivo/version. Exportación no implementada.

Calendario versionado por empresa: días/turnos/excepciones y feriados confirmados. No usar 08:00–15:00 demo como horario real. Separar tiempo de equipo/ciclo y tiempo bajo asignación individual. Cambios de calendario no alteran plazos históricos. Seguimiento en espera del cliente debe tener tarea o excepción auditada, no desaparecer.

Refrescar DB al reconectar, polling y aviso de pérdida de conexión; realtime sólo mejora frescura. No actualizar métricas reales sin commit confirmado. Futuras alertas con outbox transaccional y jobs durables (lease/backoff/límite/fallos visibles). La demo no recibe mensajes posteriores a un formulario ni muestra un chat ficticio.

## D: Gate de producción

Ver ACCEPTANCE/PENDING/BACKUP_RESTORE. Requiere evidencia real de aislamiento, MFA, concurrencia e idempotencia, recuperación, restauración de bytes Storage, carga representativa acordada y operación responsable. Build exitoso no habilita producción. No promesa 24/7, disponibilidad ilimitada o cero pérdida.

Monitorizar tasa 422/429/503, latencia/errores de recepción, conflictos de idempotencia/versiones, consultas sin asignar y sin próxima acción, buckets expirados, fallos de archivos y backups. Logs con correlation ID/código; nunca tokens, mensajes completos ni teléfonos. Definir retención, redacción, alertas y responsables con negocio. Limpiador de rate_limit_buckets por retención/cron pendiente.

## E: WhatsApp posterior

Hoy manual y sin envío. Definir número, proveedor, bandeja y usuarios identificados. Hasta entonces integración desactivada. Si se autoriza: verificar firma, dedupe provider_id/event_id, persistir antes de responder, manejar orden inverso/reintentos y atribuir envío a sesión. Timeout ambiguo pide reconciliación, no reenvío ciego. Remitente desconocido o varias consultas posibles va a revisión. Nota/clic/bot/cambio de etapa no prueba atención. Entrada tras cierre crea pendiente visible con reapertura o nueva consulta vinculada; no archivarla silenciosamente.
