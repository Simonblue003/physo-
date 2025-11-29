# fix-corrupt-pngs.ps1
# Scans recursively for .png files, backs up any that fail to load (or are zero bytes),
# and replaces them with a 1x1 transparent PNG placeholder so builds can continue.
# Run from project root:
#   pwsh .\fix-corrupt-pngs.ps1

$RootPath = (Get-Location).Path
$IncludePatterns = @("*.png")
$BackupRoot = Join-Path $RootPath ("corrupt_pngs_backup_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
$LogFile = Join-Path $RootPath "corrupt-pngs.txt"
$ScanPaths = @($RootPath)

if (-not (Test-Path $BackupRoot)) { New-Item -Path $BackupRoot -ItemType Directory | Out-Null }
if (Test-Path $LogFile) { Remove-Item $LogFile -Force }

try {
    Add-Type -AssemblyName System.Drawing -ErrorAction Stop
} catch {
    Write-Warning "Could not load System.Drawing via Add-Type. The script may still work on Windows PowerShell but could fail on PowerShell Core."
}

function New-PlaceholderPng {
    param($Path)
    try {
        $bmp = New-Object System.Drawing.Bitmap 1,1
        $bmp.SetPixel(0,0,[System.Drawing.Color]::FromArgb(0,0,0,0))
        $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        return $true
    } catch {
        Write-Warning "Failed to create placeholder PNG at $Path : $_"
        return $false
    }
}

Write-Host "Scanning for PNG files under: $RootPath ..."
$corruptCount = 0

foreach ($scanBase in $ScanPaths) {
    foreach ($pattern in $IncludePatterns) {
        $files = Get-ChildItem -Path $scanBase -Recurse -Filter $pattern -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $full = $file.FullName

            if ($file.Length -eq 0) {
                $corruptCount++
                $rel = $full.Substring($RootPath.Length).TrimStart('\','/')
                $backupDir = Join-Path $BackupRoot (Split-Path $rel -Parent)
                if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
                $backupPath = Join-Path $backupDir (Split-Path $rel -Leaf + ".zero")
                Move-Item -Path $full -Destination $backupPath -Force
                "ZERO-BYTES`t$full" | Out-File -FilePath $LogFile -Append -Encoding utf8
                Write-Host "[ZERO] $full -> backup at $backupPath"
                New-PlaceholderPng $full | Out-Null
                continue
            }

            $isBad = $false
            try {
                $img = [System.Drawing.Image]::FromFile($full)
                if ($img -ne $null) { $img.Dispose() }
            } catch {
                $isBad = $true
            }

            if ($isBad) {
                $corruptCount++
                $rel = $full.Substring($RootPath.Length).TrimStart('\','/')
                $backupPathDir = Join-Path $BackupRoot (Split-Path $rel -Parent)
                if (-not (Test-Path $backupPathDir)) { New-Item -ItemType Directory -Path $backupPathDir -Force | Out-Null }
                $backupPath = Join-Path $backupPathDir (Split-Path $rel -Leaf)
                try {
                    Move-Item -Path $full -Destination $backupPath -Force
                    "CORRUPT`t$full`t-> backed up to $backupPath" | Out-File -FilePath $LogFile -Append -Encoding utf8
                    Write-Host "[CORRUPT] $full -> backed up to $backupPath"
                } catch {
                    "ERROR_MOVE`t$full`t$_" | Out-File -FilePath $LogFile -Append -Encoding utf8
                    Write-Warning "Failed to move $full to backup: $_"
                    continue
                }

                if (New-PlaceholderPng $full) {
                    "REPLACED_WITH_PLACEHOLDER`t$full" | Out-File -FilePath $LogFile -Append -Encoding utf8
                    Write-Host "Replaced with placeholder: $full"
                } else {
                    "FAILED_REPLACE`t$full" | Out-File -FilePath $LogFile -Append -Encoding utf8
                    Write-Warning "Failed to create placeholder for $full"
                }
            }
        }
    }
}

Write-Host "Scan complete. Corrupt/invalid PNGs found: $corruptCount"
Write-Host "Backup folder: $BackupRoot"
Write-Host "Log file: $LogFile"
