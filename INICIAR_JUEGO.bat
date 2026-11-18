@echo off
title El viaje del hincha del Carrarese
cd /d "%~dp0"

echo =========================================================
echo    EL VIAJE DEL HINCHA DEL CARRARESE - JUEGO WEB 2D
echo =========================================================
echo Iniciando servidor local para asegurar la maxima compatibilidad de audio y assets...

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Servidor Python detectado. Abriendo http://localhost:8000 ...
    start http://localhost:8000/
    python -m http.server 8000
) else (
    echo Abriendo juego directamente en el navegador...
    start index.html
)

pause
