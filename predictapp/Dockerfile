# --- Etapa 1: construir el frontend ---
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# --- Etapa 2: backend + frontend compilado ---
FROM node:20-alpine
WORKDIR /app

# Dependencias necesarias para compilar better-sqlite3
RUN apk add --no-cache python3 make g++

COPY server/package.json ./
RUN npm install --omit=dev

COPY server/ ./
COPY --from=client-build /app/client/dist ./public

ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=/app/data/hackbet.db

EXPOSE 4000
VOLUME ["/app/data"]

CMD ["node", "index.js"]
