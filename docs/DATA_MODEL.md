# Modelo mínimo

PostgreSQL es autoridad en modo real. IDs UUID, tiempos timestamptz UTC, presentación America/Asuncion; importes numeric exactos, cantidades numeric sin redondeo de escala impuesto, unidades cerradas del contrato. No float para importes.

| Entidad | Relación y propósito |
|---|---|
| organizations | Una empresa; timezone |
| profiles / memberships | Auth ID + pertenencia activa y rol; no contraseñas propias |
| customers | Persona/empresa resuelta por revisión, múltiples consultas |
| contact_channels | Teléfono no único; puede pertenecer a consulta no identificada o cliente revisado |
| inquiries / inquiry_items | Etapa, asignación, resultado, versión, snapshot no confiable e ítems |
| tasks | Título, responsable, plazo, completado, versión; próxima acción por primary_task_id |
| quotes / quote_versions | Documento externo y revisiones inmutables; versión aceptada explícita |
| activity_events | Evento append-only por servidor, actor de sesión, evidencia y secuencia |
| response_cycles | Deuda abierta, evento inicial/último/cubierto, tiempo y calendario histórico |
| private_files | Archivo de una consulta, MIME/tamaño/path, Storage privado |
| saved_views / user_preferences | Configuración personal/compartida; no permisos adicionales |
| business_hours / calendar_exceptions | Versiones, turnos y excepciones configurables |
| intake_submissions | Idempotencia por org/UUID, hash, snapshot y respuesta original |
| rate_limit_buckets | Contadores durables por empresa, bucket y ventana |

Relaciones de negocio llevan organization_id y FK compuestas. Tarea principal tiene FK (organización, consulta, tarea); no puede enlazar tarea de otra consulta. Un cliente compartido no amplía permisos: el historial se filtra por consulta. Las relaciones de archivos/presupuestos necesitan autorización equivalente y validación adicional de pertenencia a la misma consulta en la futura RPC de archivos.

## Identidad de remitente

Intake anónimo no crea una identidad confirmada ni sobrescribe un cliente. Crea una consulta con customer_id nulo, snapshot y canal no verificado ligado a esa consulta. Supervisión debe resolver el contacto por una futura RPC auditada que vincule un cliente existente o cree uno revisado. Esto evita crear un cliente definitivo por cada solicitud y evita fusionar sólo por teléfono. Sugerencias de coincidencia, merge reversible y sus pruebas siguen pendientes; los fixtures UI ya muestran un cliente con dos consultas independientes.

## Etapas

Nueva → En atención / Por presupuestar / Cerrada. En atención → Por presupuestar / Cerrada. Por presupuestar → En atención / Presupuesto enviado / Cerrada. Presupuesto enviado → En atención / Por presupuestar / Aceptada / Cerrada. Aceptada → En atención / Cerrada. Cerrada → En atención con auditoría. Registro de presupuesto real exige Por presupuestar o Presupuesto enviado. Aceptación exige versión existente.

En seguimiento es un filtro por tarea activa, no una etapa. Sin asignar es responsible nulo. Vencida es consulta abierta con deuda o tarea principal fuera de plazo. Cerrada exige resultado; perdida/cancelada exigen motivo; duplicada exige vínculo diferente y autorizado. Aceptada no es cobro ni entrega. Cierre/atención no deben borrar mensajes posteriores.

## Límites conocidos

En demo no hay concurrencia multiusuario ni tiempos de servidor. El reloj se fija al 10/10/2026 11:00 Asunción para que los escenarios sean reproducibles. Hay tarea principal única y el historial anterior se conserva. Completar una tarea abierta sin otra requiere decidir nueva acción o excepción explícita en la operación real. Ese gate no está finalizado. Negocio debe confirmar calendario y causas de espera. El SQL aún no calcula due_at según turnos ni inserta entradas posteriores al intake. No se implementan integración jobs, provider_events ni conversation_messages sin proveedor útil.
