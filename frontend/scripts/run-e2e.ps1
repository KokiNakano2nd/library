$ErrorActionPreference = "Stop"

function Test-HttpOk {
    param(
        [string]$Url
    )

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    }
    catch {
        return $false
    }
}

function Wait-HttpOk {
    param(
        [string]$Url,
        [int]$TimeoutSeconds
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $deadline) {
        if (Test-HttpOk -Url $Url) {
            return
        }

        Start-Sleep -Milliseconds 500
    }

    throw "Server did not become ready: $Url"
}

$frontendDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $frontendDir "..")
$backendDir = Join-Path $repoRoot "backend"

$backendProcess = $null
$frontendProcess = $null
$startedBackend = $false
$startedFrontend = $false

try {
    if (-not (Test-HttpOk -Url "http://127.0.0.1:8000/health")) {
        $backendProcess = Start-Process `
            -FilePath ".\.venv\Scripts\python.exe" `
            -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000" `
            -WorkingDirectory $backendDir `
            -WindowStyle Hidden `
            -PassThru
        $startedBackend = $true
    }

    if (-not (Test-HttpOk -Url "http://127.0.0.1:3011/books")) {
        $frontendProcess = Start-Process `
            -FilePath "npm.cmd" `
            -ArgumentList "run", "start", "--", "--hostname", "127.0.0.1", "--port", "3011" `
            -WorkingDirectory $frontendDir `
            -WindowStyle Hidden `
            -PassThru
        $startedFrontend = $true
    }

    Wait-HttpOk -Url "http://127.0.0.1:8000/health" -TimeoutSeconds 30
    Wait-HttpOk -Url "http://127.0.0.1:3011/books" -TimeoutSeconds 60

    Push-Location $frontendDir
    try {
        & npx playwright test
        exit $LASTEXITCODE
    }
    finally {
        Pop-Location
    }
}
finally {
    if ($startedFrontend -and $frontendProcess -ne $null) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }

    if ($startedBackend -and $backendProcess -ne $null) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
