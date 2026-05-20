# Copiar el resto del proyecto
COPY . .

# Imprimir el contenido de la carpeta para ver los nombres reales
RUN ls -la resources/js/Components/UI/

# Compilar assets
RUN npm run build
