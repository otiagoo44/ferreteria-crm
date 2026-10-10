# Ferretería Occidental · CRM

Mockup interactivo para presentar a la propietaria. React + TypeScript + Vite + Tailwind; identidad clara azul violáceo, interacción inspirada en Twenty. **No es un CRM seguro de producción.** Datos ficticios y cambios en este navegador; WhatsApp manual, sin mensajes reales.

Una sucursal en Villa Hayes, Paraguay. Datos de negocio recibidos: Elvio de Felice / Curupayty; +595 971 247207. Son referencias del negocio, no fixtures ni destinatarios de pruebas. Marca textual/monograma provisional hasta contar con el archivo original.

## Iniciar hoy

Requiere Node >=22.12 (validado con Node 24.15).

```powershell
cd C:\htdocs\ferreteria-crm
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173. `dev` usa explícitamente `.env.demo`. También `npm run build` y `npm run preview` sirven la demo compilada. El puerto 5173 es fijo; cerrá otro proceso del mismo puerto si está ocupado.

## Recorrido de presentación

1. Entrada Ana → Consultas / Mis pendientes: necesidades, atención, responsable, próxima acción y vencimiento.
2. Abrir Materiales para ampliación → ficha lateral → registrar atención manual → Actividad. Agregar presupuesto externo desde Presupuestos; revisiones conservan historial.
3. Programar próxima acción, completar una tarea, cerrar con resultado. Perdida/cancelada requieren motivo; duplicada exige vínculo.
4. Alternar tabla/kanban; usar filtro, búsqueda, columnas, guardar vista y favorito. Ctrl/Cmd K abre búsqueda global. Ficha completa conserva URL por hash.
5. Perfil (al pie) → Marta → Resumen de atención; Sin asignar → asignar a un vendedor. Perfil Diego muestra sus consultas. En clientes, una misma relación puede tener varias solicitudes.
6. Configuración → integración manual y ejemplos de calendario/SLA. Perfil permite restablecer fixtures. La demo usa reloj fijo 10/10/2026, 11:00 Asunción; no horario real de apertura.

Las cinco secciones y vistas están navegables; móvil usa lista y ficha completa. No se envía a WhatsApp ni al teléfono del negocio. No hay stock, caja, pagos, factura, compras, reparto ni agente IA.

## Qué se entrega

| Estado | Alcance |
|---|---|
| Funciona en demo | Navegación, filtros por objeto, tabla/kanban, fichas, relaciones, asignación, atención/notas, tareas, versiones/decisiones, cierres, roles de presentación, informes y vistas guardadas |
| Backend real probado | Ninguno; no se identificó un Supabase de Occidental y no se ejecutaron migraciones |
| Preparado para staging | Modelo SQL/RLS, RPC críticas, Edge public-intake, contrato idéntico a landing, pruebas de acceso candidatas |
| Depende de accesos | Supabase aislado, Docker/CLI para local, Auth/email/MFA, Storage y corte vertical |
| Depende del negocio | Roles, responsable inicial, calendario/feriados, objetivos SLA, motivos, proveedor/número WhatsApp, RPO/RTO y carga representativa |
| Bloquea producción | Gate de seguridad/transacciones, recuperación, concurrencia, archivos, alertas/monitorización y restauración medidos |

## Modo real

Copiar `.env.example` a `.env.real.local`, establecer `VITE_APP_MODE=real`, `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` de un proyecto **confirmado de Occidental**. Nunca service-role, DB password ni clave privada con prefijo VITE_. `npm run dev:real` usa puerto 5174. Sin configuración devuelve error explícito. El acceso real es un diagnóstico de credenciales/membresía y cierra sesión; el panel operativo aún no se habilita. No reemplaza B ni da acceso a demo ante errores.

Edge requiere secretos servidor: OCCIDENTAL_ORGANIZATION_ID, INTAKE_ALLOWED_ORIGINS, INTAKE_RATE_SALT y secretos Supabase del runtime. Revisar [ARCHITECTURE](docs/ARCHITECTURE.md) y [OPERATIONS](docs/OPERATIONS.md) antes de ejecutar migraciones sólo en local/staging identificado. Dental CRM y su Supabase no fueron modificados.

## Validación

```powershell
npm run build
npm run lint
npm test
npm run design:lint
npx playwright install chromium
npm run test:ui
npm audit
```

Resultados y límites: [ACCEPTANCE](docs/ACCEPTANCE.md). Capturas en `docs/screenshots`. Los tests de dominio/contrato y navegador no sustituyen RLS, Auth, HTTP Edge o transacciones en Supabase. No se afirma auditoría exhaustiva de Twenty/Odoo.

Para probar cada sección con resultados esperados: [guía de pruebas](docs/TESTING.md).

Diseño: [DESIGN.md](DESIGN.md). Arquitectura, modelo, permisos, contrato, pendientes, operación y backups en `docs`. Referencias/licencias en [REFERENCES](docs/REFERENCES.md). Publicar el código en GitHub no despliega el panel ni habilita producción.
