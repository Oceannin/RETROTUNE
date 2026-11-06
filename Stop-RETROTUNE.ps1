$pidFile = Join-Path $PSScriptRoot 'data\server.pid'
if (Test-Path -LiteralPath $pidFile) {
    $servicePid = [int](Get-Content -LiteralPath $pidFile)
    $service = Get-CimInstance Win32_Process -Filter "ProcessId = $servicePid" -ErrorAction SilentlyContinue
    $expectedScript = Join-Path $PSScriptRoot 'server.py'
    if ($service -and $service.CommandLine -and $service.CommandLine.Contains($expectedScript)) { Stop-Process -Id $servicePid }
    Remove-Item -LiteralPath $pidFile
}
