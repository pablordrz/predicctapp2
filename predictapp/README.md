# Vaticina — mercado de predicciones con puntos ficticios

Clon estilo Polymarket para jugar con puntos ficticios (sin dinero real). Los usuarios crean mercados binarios (Sí/No), apuestan puntos entre ellos, comentan, y un administrador resuelve el resultado final.

## Cómo levantarlo

```bash
docker compose up --build
```

Abre **http://localhost:4000**

Se crea automáticamente un usuario administrador:
- usuario: `admin`
- contraseña: `admin123`

(Puedes cambiar estas credenciales y el `JWT_SECRET` en `docker-compose.yml` antes de desplegar.)

Los datos se guardan en un volumen Docker (`vaticina_data`) usando SQLite, así que persisten entre reinicios del contenedor.

## Funcionalidades

- **Cuentas de usuario**: registro/login con JWT. Cada cuenta nueva empieza con 1.000 puntos ficticios.
- **Mercados binarios**: cualquier usuario logueado puede crear una apuesta con pregunta, descripción, categoría y fecha de resolución.
- **Apostar**: los usuarios reparten puntos entre "Sí" y "No" en cualquier mercado abierto (sistema de bote compartido / pari-mutuel: el bote perdedor se reparte proporcionalmente entre los ganadores).
- **Comentarios**: cada mercado tiene su propio hilo de comentarios.
- **Cancelación de apuestas tardías**: cualquier apuesta hecha durante el último minuto antes de que un admin resuelva el mercado se cancela automáticamente y se devuelven los puntos.
- **Resolución por administradores**: solo los usuarios admin pueden marcar un mercado como resuelto (Sí/No) desde el panel `/admin`, lo que reparte los puntos automáticamente.
- **Diseño propio**: tema oscuro tipo "trading floor", tipografías Space Grotesk / Inter / JetBrains Mono, barra de probabilidad como elemento distintivo.

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
