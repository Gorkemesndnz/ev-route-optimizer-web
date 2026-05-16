$ErrorActionPreference = "Stop"

$fastApiHealth = "http://localhost:8000/health"
$dotnetHealth = "http://localhost:5146/health"

function Test-HealthEndpoint {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Name,
    [Parameter(Mandatory = $true)]
    [string] $Url
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 300) {
      throw "$Name health check returned HTTP $($response.StatusCode)"
    }
    Write-Host "OK: $Name health check passed ($Url)"
  }
  catch {
    Write-Error "$Name is not reachable at $Url. Start it before running the route smoke test. $($_.Exception.Message)"
  }
}

Push-Location $PSScriptRoot\..
try {
  Test-HealthEndpoint -Name "FastAPI" -Url $fastApiHealth
  Test-HealthEndpoint -Name ".NET API" -Url $dotnetHealth

  $env:RUN_ROUTE_SMOKE = "1"
  $env:VITE_API_URL = "http://localhost:5146"

  npm.cmd test -- src/e2e/route-smoke.e2e.tsx
}
finally {
  Remove-Item Env:\RUN_ROUTE_SMOKE -ErrorAction SilentlyContinue
  Remove-Item Env:\VITE_API_URL -ErrorAction SilentlyContinue
  Pop-Location
}
