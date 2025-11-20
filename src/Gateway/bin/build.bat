@echo off
:::
::: Builds everything.
:::
::: Use /clean to delete the tmp and deploy directories before starting
::: Use /watch to start up a continuous builder.
:::
:::
setlocal

set once=-once
set note=Done.

:is_watch
if "%1"=="watch" goto watch
if "%1"=="/watch" goto watch
if "%2"=="watch" goto watch
if "%2"=="/watch" goto watch
goto is_clean

:watch
taskkill /fi "windowtitle eq Smelting!" > nul
sleep 1
set once=
set starter=start "Smelting!" /min
set note=Smelter started.
goto is_clean

:is_clean
if "%1"=="clean" goto clean
if "%1"=="/clean" goto clean
if "%2"=="clean" goto clean
if "%2"=="/clean" goto clean
goto build

:clean
if exist %~dp0..\build\tmp rmdir /s /q %~dp0..\build\tmp
if exist %~dp0..\build\deploy rmdir /s /q %~dp0..\build\deploy
goto :next_param


:next_param
goto build


:build
%starter% %~dp0node  %~dp0..\smelter\smelter -f %~dp0..\build\makefile.smelt %once%
echo %note%

:end
endlocal
exit /b %errorlevel%
