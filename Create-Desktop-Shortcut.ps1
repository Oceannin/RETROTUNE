$ErrorActionPreference = 'Stop'
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath 'RETROTUNE.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
if ((Test-Path -LiteralPath $shortcutPath) -and $shortcut.TargetPath -and -not $shortcut.Arguments.Contains($PSScriptRoot)) {
    throw 'A different RETROTUNE shortcut already exists on the desktop.'
}
$shortcut.TargetPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $PSScriptRoot 'Start-RETROTUNE.ps1') + '"'
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.IconLocation = (Join-Path $PSScriptRoot 'public\assets\retrotune.ico') + ',0'
$shortcut.Description = 'RETROTUNE - music widget for OBS. Start the local service and editor.'
$shortcut.WindowStyle = 7
$shortcut.Save()
Write-Output $shortcutPath
