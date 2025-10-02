# Usar Node.js LTS como base
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias solo de producción
RUN npm ci --only=production

# Copiar el resto de archivos
COPY . .

# Construir archivos minificados
RUN npm run build

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Crear directorio de uploads y dar permisos
RUN mkdir -p /usr/src/app/uploads/facturas
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Exponer puerto (usar variable de entorno)
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["npm", "start"]