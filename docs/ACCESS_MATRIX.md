# Matriz de acceso propuesta

Pendiente de acuerdo con la propietaria. Mínimo privilegio por defecto. Los perfiles del mockup sólo ayudan a mostrar comportamiento y no son seguridad.

| Recurso / acción | Anónimo | Vendedor | Supervisora | Propietaria |
|---|---|---|---|---|
| public-intake validado | Enviar | Enviar como formulario público | Igual | Igual |
| Consulta asignada | No | Sólo propia | Equipo de su organización | Organización |
| Cola sin asignar | No | No | Ver / asignar | Ver / asignar |
| Cliente relacionado | No | Sólo cliente de caso autorizado | Organización | Organización |
| Historial de cliente compartido | No | Sólo casos propios | Organización | Organización |
| Notas/tareas/presupuestos/archivos | No | Caso propio | Equipo | Organización |
| Reasignación | No | No | Sí | Sí |
| Informe general | No | No | Sí | Sí |
| Usuarios/roles | No | No | Lectura equipo | Administración pendiente de RPC |
| Snapshot intake/limitador | No | No | No vía API | No vía API |
| Editar auditoría | No | No | No | No |
| Vista compartida | No | Lectura permitida | Puede proponer compartir | Igual |

Todas las tablas creadas tienen RLS. Sin membresía activa no hay acceso de lectura aunque exista usuario Auth; la función consulta DB en cada petición. Supervisora/propietaria con aal1 quedan sin acceso; necesitan aal2. Desactivar debe probarse con el token anterior y las URLs previamente emitidas. Auth invitación/login/email/MFA todavía no están configurados ni probados.

Lectura de Storage sólo para archivos registrados de consultas autorizadas, bucket privado. Subida/actualización no habilitada; denegación hasta completar RPC de registro y límites. TTL firmado previsto ≤60 segundos; una URL firmada sigue válida hasta expirar. Revocación inmediata necesita descarga autorizada por petición, todavía pendiente. No exportación CSV implementada; antes de agregarla: RLS equivalente, permisos y protección contra fórmula (=,+,-,@ y controles iniciales).

RPC críticas comprueban permisos, versión, membresía y actor; search_path vacío y EXECUTE revocado a public/anon. Intake y limitador sólo service_role del servidor. No RPC genérica para actualizar cualquier fila. No service-role en frontend. Búsquedas/conteos reales deberán ejecutarse con sesión de usuario y RLS, sin usar service-role para ocultar fallos. Tests de acceso candidatos en supabase/tests, todavía no ejecutados.
