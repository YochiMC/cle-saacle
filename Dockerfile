# ============================================
# Etapa 1: Compilar assets con Node (Vite/React)
# ============================================
FROM node:22 AS frontend

WORKDIR /app

# Instalar dependencias de Node
COPY package*.json ./
RUN npm install

# Copiar el resto del proyecto y compilar
COPY . .
RUN npm run build


# ============================================
# Etapa 2: Aplicación Laravel con PHP
# ============================================
FROM php:8.3-cli

WORKDIR /var/www/html

# Instalar dependencias del sistema y extensiones PHP necesarias
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libzip-dev \
    libpq-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install \
        zip \
        pdo \
        pdo_mysql \
        pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar código fuente
COPY . .

# Instalar dependencias PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copiar assets compilados desde la etapa frontend
COPY --from=frontend /app/public/build ./public/build

# Crear directorios necesarios y ajustar permisos
RUN mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Cachear configuración (si APP_KEY no está disponible, no falla)
RUN php artisan config:cache || true
RUN php artisan route:cache || true
RUN php artisan view:cache || true

# Exponer el puerto utilizado por Render
EXPOSE 10000

# Comando de inicio
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
