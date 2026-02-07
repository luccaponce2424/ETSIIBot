# Usar imagen oficial de Node.js 20 slim
FROM node:20-slim

# Combinar RUN commands para reducir capas y usar caché eficientemente
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-sandbox \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar solo package*.json primero (mejor caché)
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --production && npm cache clean --force

# Copiar el resto del código
COPY . .

# Configurar usuario no-root por seguridad
RUN useradd -m -u 1001 botuser && chown -R botuser:botuser /app
USER botuser

# Configurar variables de entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD ps aux | grep "npm start" || exit 1

# Comando para ejecutar el bot
CMD ["npm", "start"]
