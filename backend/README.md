# DeliverExpress — Backend

API en FastAPI que conecta con la base de datos PostgreSQL (`../database/`). Ver `../docs/roadmap_backend.txt` para el contrato completo de endpoints, errores y tiempo real.

## Requisitos

- Python 3.11+
- La base de datos `deliverexpress` ya creada y cargada (ver `../database/README.md`)

## Instalación y arranque

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
cp .env.ejemplo .env         # completa DATABASE_URL, LISTEN_URL y JWT_SECRET
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000` (documentación interactiva en `/docs`).

## Simulador de repartidores

Script aparte que mueve a los repartidores en tiempo real (RF-20) y, opcionalmente, crea y avanza pedidos solo:

```bash
cd backend
python simulador/simulador.py --auto --pedidos 5
```
