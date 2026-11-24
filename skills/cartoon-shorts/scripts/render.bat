@echo off
rem Double-click render menu for the cartoon shorts (runs everything on this PC).
rem   1 = gates only (no pixels, seconds)   2 = preview 540x960 + review sheets   3 = final 2K (gates, archive _vN, QA)
chcp 65001 >nul
cd /d "%~dp0"
set "SKILL=%USERPROFILE%\.claude\skills\cartoon-shorts\scripts"
set "PY=%~dp0.venv\Scripts\python.exe"
set "REMOTION_TMP=%~dp0.remotion-tmp"

rem optional arguments: render.bat <name> <CompId> <1|2|3>  (no questions)
set "NAME=%~1" & set "COMP=%~2" & set "MODE=%~3"
if not "%MODE%"=="" goto run
echo Videolar:
for /d %%D in (src\shorts\*) do if exist "%%D\spec.ts" if /i not "%%~nxD"=="engine" echo    %%~nxD
echo.
set /p NAME=Video adi (klasor):
set /p COMP=Composition id (Root.tsx, or. MichelinShort):
echo.
echo  1) Kontrol (kapilar + kamera olcumu, saniyeler)
echo  2) Onizleme 540x960 + tum video inceleme sayfalari
echo  3) Final 2K (1440x2560) + QA
set /p MODE=Secim [1-3]:
:run

set "SPEC=src\shorts\%NAME%\spec.ts"
set "MIX=shorts\%NAME%\audio\mix.wav"
if not exist "out\%NAME%" mkdir "out\%NAME%"

if "%MODE%"=="1" "%PY%" "%SKILL%\render.py" check "%SPEC%"
if "%MODE%"=="2" "%PY%" "%SKILL%\render.py" preview %COMP% "%MIX%" "out\%NAME%\preview.mp4" --spec "%SPEC%"
if "%MODE%"=="3" "%PY%" "%SKILL%\render.py" final %COMP% "%MIX%" "out\%NAME%\final.mp4" --spec "%SPEC%" --qa
echo.
if "%MODE%"=="2" start "" "out\%NAME%\preview.mp4"
if "%MODE%"=="3" if exist "out\%NAME%\final.mp4" start "" "out\%NAME%\final.mp4"
if "%~3"=="" pause
