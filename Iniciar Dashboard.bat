@echo off
title IBM Construction Dashboard 2026
color 0A
echo.
echo  ========================================
echo   IBM Construction Dashboard 2026
echo   Iniciando servidor backend...
echo  ========================================
echo.

set BACKEND=C:\Users\AngelaCartagena\Desktop\ibm-backend
set BOX=C:\Users\AngelaCartagena\Box\Analisis Variacion Cartera

:: Verificar que Node.js existe
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: Node.js no esta instalado.
    echo  Descarga Node.js desde: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Verificar que la carpeta ibm-backend existe
if not exist "%BACKEND%" (
    color 0C
    echo  ERROR: No se encuentra la carpeta del servidor.
    echo  Ejecuta primero: Actualizar Dashboard.bat
    echo.
    pause
    exit /b 1
)

:: Verificar que .env existe
if not exist "%BACKEND%\.env" (
    color 0C
    echo  ERROR: Falta el archivo .env con el token de Monday.
    echo  Ruta esperada: %BACKEND%\.env
    echo.
    pause
    exit /b 1
)

:: Verificar que node_modules existe
if not exist "%BACKEND%\node_modules" (
    echo  Instalando dependencias por primera vez...
    cd /d "%BACKEND%"
    npm install
    echo.
)

:: Detener cualquier servidor previo
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 >nul

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
cd /d "%BACKEND%"
node server.js

:: Si el servidor se detiene
echo.
echo  El servidor se ha detenido.
pause
