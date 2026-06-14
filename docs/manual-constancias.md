# Módulo de constancias

## Objetivo
Centralizar la generación, personalización, emisión y verificación pública de constancias de acreditación.

## Flujo
1. El personal autorizado selecciona a un alumno acreditado.
2. El sistema crea un registro en `certificate_records` con estado `draft`.
3. La vista de personalización permite ajustar nombre, carrera, promedio, nivel, pronombre y firmantes.
4. Al confirmar, el registro pasa a `confirmed`.
5. Al descargar el PDF, se genera el archivo final, se guarda en `storage/app/public/certificates` y el estado pasa a `issued`.
6. La constancia puede verificarse públicamente con el QR en `/verificar-constancia/{code}`.

## Autorización
La policy `CertificateRecordPolicy` controla el acceso al módulo.

- `viewAny`: listado del módulo.
- `manage`: acciones masivas de acreditaciones.
- `preview`: previsualización.
- `create`: creación del borrador.
- `view`: apertura de personalización.
- `confirm`: confirmación de datos.
- `download`: descarga del PDF emitido.

## Diseño
- El módulo usa la paleta institucional del sistema con `blueTec` y `orangeTec`.
- Las plantillas PDF comparten una base común para mantener consistencia.
- Los firmantes se guardan por certificado para que el documento final sea reproducible.

## Migraciones
La tabla `certificate_records` se consolidó en una sola migración base y se retiraron las migraciones parciales del módulo para evitar divergencia estructural.
