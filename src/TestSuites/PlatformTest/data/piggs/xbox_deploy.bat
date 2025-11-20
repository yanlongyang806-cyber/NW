
"%XEDK%\bin\win32\xbmkdir" DEVKIT:\PlatformTest\data 2>nul
"%XEDK%\bin\win32\xbmkdir" DEVKIT:\PlatformTest\data\testDir 2>nul
"%XEDK%\bin\win32\xbmkdir" DEVKIT:\PlatformTest\data\piggs 2>nul
"%XEDK%\bin\win32\xbcp" /Y data\testDir\TestFile.txt DEVKIT:\PlatformTest\data\testDir
"%XEDK%\bin\win32\xbcp" /Y data\piggs\devdata.hogg DEVKIT:\PlatformTest\data\piggs
"%XEDK%\bin\win32\xbcp" /Y data\piggs\xbox_gamedatadir.txt DEVKIT:\PlatformTest\gamedatadir.txt
