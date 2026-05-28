# ==========================================
# Etapa 1: Base de PHP (FrankenPHP)
# ==========================================
FROM dunglas/frankenphp:1-php8.3-bookworm AS php-base

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip \
    && rm -rf /var/lib/apt/lists/*

RUN install-php-extensions \
    bcmath \
    curl \
    exif \
    gd \
    intl \
    mbstring \
    opcache \
    pcntl \
    pdo_mysql \
    pdo_pgsql \
    redis \
    sockets \
    xml \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV SERVER_ROOT=/app/public
ENV SERVER_NAME=:80

# ==========================================
# Etapa 2: Construcción del Frontend (Node)
# ==========================================
FROM node:22-bookworm-slim AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# Etapa 3: Dependencias de Backend (Composer)
# ==========================================
FROM php-base AS vendor

WORKDIR /app

COPY . .
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# ==========================================
# Etapa 4: Imagen Final de Producción
# ==========================================
FROM php-base AS app

WORKDIR /app

COPY --from=vendor /app /app
COPY --from=frontend /app/public/build /app/public/build

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwX storage bootstrap/cache

# Quitar la capacidad de red que Render bloquea por seguridad (Evita el error 126)
RUN setcap -r /usr/local/bin/frankenphp || true

# Configuración crucial para Render (Manejo dinámico de puertos)
ENV SERVER_NAME=":${PORT:-80}"

# ENTRYPOINT SIN MIGRACIONES: Solo cachea la configuración y arranca el servidor
ENTRYPOINT ["sh", "-lc", "export SERVER_NAME=:${PORT:-80}; php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan event:cache && exec frankenphp run"]
