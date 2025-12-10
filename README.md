# RMP Actividades (Proyecto Integrado)

## Descripcion del proyecto
Aplicacion full-stack para gestionar actividades de ocio. Incluye registro y login con JWT, roles de usuario ofertante/consumidor, creacion y gestion de actividades, inscripciones y validaciones. Backend en Node.js + Express + PostgreSQL y frontend en React (Vite) con Tailwind y Axios.

## Requisitos
- Node.js 18+ y npm.
- PostgreSQL 16+ (o Docker + Docker Compose para levantar la base de datos incluida en `docker-compose.yml`).
- Variables de entorno configuradas (`Backend/.env`).
- Opcional: `docker compose` para crear la base de datos localmente.

## Como instalar
1) Clona el repositorio y situate en la raiz.
2) Backend:
   - Copia el ejemplo: `cd Backend && cp .env.example .env` (o crea el archivo siguiendo el ejemplo).
   - Instala dependencias: `npm install`.
3) Frontend:
   - `cd frontend && npm install`.
   - Con `VITE_API_URL=http://localhost:3000` (ajusta si el backend usa otro host/puerto).

## Como ejecutar
- Base de datos con Docker (opcional): desde la raiz `docker compose up -d db` (usa el servicio postgres definido en `docker-compose.yml`).
- Base de datos manual: asegurate de tener un PostgreSQL corriendo con las credenciales de tu `.env`.
- Backend: `cd Backend && npm run dev` (respeta `PORT` en `.env`, por defecto 3000).
- Frontend: `cd frontend && npm run dev` y abre el puerto que muestre Vite (por defecto 5173). Asegurate de que `VITE_API_URL` apunte al backend.

## Creditos
- Autor: proyecto Proyecto Integrado de Raul.
- Tecnologias: React, Vite, Tailwind, Axios, Node.js, Express, PostgreSQL, JWT.
