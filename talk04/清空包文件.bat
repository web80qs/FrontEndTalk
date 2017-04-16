@echo off
:del_ask
set /p dm=Are you sure you want to delete the file[y,n]:
if "%dm%"=="y" goto del_confirm
if "%dm%"=="n" goto del_cancel
:del_confirm
pause
del /f /q /s node_modules\*.*
rd /s /q node_modules\
goto end
:del_cancel
pause
goto end