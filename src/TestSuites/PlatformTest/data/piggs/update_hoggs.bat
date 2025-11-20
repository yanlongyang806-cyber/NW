@echo off
@REM Go to drive/folder this .bat file is in
%~d0
cd %~dp0
cd ..

for %%a in (..\..\..\..) do set ROOT=%%~fa
REM %ROOT% is C:\

SET PIG_PATH=pig
if EXIST %ROOT%\Cryptic\tools\bin\pig.exe SET PIG_PATH=%ROOT%\Cryptic\tools\bin\pig

@REM Update!
for %%a in (piggs/*data.txt) do (
	echo %%~na.hogg:
	%PIG_PATH% uuyvf piggs/%%~na.hogg -Tpiggs/%%~na.txt --respectMirror ../.patch/MirrorFilespec.txt
	if ERRORLEVEL 1 goto fail
	if not exist piggs\%%~na.hogg goto fail
)

goto end

:fail
echo FAILED!
@REM Can't be a exit /b 1, since that does *not* set the error code returned to our C program
exit 1

:end
