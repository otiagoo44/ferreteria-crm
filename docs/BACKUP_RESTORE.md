# Backup y restauración

No hay backups configurados ni restauraciones ejecutadas. RPO/RTO objetivo **pendientes de acuerdo** según volumen, costo y tolerancia del negocio; sin promesa de cero pérdida o 24/7.

PostgreSQL y bytes de Storage se respaldan por separado. Un dump de metadatos storage.objects no contiene los PDFs/imágenes. Auth, membresías, RLS, funciones, schema y calendario también deben recuperarse. Registrar versión de migraciones y política de secretos del entorno, sin incrustarlos en el respaldo ni repo.

Procedimiento a validar en proyecto aislado:

1. Elegir snapshot/dump y copia consistente de los objetos privados; registrar fecha UTC y manifiesto de object_path, MIME, bytes y checksum.
2. Crear destino local/staging identificado distinto del origen; desactivar intake, trabajos y envío de mensajes. Revocar integraciones de salida durante la restauración.
3. Aplicar esquema/migraciones compatibles; restaurar datos PostgreSQL y luego bytes del bucket privado sin hacerlo público. Validar referencias huérfanas y checksums.
4. Reconfigurar Auth/redirects, secrets y calendar version. No reutilizar tokens de producción en pruebas. Entrar con dos vendedores y supervisora MFA; probar acceso y negación en consultas/relaciones/archivos/counts.
5. Simular intake nuevo y reintento con mismo UUID; comprobar referencia original. Verificar pendientes, versiones, auditoría y plazos históricos.
6. Medir duración total y antigüedad recuperada. Documentar RTO/RPO observados, cantidad de bytes/filas, fallos, responsables y acciones. No declarar backup operativo sólo porque terminó un job.

Antes de piloto: backups automáticos, verificación/alerta de fallos, cifrado y acceso restringido, retención acordada, revisión de costo, rutina de restauración periódica y responsable suplente. Probar pérdida parcial de archivos y restauración incremental. Cambiar claves/URLs no garantiza revocar signed URLs aún vigentes; considerar endpoint autorizado por petición según política.
