# Guía de actualización del entorno de desarrollo: PHP 8.2 a PHP 8.3

Esta guía explica cómo estandarizar el entorno de desarrollo en PHP 8.3 y evitar errores de bloqueo de plataforma como `platform_check.php` al ejecutar el proyecto.

## Requisitos previos

Antes de comenzar, detén todos los servicios locales que dependan de PHP, por ejemplo Apache en XAMPP, Laragon o cualquier servidor local en ejecución.

## Actualización en Windows con XAMPP

Si utilizas XAMPP como servidor local, sigue estos pasos para actualizar PHP 8.3 sin perder bases de datos ni configuraciones de Apache.

### 1. Descargar PHP 8.3

1. Ve al sitio oficial de PHP para Windows: [windows.php.net/download](https://windows.php.net/download/).
2. Busca la sección de PHP 8.3 estable.
3. Descarga la versión VS16 x64 Thread Safe en formato ZIP.

Es importante que sea la versión Thread Safe para que funcione correctamente con el módulo de Apache de XAMPP.

### 2. Reemplazar la carpeta de PHP en XAMPP

1. Abre el panel de control de XAMPP y detén Apache y MySQL.
2. Ve al directorio de instalación de XAMPP, normalmente `C:\xampp`.
3. Cambia el nombre de la carpeta `php` a `php_viejo` como respaldo.
4. Crea una nueva carpeta vacía llamada `php` en `C:\xampp`.
5. Extrae el contenido del ZIP de PHP 8.3 dentro de `C:\xampp\php`.

### 3. Configurar el archivo `php.ini`

1. Entra en `C:\xampp\php` y localiza el archivo `php.ini-development`.
2. Copia ese archivo en el mismo directorio y renombra la copia a `php.ini`.
3. Abre `php.ini` con tu editor de texto o de código.
4. Busca la línea `;extension_dir = "ext"` y reemplázala por:

```ini
extension_dir = "C:\\xampp\\php\\ext"
```

5. Habilita las extensiones necesarias para Laravel quitando el punto y coma inicial en estas líneas:

```ini
extension=curl
extension=fileinfo
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=zip
```

6. Guarda el archivo y ciérralo.

## Verificación

Una vez aplicado el cambio, reinicia Apache y verifica la versión ejecutando:

```bash
php -v
```

Si todo quedó correcto, el proyecto debería detectar PHP 8.3 sin errores de plataforma.
