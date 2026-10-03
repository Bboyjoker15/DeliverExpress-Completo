<#
.SYNOPSIS
    Levanta el backend y el frontend de DeliverExpress, cada uno en su propia
    ventana, con un solo comando.

.DESCRIPCION
    - PostgreSQL corre como servicio de Windows (postgresql-x64-16): este
      script solo avisa si no esta activo, no lo arranca (requeriria admin).
    - Backend: venv\Scripts\python.exe -m uvicorn app.main:app --reload
    - Frontend: npm run dev
    Cada uno abre en su propia ventana de PowerShell para que puedas ver sus
    logs y pararlo con Ctrl+C de forma independiente, igual que si lo
    hubieras corrido a mano.

.USO
    Desde la raiz del repo (DeliverExpress-Completo):
        .\start-dev.ps1
#>

$raiz = $PSScriptRoot
$backend = Join-Path $raiz "backend"
$frontend = Join-Path $raiz "frontend"

# --- Chequeos rapidos antes de abrir nada ---
$pg = Get-Service -Name "postgresql-x64-16" -ErrorAction SilentlyContinue
if ($null -eq $pg) {
    Write-Warning "No se encontro el servicio 'postgresql-x64-16'. Si tu instalacion de Postgres tiene otro nombre de servicio, ignora este aviso."
} elseif ($pg.Status -ne "Running") {
    Write-Warning "PostgreSQL no esta corriendo (servicio '$($pg.Name)' = $($pg.Status)). Iniciando..."
    Start-Service $pg.Name
}

if (-not (Test-Path (Join-Path $backend "venv\Scripts\python.exe"))) {
    Write-Error "No existe backend\venv. Crea el entorno primero: cd backend; python -m venv venv; .\venv\Scripts\python.exe -m pip install -r requirements.txt"
    exit 1
}
if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Error "No existe frontend\node_modules. Instala dependencias primero: cd frontend; npm install"
    exit 1
}
if (-not (Test-Path (Join-Path $backend ".env"))) {
    Write-Error "Falta backend\.env. Copia backend\.env.ejemplo a backend\.env y completa las credenciales."
    exit 1
}

# --- Backend ---
Write-Host "Abriendo backend (uvicorn --reload) en una ventana nueva..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backend'; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload"
)

# Pequeña espera para que el backend tenga tiempo de levantar antes que el
# frontend empiece a pegarle (no es obligatorio, pero evita el primer error
# de 'conexion rechazada' en los primeros requests del navegador).
Start-Sleep -Seconds 2

# --- Frontend ---
Write-Host "Abriendo frontend (npm run dev) en una ventana nueva..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontend'; npm run dev"
)

Write-Host ""
Write-Host "Listo. Backend -> http://localhost:8000  |  Frontend -> http://localhost:5173" -ForegroundColor Green
Write-Host "Cierra cada ventana (o Ctrl+C dentro de ella) para apagar esa parte." -ForegroundColor DarkGray
