# Doughmination Setup Script
# This script debloats Windows and activates it

# ========================================
# Licenced by ESAL-1.3
# Clove Nytrix Doughmination Twilight
# ========================================

# Check for admin privileges and elevate if necessary
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Not running as Administrator. Requesting elevation..." -ForegroundColor Yellow
    Write-Host "Please accept the UAC prompt to continue." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "NOTE: This window will wait for the elevated process to complete." -ForegroundColor Cyan
    Write-Host ""
    
    # Get the path to the current script, or create temp file if running from URL
    if ($PSCommandPath) {
        $scriptPath = $PSCommandPath
    } elseif ($MyInvocation.MyCommand.Path) {
        $scriptPath = $MyInvocation.MyCommand.Path
    } else {
        # Script is running from memory (irm | iex), so save it to a temp file
        Write-Host "Downloading script to temporary location..." -ForegroundColor Gray
        try {
            $scriptContent = Invoke-RestMethod "https://setup.doughmination.win"
            $scriptPath = Join-Path $env:TEMP "DoughminationSetup_$(Get-Date -Format 'yyyyMMddHHmmss').ps1"
            Set-Content -Path $scriptPath -Value $scriptContent -Encoding UTF8
            Write-Host "Script saved to: $scriptPath" -ForegroundColor Gray
            $cleanupTemp = $true
        } catch {
            Write-Host "ERROR: Could not download script: $_" -ForegroundColor Red
            Write-Host "Press any key to exit..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit
        }
    }
    
    try {
        # Start a new elevated PowerShell process and wait for it to complete
        $process = Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoExit -ExecutionPolicy Bypass -File `"$scriptPath`"" -PassThru
        
        if ($process) {
            $process.WaitForExit()
            Write-Host ""
            Write-Host "Elevated process completed." -ForegroundColor Green
        }
        
        # Clean up temp file if we created one
        if ($cleanupTemp -and (Test-Path $scriptPath)) {
            Start-Sleep -Seconds 2
            Remove-Item $scriptPath -Force -ErrorAction SilentlyContinue
        }
        
        Write-Host "Press any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } catch {
        Write-Host ""
        Write-Host "ERROR: Failed to start elevated process: $_" -ForegroundColor Red
        Write-Host "Press any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    
    # Exit the current non-elevated process
    exit
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Doughmination Windows Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Licenced by ESAL-1.3" -ForegroundColor Gray
Write-Host "Clove Nytrix Doughmination Twilight" -ForegroundColor Gray
Write-Host ""
Write-Host "Running with Administrator privileges" -ForegroundColor Green
Write-Host ""
Write-Host "NOTE: Press Enter to accept default [Y] options" -ForegroundColor Cyan
Write-Host ""

# Detect Windows version
$osVersion = [System.Environment]::OSVersion.Version
$isWindows11 = $osVersion.Build -ge 22000
if ($isWindows11) {
    Write-Host "Detected: Windows 11" -ForegroundColor Cyan
} else {
    Write-Host "Detected: Windows 10" -ForegroundColor Cyan
}
Write-Host ""

Start-Sleep -Seconds 3
Write-Host ""

# Helper function to get yes/no with default Y
function Get-YesNoChoice {
    param(
        [string]$Prompt,
        [string]$Default = "Y"
    )
    
    $response = Read-Host "$Prompt (Y/n)"
    if ([string]::IsNullOrWhiteSpace($response)) {
        return $Default
    }
    return $response.ToUpper()
}

# Step 1: Debloat Windows
$debloatChoice = Get-YesNoChoice -Prompt "[1/5] Do you want to debloat Windows?"
if ($debloatChoice -eq 'Y') {
    Write-Host ""
    Write-Host "Debloating Windows..." -ForegroundColor Yellow
    Write-Host "Running Raphi's Windows Debloater..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "NOTE: The debloater will open in a new window." -ForegroundColor Cyan
    Write-Host "Please complete the debloater process before continuing." -ForegroundColor Cyan
    Write-Host ""
    try {
        # Download the script
        $debloatScript = Invoke-RestMethod "https://debloat.raphi.re/"
        
        # Create a temporary file for the script
        $tempScript = [System.IO.Path]::GetTempFileName() + ".ps1"
        Set-Content -Path $tempScript -Value $debloatScript
        
        # Start the debloater in a new window and wait for it to complete
        $process = Start-Process powershell.exe -ArgumentList "-NoExit -ExecutionPolicy Bypass -File `"$tempScript`"" -PassThru -Wait
        
        # Clean up temp file
        Remove-Item $tempScript -ErrorAction SilentlyContinue
        
        Write-Host ""
        Write-Host "Debloat completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error during debloat: $_" -ForegroundColor Red
        Write-Host "Continuing to next step..." -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipping Windows debloat." -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Activate Windows
$activateChoice = Get-YesNoChoice -Prompt "[2/5] Do you want to activate Windows?"
if ($activateChoice -eq 'Y') {
    Write-Host ""
    Write-Host "Activating Windows..." -ForegroundColor Yellow
    Write-Host "Running Microsoft Activation Scripts..." -ForegroundColor Gray
    Write-Host ""
    try {
        Invoke-RestMethod https://get.activated.win | Invoke-Expression
        Write-Host ""
        Write-Host "Activation completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error during activation: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Skipping Windows activation." -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Windows Customization
$customizeChoice = Get-YesNoChoice -Prompt "[3/5] Do you want to customize Windows settings?"
if ($customizeChoice -eq 'Y') {
    Write-Host ""
    Write-Host "Customizing Windows..." -ForegroundColor Yellow
    Write-Host ""
    
    # Dark Mode / Light Mode
    $darkModeChoice = Get-YesNoChoice -Prompt "Enable Dark Mode?"
    if ($darkModeChoice -eq 'Y') {
        Write-Host "Enabling Dark Mode..." -ForegroundColor Gray
        Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 0
        Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "SystemUsesLightTheme" -Value 0
        Write-Host "Dark Mode enabled!" -ForegroundColor Green
    } else {
        Write-Host "Enabling Light Mode..." -ForegroundColor Gray
        Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 1
        Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "SystemUsesLightTheme" -Value 1
        Write-Host "Light Mode enabled!" -ForegroundColor Green
    }
    Write-Host ""
    
    # Show hidden files
    $hiddenFilesChoice = Get-YesNoChoice -Prompt "Show hidden files in Explorer?"
    if ($hiddenFilesChoice -eq 'Y') {
        Write-Host "Enabling hidden files in Explorer..." -ForegroundColor Gray
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "Hidden" -Value 1
        Write-Host "Hidden files now visible!" -ForegroundColor Green
    } else {
        Write-Host "Hidden files will remain hidden." -ForegroundColor Yellow
    }
    Write-Host ""
    
    # Show file extensions
    $fileExtChoice = Get-YesNoChoice -Prompt "Show file extensions?"
    if ($fileExtChoice -eq 'Y') {
        Write-Host "Enabling file extensions..." -ForegroundColor Gray
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "HideFileExt" -Value 0
        Write-Host "File extensions now visible!" -ForegroundColor Green
    } else {
        Write-Host "File extensions will remain hidden." -ForegroundColor Yellow
    }
    Write-Host ""
    
    # Taskbar configuration - different options for Windows 10 vs Windows 11
    if ($isWindows11) {
        # Windows 11 specific options
        Write-Host "Windows 11 Taskbar Configuration:" -ForegroundColor Cyan
        
        # Taskbar alignment
        Write-Host ""
        Write-Host "Taskbar Alignment:" -ForegroundColor Cyan
        Write-Host "1. Left aligned (Default)"
        Write-Host "2. Center aligned"
        Write-Host "3. No change"
        $taskbarAlignChoice = Read-Host "Choose taskbar alignment (1/2/3)"
        
        if ([string]::IsNullOrWhiteSpace($taskbarAlignChoice)) {
            $taskbarAlignChoice = "1"
        }
        
        switch ($taskbarAlignChoice) {
            '1' {
                Write-Host "Setting taskbar to left aligned..." -ForegroundColor Gray
                Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarAl" -Value 0 -ErrorAction SilentlyContinue
                Write-Host "Taskbar aligned to left!" -ForegroundColor Green
            }
            '2' {
                Write-Host "Setting taskbar to center aligned..." -ForegroundColor Gray
                Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarAl" -Value 1 -ErrorAction SilentlyContinue
                Write-Host "Taskbar aligned to center!" -ForegroundColor Green
            }
            '3' {
                Write-Host "No taskbar alignment changes applied." -ForegroundColor Yellow
            }
            default {
                Write-Host "Invalid choice. No taskbar alignment changes applied." -ForegroundColor Yellow
            }
        }
        
        # Small taskbar icons (Windows 11)
        Write-Host ""
        $smallIconsChoice = Get-YesNoChoice -Prompt "Use small taskbar icons?"
        if ($smallIconsChoice -eq 'Y') {
            Write-Host "Enabling small taskbar icons..." -ForegroundColor Gray
            Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarSi" -Value 0 -ErrorAction SilentlyContinue
            Write-Host "Small taskbar icons enabled!" -ForegroundColor Green
        } else {
            Write-Host "Using normal taskbar icons..." -ForegroundColor Gray
            Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarSi" -Value 1 -ErrorAction SilentlyContinue
            Write-Host "Normal taskbar icons set!" -ForegroundColor Green
        }
    } else {
        # Windows 10 specific options
        Write-Host "Windows 10 Taskbar Configuration:" -ForegroundColor Cyan
        Write-Host ""
        
        # Small taskbar icons (Windows 10)
        $smallIconsChoice = Get-YesNoChoice -Prompt "Use small taskbar icons?"
        if ($smallIconsChoice -eq 'Y') {
            Write-Host "Enabling small taskbar icons..." -ForegroundColor Gray
            Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarSmallIcons" -Value 1 -ErrorAction SilentlyContinue
            Write-Host "Small taskbar icons enabled!" -ForegroundColor Green
        } else {
            Write-Host "Using normal taskbar icons..." -ForegroundColor Gray
            Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarSmallIcons" -Value 0 -ErrorAction SilentlyContinue
            Write-Host "Normal taskbar icons set!" -ForegroundColor Green
        }
    }
    Write-Host ""
    
    # Wallpaper Selection
    $wallpaperChoice = Get-YesNoChoice -Prompt "Do you want to set a custom wallpaper?"
    if ($wallpaperChoice -eq 'Y') {
        Add-Type -AssemblyName System.Windows.Forms
        $FileBrowser = New-Object System.Windows.Forms.OpenFileDialog -Property @{
            InitialDirectory = [Environment]::GetFolderPath('MyPictures')
            Filter = 'Images (*.jpg;*.jpeg;*.png;*.bmp)|*.jpg;*.jpeg;*.png;*.bmp'
            Title = 'Select Wallpaper'
        }
        
        if ($FileBrowser.ShowDialog() -eq 'OK') {
            $wallpaperPath = $FileBrowser.FileName
            Write-Host "Setting wallpaper to: $wallpaperPath" -ForegroundColor Gray
            
            Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Wallpaper {
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
            [Wallpaper]::SystemParametersInfo(0x0014, 0, $wallpaperPath, 0x0001 -bor 0x0002)
            Write-Host "Wallpaper set successfully!" -ForegroundColor Green
        } else {
            Write-Host "No wallpaper selected." -ForegroundColor Yellow
        }
    } else {
        Write-Host "Skipping wallpaper selection." -ForegroundColor Yellow
    }
    Write-Host ""
    
    # Theme Color Selection
    $colorChoice = Get-YesNoChoice -Prompt "Do you want automatic colors based on wallpaper?"
    if ($colorChoice -eq 'Y') {
        Write-Host "Enabling automatic accent color from wallpaper..." -ForegroundColor Gray
        Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "ColorPrevalence" -Value 0
        Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\DWM" -Name "ColorPrevalence" -Value 1
        Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "AutoColorization" -Value 1
        Write-Host "Automatic colors enabled!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Choose your accent color:" -ForegroundColor Cyan
        Write-Host "1. Blue (Default)"
        Write-Host "2. Red"
        Write-Host "3. Green"
        Write-Host "4. Purple"
        Write-Host "5. Orange"
        Write-Host "6. Pink"
        Write-Host "7. No change"
        $accentChoice = Read-Host "Enter number (1-7)"
        
        if ([string]::IsNullOrWhiteSpace($accentChoice)) {
            $accentChoice = "1"
        }
        
        $accentColors = @{
            '1' = 0xFF0078D4  # Blue
            '2' = 0xFFE74856  # Red
            '3' = 0xFF10893E  # Green
            '4' = 0xFF8E8CD8  # Purple
            '5' = 0xFFCA5010  # Orange
            '6' = 0xFFE3008C  # Pink
        }
        
        if ($accentChoice -ne '7') {
            $selectedColor = $accentColors[$accentChoice]
            if ($selectedColor) {
                Write-Host "Setting accent color..." -ForegroundColor Gray
                Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\DWM" -Name "AccentColor" -Value $selectedColor
                Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\DWM" -Name "ColorizationColor" -Value $selectedColor
                Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\DWM" -Name "ColorPrevalence" -Value 1
                Write-Host "Accent color set!" -ForegroundColor Green
            } else {
                Write-Host "Invalid choice, keeping default color." -ForegroundColor Yellow
            }
        } else {
            Write-Host "No accent color changes applied." -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Restarting Explorer to apply changes..." -ForegroundColor Gray
    Stop-Process -Name explorer -Force
    Write-Host "Explorer restarted!" -ForegroundColor Green
} else {
    Write-Host "Skipping Windows customization." -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Install Chocolatey and Node.js
$chocoChoice = Get-YesNoChoice -Prompt "[4/5] Do you want to install Chocolatey and Node.js?"
if ($chocoChoice -eq 'Y') {
    Write-Host ""
    Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
    Write-Host "Running Chocolatey installer..." -ForegroundColor Gray
    Write-Host ""
    
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Host ""
        Write-Host "Chocolatey installed successfully!" -ForegroundColor Green
        
        # Refresh environment variables to get choco in PATH
        Write-Host ""
        Write-Host "Refreshing environment variables..." -ForegroundColor Gray
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Install Node.js
        $nodeChoice = Get-YesNoChoice -Prompt "Do you want to install Node.js v24.13.0?"
        if ($nodeChoice -eq 'Y') {
            Write-Host ""
            Write-Host "Installing Node.js v24.13.0..." -ForegroundColor Yellow
            choco install nodejs --version="24.13.0" -y
            
            # Refresh environment variables again to get node/npm in PATH
            Write-Host ""
            Write-Host "Refreshing environment variables..." -ForegroundColor Gray
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            # Enable pnpm and yarn via corepack
            $corepackChoice = Get-YesNoChoice -Prompt "Do you want to enable pnpm and yarn?"
            if ($corepackChoice -eq 'Y') {
                Write-Host ""
                Write-Host "Enabling pnpm and yarn..." -ForegroundColor Yellow
                corepack enable pnpm
                corepack enable yarn
            }
            
            # Test installations
            Write-Host ""
            Write-Host "Testing Node.js and package managers..." -ForegroundColor Cyan
            Write-Host "Node.js version:" -ForegroundColor Gray
            node -v
            Write-Host "npm version:" -ForegroundColor Gray
            npm -v
            if ($corepackChoice -eq 'Y') {
                Write-Host "yarn version:" -ForegroundColor Gray
                yarn -v
                Write-Host "pnpm version:" -ForegroundColor Gray
                pnpm -v
            }
            Write-Host ""
            Write-Host "All packages installed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Skipping Node.js installation." -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "Error during Chocolatey setup: $_" -ForegroundColor Red
        Write-Host "Continuing to next step..." -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipping Chocolatey and Node.js installation." -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Open Ninite
$niniteChoice = Get-YesNoChoice -Prompt "[5/5] Do you want to open Ninite in your browser?"
if ($niniteChoice -eq 'Y') {
    Write-Host ""
    Write-Host "Opening Ninite..." -ForegroundColor Yellow
    Write-Host ""
    try {
        Start-Process "https://ninite.com/"
    } catch {
        Write-Host "Error opening Ninite: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Skipping Ninite." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")