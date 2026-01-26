# Doughmination Setup Script
# This script debloats Windows and activates it

# ========================================
# Licenced by ESAL-1.3
# Clove Nytrix Doughmination Twilight
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Doughmination Windows Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTICE: The scripts will request Administrator privileges." -ForegroundColor Yellow
Write-Host "You will see UAC prompts that you need to accept." -ForegroundColor Yellow
Write-Host ""
Write-Host "TIP: Run PowerShell as Administrator for the best experience." -ForegroundColor Cyan
Write-Host "This allows Chocolatey to install without additional prompts." -ForegroundColor Cyan
Write-Host ""
Start-Sleep -Seconds 5
Write-Host ""
# Step 1: Debloat Windows
Write-Host "[1/5] Debloating Windows..." -ForegroundColor Yellow
Write-Host "Running Raphi's Windows Debloater..." -ForegroundColor Gray
Write-Host ""
try {
    & ([scriptblock]::Create((Invoke-RestMethod "https://debloat.raphi.re/")))
    Write-Host ""
    Write-Host "Debloat completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error during debloat: $_" -ForegroundColor Red
    Write-Host "Continuing to next step..." -ForegroundColor Yellow
}
Write-Host ""
# Step 2: Activate Windows
Write-Host "[2/5] Activating Windows..." -ForegroundColor Yellow
Write-Host "Running Microsoft Activation Scripts..." -ForegroundColor Gray
Write-Host ""
try {
    Invoke-RestMethod https://get.activated.win | Invoke-Expression
    Write-Host ""
    Write-Host "Activation completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error during activation: $_" -ForegroundColor Red
}
Write-Host ""
# Step 3: Windows Customization
Write-Host "[3/5] Customizing Windows..." -ForegroundColor Yellow
Write-Host ""

# Enable Dark Mode
Write-Host "Enabling Dark Mode..." -ForegroundColor Gray
Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 0
Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "SystemUsesLightTheme" -Value 0
Write-Host "Dark Mode enabled!" -ForegroundColor Green

# Show hidden files
Write-Host "Enabling hidden files in Explorer..." -ForegroundColor Gray
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "Hidden" -Value 1
Write-Host "Hidden files now visible!" -ForegroundColor Green

# Show file extensions
Write-Host "Enabling file extensions..." -ForegroundColor Gray
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "HideFileExt" -Value 0
Write-Host "File extensions now visible!" -ForegroundColor Green

# Small taskbar icons (Windows 10) / Left align taskbar (Windows 11)
Write-Host "Configuring taskbar..." -ForegroundColor Gray
# Windows 11 - Left align taskbar
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarAl" -Value 0 -ErrorAction SilentlyContinue
Write-Host "Taskbar configured!" -ForegroundColor Green

Write-Host ""

# Wallpaper Selection
Write-Host "Wallpaper Setup" -ForegroundColor Cyan
Write-Host "---------------" -ForegroundColor Cyan
$wallpaperChoice = Read-Host "Do you want to set a custom wallpaper? (y/n)"

if ($wallpaperChoice -eq 'y') {
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
}

Write-Host ""

# Theme Color Selection
Write-Host "Theme Color Setup" -ForegroundColor Cyan
Write-Host "-----------------" -ForegroundColor Cyan
$colorChoice = Read-Host "Do you want automatic colors based on wallpaper? (y/n)"

if ($colorChoice -eq 'y') {
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
    $accentChoice = Read-Host "Enter number (1-6)"
    
    $accentColors = @{
        '1' = 0xFF0078D4  # Blue
        '2' = 0xFFE74856  # Red
        '3' = 0xFF10893E  # Green
        '4' = 0xFF8E8CD8  # Purple
        '5' = 0xFFCA5010  # Orange
        '6' = 0xFFE3008C  # Pink
    }
    
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
}

Write-Host ""
Write-Host "Restarting Explorer to apply changes..." -ForegroundColor Gray
Stop-Process -Name explorer -Force
Write-Host "Explorer restarted!" -ForegroundColor Green

Write-Host ""
# Step 4: Install Chocolatey
Write-Host "[4/5] Installing Chocolatey..." -ForegroundColor Yellow
Write-Host "Running Chocolatey installer..." -ForegroundColor Gray
Write-Host ""

# Check for admin privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Chocolatey installation requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please run this script as Administrator to install Chocolatey." -ForegroundColor Yellow
    Write-Host "Skipping Chocolatey installation..." -ForegroundColor Yellow
} else {
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Host ""
        Write-Host "Chocolatey installed successfully!" -ForegroundColor Green
        
        # Refresh environment variables to get choco in PATH
        Write-Host ""
        Write-Host "Refreshing environment variables..." -ForegroundColor Gray
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Install Node.js
        Write-Host ""
        Write-Host "Installing Node.js v24.13.0..." -ForegroundColor Yellow
        choco install nodejs --version="24.13.0" -y
        
        # Refresh environment variables again to get node/npm in PATH
        Write-Host ""
        Write-Host "Refreshing environment variables..." -ForegroundColor Gray
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Enable pnpm and yarn via corepack
        Write-Host ""
        Write-Host "Enabling pnpm and yarn..." -ForegroundColor Yellow
        corepack enable pnpm
        corepack enable yarn
        
        # Test installations
        Write-Host ""
        Write-Host "Testing Node.js and package managers..." -ForegroundColor Cyan
        Write-Host "Node.js version:" -ForegroundColor Gray
        node -v
        Write-Host "npm version:" -ForegroundColor Gray
        npm -v
        Write-Host "yarn version:" -ForegroundColor Gray
        yarn -v
        Write-Host "pnpm version:" -ForegroundColor Gray
        pnpm -v
        Write-Host ""
        Write-Host "All packages installed successfully!" -ForegroundColor Green
        
    } catch {
        Write-Host "Error during Chocolatey setup: $_" -ForegroundColor Red
        Write-Host "Continuing to next step..." -ForegroundColor Yellow
    }
}
Write-Host ""
# Step 5: Open Ninite
Write-Host "[5/5] Opening Ninite..." -ForegroundColor Yellow
Write-Host ""
try {
    Start-Process "https://ninite.com/"
} catch {
    Write-Host "Error opening Ninite: $_" -ForegroundColor Red
}
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan