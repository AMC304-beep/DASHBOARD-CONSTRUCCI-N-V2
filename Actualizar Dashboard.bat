@echo off
title IBM Dashboard — Actualizar y Sincronizar
color 0A
echo.
echo  ========================================
echo   IBM Construction Dashboard 2026
echo   Actualizando archivos desde GitHub...
echo  ========================================
echo.

:: 1. Subir cambios a GitHub
cd /d "C:\Users\AngelaCartagena\Box\Analisis Variacion Cartera"
echo  [1/3] Subiendo cambios a GitHub...
git add dashboard_ausencias.html index_v2.html dashboard_actualizaciones.html index.html
git commit -m "update: sincronizacion automatica %date% %time%"
git push origin main
if %errorlevel% neq 0 (
    echo  AVISO: No habia cambios nuevos o error en git push.
)
echo.

:: 2. Descargar archivos actualizados al Escritorio
echo  [2/3] Descargando archivos actualizados al servidor local...
set BASE=https://raw.githubusercontent.com/AMC304-beep/DASHBOARD-CONSTRUCCI-N-V2/main
set DEST=C:\Users\AngelaCartagena\Desktop\ibm-backend

powershell -Command "Invoke-WebRequest '%BASE%/index_v2.html' -OutFile '%DEST%\index_v2.html'"
powershell -Command "Invoke-WebRequest '%BASE%/index.html' -OutFile '%DEST%\index.html'"
powershell -Command "Invoke-WebRequest '%BASE%/dashboard_ausencias.html' -OutFile '%DEST%\dashboard_ausencias.html'"
powershell -Command "Invoke-WebRequest '%BASE%/dashboard_actualizaciones.html' -OutFile '%DEST%\dashboard_actualizaciones.html'"
echo  Archivos descargados correctamente.
echo.

:: 3. Reiniciar el servidor si esta corriendo
echo  [3/3] Reiniciando servidor...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 >nul
start "" /B cmd /c "cd /d C:\Users\AngelaCartagena\Desktop\ibm-backend && node server.js"
timeout /t 2 >nul

:: 4. Abrir el dashboard en el navegador
echo  ========================================
echo   Dashboard actualizado y listo!
echo   Abriendo navegador...
echo  ========================================
echo.
start "" "http://127.0.0.1:3000/index_v2.html"

echo  NO cierres esta ventana.
echo  El servidor corre en segundo plano.
echo  Para detenerlo: taskkill /F /IM node.exe
echo.
pause
