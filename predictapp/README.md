# HackBet — apuestas de puntos del bootcamp (sin dinero real)

Clon estilo Polymarket, pero para jugar entre colegas del bootcamp con puntos de mentira. Cualquiera crea mercados binarios (Sí/No) sobre quién aprueba el examen, quién llega tarde o cualquier chorrada que se os ocurra, la peña apuesta puntos, comenta, y un admin ("root") resuelve el resultado final.

## Cómo levantarlo

```bash
docker compose up --build
```

Abre **http://localhost:4000**

Se crea automáticamente un usuario admin usando las credenciales que definas en `ADMIN_USERNAME` / `ADMIN_PASSWORD` en `docker-compose.yml` (si no las tocas, por defecto son `admin` / `admin123`).

(Cambia también `JWT_SECRET` antes de desplegar en serio, aunque "en serio" aquí sea un poco relativo.)

Los datos se guardan en un volumen Docker (`hackbet_data`) usando SQLite, así que persisten entre reinicios del contenedor.

## Funcionalidades

- **Cuentas de usuario**: registro/login con JWT. Cada cuenta nueva empieza con 1.000 puntos ficticios.
- **Apuestas binarias**: cualquier usuario logueado puede lanzar una apuesta con pregunta, descripción, categoría y fecha de resolución.
- **Apostar**: los usuarios reparten puntos entre "Sí" y "No" en cualquier apuesta abierta (sistema de bote compartido / pari-mutuel: el bote perdedor se reparte proporcionalmente entre los ganadores).
- **Comentarios**: cada apuesta tiene su propio hilo para el cotilleo.
- **Cancelación de apuestas tardías**: cualquier apuesta hecha durante el último minuto antes de que un admin resuelva la apuesta se cancela automáticamente y se devuelven los puntos.
- **Resolución por admins**: solo los usuarios admin pueden marcar una apuesta como resuelta (Sí/No) desde la consola `/admin`, lo que reparte los puntos automáticamente.
- **Estética hacker-bootcamp**: tema oscuro tipo terminal, ventana de consola en la portada, cursor parpadeante, tipografías Space Grotesk / Inter / JetBrains Mono.

## Estructura

```
server/   → API Express + SQLite (better-sqlite3), autenticación JWT
client/   → Frontend React + Vite + Tailwind
Dockerfile          → build multi-etapa: compila el frontend y lo sirve desde el backend
docker-compose.yml  → un único servicio expuesto en el puerto 4000
```

## Desarrollo local sin Docker (opcional)

```bash
cd server && npm install && npm run start   # puerto 4000
cd client && npm install && npm run dev     # puerto 5173, con proxy a /api
```
