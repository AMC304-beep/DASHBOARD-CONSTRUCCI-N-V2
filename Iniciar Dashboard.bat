@echo off
title IBM Construction Dashboard 2026
color 0A
echo.
echo  ========================================
echo   IBM Construction Dashboard 2026
echo   Iniciando servidor backend...
echo  ========================================
echo.

cd /d "%~dp0backend"

:: Verificar que Node.js existe
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: Node.js no esta instalado.
    echo  Descarga Node.js 20 LTS desde: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Verificar que .env existe
if not exist ".env" (
    color 0C
    echo  ERROR: Falta el archivo .env con el token de Monday.
    echo  Crea el archivo backend\.env con:
    echo  MONDAY_API_TOKEN=tu_token_aqui
    echo.
    pause
    exit /b 1
)

:: Verificar que node_modules existe
if not exist "node_modules" (
    echo  Instalando dependencias por primera vez...
    echo  (esto toma ~1 minuto, solo ocurre una vez)
    echo.
    npm install
    echo.
)

echo  Servidor iniciado correctamente.
echo  ========================================
echo   Abre tu navegador en:
echo   http://127.0.0.1:3000
echo  ========================================
echo.
echo  NO cierres esta ventana mientras usas el dashboard.
echo  Para detener el servidor presiona Ctrl+C
echo.

:: Abrir el navegador automaticamente
start "" "http://127.0.0.1:3000/index_v2.html"

:: Iniciar el servidor
node server.js

:: Si el servidor se detiene
echo.
echo  El servidor se ha detenido.
pause
