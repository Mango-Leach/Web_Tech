# VoltCalc Development Server Runner
# This script manages Maven installation and launches the Jetty server automatically.

$ErrorActionPreference = "Stop"

# Define Paths
$MavenVersion = "3.9.6"
$BuildToolsDir = "$PSScriptRoot\build-tools"
$MavenDir = "$BuildToolsDir\maven"
$MavenZip = "$BuildToolsDir\maven.zip"
$MavenUrl = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"

# 1. Verify Java Installation
try {
    $javaPath = Get-Command java -ErrorAction SilentlyContinue
    if ($null -eq $javaPath) {
        # Check standard installation path or Env variables
        if (Test-Path "$Env:ProgramFiles\Microsoft\JDK-21*") {
            $jdkDir = Get-ChildItem "$Env:ProgramFiles\Microsoft\JDK-21*" | Select-Object -First 1
            $Env:PATH += ";$($jdkDir.FullName)\bin"
            Write-Host "Found Microsoft JDK 21 at $($jdkDir.FullName). Added to temporary path." -ForegroundColor Yellow
        } else {
            Write-Host "Warning: 'java' executable not found in path." -ForegroundColor Yellow
            Write-Host "If you just ran the OpenJDK winget installer, please accept the Windows UAC elevation prompt if visible," -ForegroundColor White
            Write-Host "or restart your terminal/IDE to refresh system environment variables." -ForegroundColor White
            Write-Host "Checking path in a moment..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
            # Retry detection
            if (Test-Path "$Env:ProgramFiles\Microsoft\JDK-21*") {
                $jdkDir = Get-ChildItem "$Env:ProgramFiles\Microsoft\JDK-21*" | Select-Object -First 1
                $Env:PATH += ";$($jdkDir.FullName)\bin"
            } else {
                throw "Java Development Kit (JDK) is required to run this application. Please ensure it is installed and added to PATH."
            }
        }
    }
} catch {
    Write-Host "Error checking Java: $_" -ForegroundColor Red
    Write-Host "Please install Java JDK 21 manually, configure JAVA_HOME, and retry." -ForegroundColor Yellow
    Exit 1
}

# Print Java Version
$oldEAP = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$javaVersion = java -version 2>&1 | Out-String
$ErrorActionPreference = $oldEAP
Write-Host "Detected Java Environment:" -ForegroundColor Green
Write-Host $javaVersion -ForegroundColor Gray

# 2. Download and extract Maven if not already cached
if (-not (Test-Path "$BuildToolsDir")) {
    New-Item -ItemType Directory -Path "$BuildToolsDir" | Out-Null
}

$mvnCmd = "$MavenDir\apache-maven-$MavenVersion\bin\mvn.cmd"

if (-not (Test-Path $mvnCmd)) {
    Write-Host "Apache Maven not found locally. Preparing downloading package..." -ForegroundColor Cyan
    Write-Host "Downloading Maven from: $MavenUrl" -ForegroundColor Gray
    
    # Download zip using WebClient for progress details
    try {
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($MavenUrl, $MavenZip)
    } catch {
        Write-Host "Standard download failed. Retrying with Invoke-WebRequest..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $MavenUrl -OutFile $MavenZip
    }

    Write-Host "Extracting Maven binaries..." -ForegroundColor Cyan
    Expand-Archive -Path $MavenZip -DestinationPath $MavenDir
    
    # Cleanup Zip
    Remove-Item -Path $MavenZip -Force
    Write-Host "Maven installed successfully under build-tools." -ForegroundColor Green
} else {
    Write-Host "Cached Apache Maven found in build-tools." -ForegroundColor Green
}

# 3. Launch Jetty Server
Write-Host "`n--------------------------------------------------" -ForegroundColor Cyan
Write-Host "Launching VoltCalc Server via Jetty Plugin..." -ForegroundColor Green
Write-Host "Application will be hosted at: http://localhost:8080" -ForegroundColor Green
Write-Host "Press Ctrl+C inside the terminal to stop the server." -ForegroundColor Yellow
Write-Host "--------------------------------------------------`n" -ForegroundColor Cyan

# Run Jetty
& $mvnCmd jetty:run
