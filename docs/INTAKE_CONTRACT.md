# Public intake v1, contrato cerrado

Custodio: ferreteria-crm. La copia se adoptó de C:/htdocs/ferreteria-occidental/contracts/intake-v1.schema.json y response schema **sin cambios de bytes**. Cambios posteriores requieren versión, actualización coordinada y prueba de compatibilidad; no otro repo. Fixture usa +1 202 555 0123, número reservado para ficción, sin enviar mensajes.

POST /functions/v1/public-intake, application/json. Campos exactos en `contracts/intake-v1.schema.json`: schema_version=1, submission_id UUID, name, phone E.164, message, items[] (product_ref opcional, description, quantity, unit), fulfilment_preference opcional, contact_consent=true, consent_version, attribution opcional (source/campaign). Ningún routing de empresa, actor, rol ni responsable. Sin adjuntos anónimos. Un mensaje útil tiene al menos 8 caracteres sin espacios exteriores; en su ausencia se exige un ítem.

Límites: 32768 bytes brutos; 50 ítems; nombre 2–100; mensaje ≤2000; descripción 2–300; product_ref 1–100; consent_version 1–50; source/campaign ≤200. Cantidad >0, finita y ≤1000000; unidad/bolsa enteras, kg/m/m2/m3/l/por_confirmar admiten decimales. Preferencias pickup/delivery/unsure no prometen reparto. Entradas no verificadas, sin precio/stock/identidad autenticada. No HTML renderizado desde notas: React escapa texto.

| HTTP | Respuesta |
|---|---|
| 201 | Tras commit: {status:"received", reference, received_at} |
| 200 | Reintento mismo UUID/payload con misma referencia y fecha |
| 409 | Mismo UUID en la empresa con payload distinto |
| 422 | Payload, tipo, tamaño, consentimiento o campos inválidos |
| 429 | Budget durable excedido, Retry-After: 3600 conservador |
| 503 | Configuración/DB/RPC indisponible, sin falso éxito |

Reference es UUID opaco. No endpoint de consulta pública por referencia. CORS allowlist es capa de navegador, no autenticación; sin Origin también requiere validación y límites. Origin desconocido devuelve 403; método distinto 405. Config privada OCCIDENTAL_ORGANIZATION_ID del servidor. Claves públicas de formulario no se consideran secretos. No signup público de personal.

Idempotencia se serializa por advisory transaction lock de organización/UUID. DB calcula SHA256 de JSONB normalizado, no hash enviado por cliente; orden de claves no cambia significado. Dos UUID distintos, mismo teléfono/material, producen dos consultas. No un índice de contacto/material. El reintento tras timeout posterior al commit recupera la recepción original. El cliente conserva UUID y payload para reintento idéntico; al editar genera otro UUID. La landing ya contiene adaptador demo y no se modificó en esta tarea.

Límites de abuso iniciales propuestos: 120 peticiones/empresa/hora y 10/teléfono hasheado/hora, con sal privada. No se confía en X-Forwarded-For anónimo. Falta calibrar antiabuso de ingreso, captcha/budget de infraestructura y retention con operación; CORS no protege de clientes no navegador. Contadores se confirman en RPC separada para que una denegación no revierta el límite. Los reintentos también consumen budget. No se registran teléfonos, tokens ni cuerpo en logs. No cola en RAM.

Código Edge y RPC entregado, todavía sin despliegue ni prueba de HTTP real/concurrencia/timeout. Los tests unitarios verifican esquema, validador y lectura acotada, no commit ni RLS. Confirmación real podría ofrecer WhatsApp con referencia/resumen después de guardar; no se implementa ni prueba envío. Un WhatsApp directo no entra al CRM automáticamente.
