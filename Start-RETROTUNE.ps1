param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$pythonPath = Join-Path $projectRoot '.venv\Scripts\pythonw.exe'
if (-not (Test-Path -LiteralPath $pythonPath) -or -not (Test-Path -LiteralPath (Join-Path $projectRoot 'dist\index.html'))) {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show('Run Setup RETROTUNE.cmd first.','RETROTUNE') | Out-Null
    exit 1
}
$isReady = $false
try { $response = Invoke-RestMethod 'http://127.0.0.1:47832/api/state' -TimeoutSec 2; $isReady = $null -ne $response.settings } catch {}
if (-not $isReady) {
    $logDirectory = Join-Path $projectRoot 'data'
    New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
    $process = Start-Process -FilePath $pythonPath -ArgumentList ('"' + (Join-Path $projectRoot 'server.py') + '"') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardError (Join-Path $logDirectory 'server-error.log') -RedirectStandardOutput (Join-Path $logDirectory 'server.log') -PassThru
    $process.Id | Set-Content -LiteralPath (Join-Path $logDirectory 'server.pid')
    for ($attempt=0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 200
        try { $response = Invoke-RestMethod 'http://127.0.0.1:47832/api/state' -TimeoutSec 1; if ($response.settings) { $isReady = $true; break } } catch {}
    }
}
if ($isReady -and -not $NoBrowser) { Start-Process 'http://127.0.0.1:47832' }
if (-not $isReady) { Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Cannot start local service. See data/server-error.log.','RETROTUNE') | Out-Null; exit 1 }
