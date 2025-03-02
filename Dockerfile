# Usa una imagen base de Linux con Node.js y Wine
FROM node:20-slim

# Instala Wine y herramientas de compilación
RUN apt-get update && \
    apt-get install -y \
    wine \
    xvfb \
    g++ \
    make \
    python3 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Configura Wine (para compilar .exe)
ENV WINEDEBUG=-all
ENV WINEPREFIX=/wine
RUN winecfg && wine wineboot --init

# Directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto
COPY package.json package-lock.json ./
RUN npm ci

# Copia el código fuente
COPY . .

# Empaqueta para Windows
RUN npm run build

# Carpeta de salida
VOLUME /app/dist