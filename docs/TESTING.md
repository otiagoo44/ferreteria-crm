# Cómo probar el mockup con la dueña

Todo este recorrido usa datos ficticios. Cambios guardados en localStorage del navegador; otro dispositivo/navegador no los comparte. No ingresar clientes reales, documentos confidenciales ni contraseñas de personal. WhatsApp es manual y no se envían mensajes desde la demo.

## Arranque

En la computadora de desarrollo:

```powershell
cd C:\htdocs\ferreteria-crm
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173. Si el servidor ya está activo, usar directamente esa URL. Para otra computadora, clonar el repo, instalar Node compatible (>=22.12), entrar al directorio y ejecutar los mismos comandos. La URL localhost funciona en la computadora donde se ejecuta el servidor, no es un enlace público para enviar a la dueña.

En Perfil, elegir Ana y restablecer los datos demo antes del recorrido. Restablecer reemplaza los cambios ficticios de la demo en ese navegador. Reloj de ejemplo fijo: 10/10/2026 a las 11:00 en Asunción.

## Recorrido de 15 minutos

| Paso | Qué hacer | Qué debe ocurrir |
|---|---|---|
| 1. Pendientes | Consultas → Mis pendientes | Ver asunto/cliente, etapa, responsable, deuda de respuesta, próxima acción y vencimiento; los pendientes vencidos aparecen primero |
| 2. Ficha | Abrir Materiales para ampliación | Panel lateral conserva el listado; sus cinco pestañas muestran la misma consulta. Abrir ficha completa y recargar mantiene su URL |
| 3. Atención | Registrar atención manual con un resultado | La deuda cubierta deja de aparecer; Actividad registra autor/evidencia manual. Una nota interna por sí sola no cancela la deuda |
| 4. Presupuesto | En la ficha, Presupuestos → Registrar. Usar DEMO-001, importe opcional y validez | Se registra documento externo y cambia a Presupuesto enviado. Registrar revisión DEMO-001-R2 conserva v1 y v2 |
| 5. Aceptación | Registrar aceptación de la revisión | Se conserva la revisión aceptada y pasa a Aceptada. No genera cobro, factura, entrega ni movimiento de stock |
| 6. Próxima acción | Tareas de la ficha → Crear tarea con fecha. Completarla | Resumen deriva su próxima acción de la tarea principal. Al completarla, hay que revisar si corresponde programar otra |
| 7. Cierre | Cerrar como perdida sin motivo y luego con motivo | Primero rechaza el cierre; después guarda resultado e historial. Duplicada exige otra consulta vinculada. Se puede reabrir por transición auditada en demo |
| 8. Organización | Tabla/kanban; búsqueda, filtro, orden, columnas; guardar y marcar favorita una vista | Ambas presentaciones leen los mismos casos. La vista conserva su configuración al recargar y desde favoritos. El cambio de etapa también está en la ficha, sin drag |
| 9. Búsqueda | Ctrl/Cmd K y buscar cliente o referencia | Encontrar sólo registros del perfil demo; abrir la ficha del resultado |
| 10. Clientes | Abrir Carlos Medina y crear una consulta adicional para ese cliente | Varias consultas quedan relacionadas; no se reemplaza su solicitud anterior ni se crea obligatoriamente otro cliente |
| 11. Supervisión | Perfil → Marta; Informes; luego Consultas → Sin asignar | Ver atención del equipo, deuda, vencimientos y carga por responsable. Asignar un caso a Ana lo quita de la cola sin asignar |
| 12. Seguimiento/resultados | Informes → Seguimiento y Resultados | Abrir los casos desde los listados. Presupuesto aceptado y venta declarada se presentan separados de cobros |
| 13. Otro vendedor | Perfil → Diego y revisar consultas/clientes | El perfil presenta sus casos; un cliente compartido no muestra casos de Ana. Esto demuestra UX demo, no RLS real |
| 14. Configuración | Revisar usuarios, calendario, motivos e integración | Horarios/SLA son ejemplos. Guardar no cambia una operación real. WhatsApp está desactivado como integración |
| 15. Móvil/teclado | Reducir ventana a 390 px; abrir ficha. Tab, flechas en pestañas y Escape | Lista resumida, ficha legible, foco dentro del diálogo y retorno al cerrar; no tabla de escritorio encogida |

Archivos explica la futura subida privada, sin simular almacenamiento. En Perfil también se pueden revisar estados de carga/vacío/error. Para una segunda presentación, restablecer los fixtures y volver al perfil elegido.

## Pruebas técnicas locales

```powershell
npm run build
npm run lint
npm test
npm run design:lint
npx playwright install chromium
npm run test:ui
npm audit
```

Esperado al entregar: build/lint correctos, 24 tests de dominio/contrato, 6 recorridos de navegador, diseño sin errores/advertencias y audit sin vulnerabilidades reportadas. Playwright prepara un segundo servidor de prueba en 5184 para demostrar que el modo real sin configuración falla explícitamente. Mantener ese puerto libre. Capturas en docs/screenshots; trazas de fallos en test-results (no se publican).

## Lo que todavía no se puede certificar

Login operativo, recuperación/MFA, aislamiento RLS/Storage, intake HTTP con commit real/idempotencia concurrente, reconexión, calendario servidor, backups y carga. Requieren Supabase local/staging confirmado de Occidental y el corte vertical. Configurar variables no convierte el mockup en un CRM operativo: el acceso real todavía es diagnóstico y el panel no se habilita.

Usar [OPERATIONS](OPERATIONS.md) para preparar ese entorno; [ACCEPTANCE](ACCEPTANCE.md) define los gates, y [PENDING](PENDING.md) separa accesos, implementación y decisiones del negocio. No ejecutar las migraciones contra Dental CRM ni contra producción durante la presentación.

## Para explicar su valor

La dueña podrá ver qué clientes esperan respuesta, qué vendedor se ocupa, qué presupuesto sigue pendiente y cuál es la próxima acción prometida. Eso permite repartir trabajo, detectar demoras y revisar resultados sin depender de conversaciones dispersas. Esta primera etapa busca mejorar atención y seguimiento; el control de stock, caja y facturación queda fuera del alcance.
