@echo off
rem Запуск сервера ЗЕРНО. Если бинарника нет — собираем.
cd /d "%~dp0"
if not exist "zig-out\bin\zerno.exe" (
  echo Сборка zerno.exe...
  zig build || (echo Не удалось собрать. Нужен Zig 0.16 в PATH. & pause & exit /b 1)
)
start "" http://127.0.0.1:8787/
zig-out\bin\zerno.exe %*
pause
