# DeliverExpress

Sistema de gestión de delivery (proyecto grupal, materia Bases de Datos). Conecta restaurantes, repartidores, clientes y coordinadores con una arquitectura de tres capas: base de datos PostgreSQL + backend (API) + frontend (web). Ver `docs/` para la documentación completa del proyecto (requerimientos, reglas de negocio, contrato de la base de datos, contrato del backend y del frontend).

Este repositorio junta en un solo lugar los tres módulos, que también se desarrollan y versionan por separado en:

- Base de datos: https://github.com/Bboyjoker15/DeliverExpress-Database
- Backend: https://github.com/emilidarrj/DeliverExpress-backend
- Frontend: https://github.com/emilidarrj/DeliverExpress-frontend

## Arquitectura

```
Frontend (SvelteKit)  <-- HTTP/WebSocket -->  Backend (FastAPI)  <-- SQL -->  PostgreSQL 16
```

Tres procesos separados que corren a la vez en la misma máquina. No es "un solo programa": es el diseño estándar de tres capas que pide la materia (igual que funciona Gmail, el home banking, etc.: base de datos + API + app web).

## Estructura

```
DeliverExpress-Completo/
  database/   -- esquema, funciones, triggers, vistas, datos de prueba (PostgreSQL)
  backend/    -- API FastAPI que usa la base de datos
  frontend/   -- aplicación web SvelteKit que consume la API
  docs/       -- documentación del proyecto y los tres contratos (roadmaps)
```

Cada carpeta tiene su propio README con instrucciones detalladas.

## Arranque rápido (Windows, un solo comando)

Con la base de datos ya cargada y `backend/.env` + `frontend/.env` ya configurados (ver abajo la primera vez):

```powershell
.\start-dev.ps1
```

Abre backend y frontend cada uno en su propia ventana de PowerShell. Si PowerShell bloquea el script por política de
ejecución, corre `powershell -ExecutionPolicy Bypass -File .\start-dev.ps1` en su lugar.

## Cómo levantar todo a mano (3 terminales)

### 1. Base de datos

```bash
createdb -U postgres deliverexpress
cd database
psql -U postgres -d deliverexpress -f ejecutar_todo.sql
```

Ver `database/README.md` para detalles (roles, usuarios de prueba, respaldo).

### 2. Backend

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .env.ejemplo .env
# completar DATABASE_URL / LISTEN_URL con la clave real del rol de_app
uvicorn app.main:app --reload
```

Queda en `http://localhost:8000` (`/docs` para la documentación interactiva).

### 3. Frontend

```bash
cd frontend
npm install
cp .env.ejemplo .env
npm run dev
```

Queda en `http://localhost:5173`. Entra con cualquier usuario de prueba, por ejemplo `cliente01@demo.com` / `demo1234` (ver la lista completa en `database/README.md`).

## Estado de la integración

- **Base de datos**: completa, probada de punta a punta contra PostgreSQL 16 real.
- **Backend**: completo (todos los endpoints, WebSocket, tarea de expiración de ofertas, simulador de repartidores), verificado contra el contrato de la base de datos.
- **Frontend**: todas las pantallas de los 5 actores están construidas y conectadas a la API real (sin datos mock).

El pago en el checkout es **simulado**: solo se valida y se guardan los últimos 4 dígitos de la tarjeta (`CHECK (ultimos4 ~ '^[0-9]{4}$')` en la base de datos). No hay integración con ninguna pasarela de pago real.

## Documentación

- `docs/DeliverExpress — Documentación del Proyecto.pdf` — documento completo del proyecto.
- `docs/roadmap_bd.txt` — contrato de la base de datos (tablas, funciones, triggers, códigos de error).
- `docs/roadmap_backend.txt` — contrato del backend (endpoints, formato de errores, tiempo real).
- `docs/roadmap_frontend.txt` — plan de pantallas del frontend.
