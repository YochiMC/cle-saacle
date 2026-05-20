# ============================================
# Etapa 1: Compilar assets con Node (Vite/React)
# ============================================
FROM node:22-alpine AS frontend

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci || npm install

# Copiar el resto del proyecto
COPY . .

# Imprimir el contenido de la carpeta para ver los nombres reales de los archivos
# Esto nos dirá qué está fallando con ModalAlert
RUN ls -la resources/js/Components/UI/

# Variables de entorno
ENV NODE_ENV=production
ENV APP_ENV=production

# Compilar assets
RUN npm run build


# ============================================
# Etapa 2: Laravel con PHP
# ============================================
FROM php:8.3-cli-slim

WORKDIR /var/www/html

# Dependencias del sistema y extensiones
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libzip-dev \
    libpq-dev \
    && docker-php-ext-install \
        zip \
        pdo \
        pdo_mysql \
        pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar proyecto
COPY . .

# Instalar dependencias PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copiar assets compilados desde la etapa de Node
COPY --from=frontend /app/public/build ./public/build

# Preparar directorios
RUN mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Exponer puerto
EXPOSE 10000

# Iniciar Laravel
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
