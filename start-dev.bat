@echo off
echo Starting PulseDesk development environment...

set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.4\bin
set MYSQL_DATA=C:\mysql-data

echo Starting MySQL...
start /B "" "%MYSQL_BIN%\mysqld.exe" --datadir="%MYSQL_DATA%" --port=3306
timeout /t 5 /nobreak > nul

echo Starting Laravel backend on http://localhost:8000 ...
start "PulseDesk Backend" cmd /k "cd /d "c:\hckn day\forge2-yuvrajsingh\backend" && php artisan serve --host=127.0.0.1 --port=8000"

echo Starting React frontend on http://localhost:5173 ...
start "PulseDesk Frontend" cmd /k "cd /d "c:\hckn day\forge2-yuvrajsingh\frontend" && npm run dev"

echo.
echo PulseDesk is starting up!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   Login:    admin@acmedemo.com / password
echo.
pause
