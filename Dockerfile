# ============================================
# Etapa 1: Compilar assets con Node (Vite/React)
# ============================================
FROM node:22 AS frontend

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci || npm install

# Copiar el resto del proyecto
COPY . .

# Variables mínimas para Vite
ENV NODE_ENV=production
ENV APP_ENV=production

# Compilar assets
RUN npm run build


# ============================================
# Etapa 2: Laravel con PHP
# ============================================
FROM php:8.3-cli

WORKDIR /var/www/html

# Dependencias del sistema y extensiones PHP
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

# Copiar assets compilados
COPY --from=frontend /app/public/build ./public/build

# Preparar directorios
RUN mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Exponer puerto
EXPOSE 10000

# Iniciar Laravel
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
