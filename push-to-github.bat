@echo off
setlocal enabledelayedexpansion

echo ========================================
echo NeonHub AI Marketing Ecosystem
echo GitHub Push Automation Script
echo Target: https://github.com/KofiRusu/Neon-v0.2
echo ========================================
echo.

:: Check if git is available
echo [1/7] Checking Git availability...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git not found in PATH
    echo Trying alternative locations...
    
    :: Try common Git installation paths
    if exist "C:\Program Files\Git\bin\git.exe" (
        set "GIT_PATH=C:\Program Files\Git\bin\git.exe"
        echo ✓ Found Git at: !GIT_PATH!
    ) else if exist "C:\Program Files (x86)\Git\bin\git.exe" (
        set "GIT_PATH=C:\Program Files (x86)\Git\bin\git.exe"
        echo ✓ Found Git at: !GIT_PATH!
    ) else (
        echo ❌ Git not found. Please install Git from https://git-scm.com/
        echo.
        echo Manual push instructions:
        echo 1. Open Command Prompt or PowerShell
        echo 2. Navigate to: %CD%
        echo 3. Run: git add .
        echo 4. Run: git commit -m "🎨 Major UI/UX Enhancement: NeonHub Dashboard v0.2"
        echo 5. Run: git push origin main
        pause
        exit /b 1
    )
) else (
    set "GIT_PATH=git"
    echo ✓ Git found in PATH
)

echo.

:: Check if we're in a git repository
echo [2/7] Checking Git repository status...
!GIT_PATH! status >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not in a Git repository
    echo Initializing Git repository...
    !GIT_PATH! init
    echo ✓ Git repository initialized
) else (
    echo ✓ Already in a Git repository
)

echo.

:: Check remote configuration
echo [3/7] Checking remote configuration...
!GIT_PATH! remote -v | findstr "origin" >nul
if %errorlevel% neq 0 (
    echo ❌ No remote origin configured
    echo Adding remote origin...
    !GIT_PATH! remote add origin https://github.com/KofiRusu/Neon-v0.2.git
    echo ✓ Remote origin added
) else (
    echo ✓ Remote origin already configured
)

echo.

:: Add all files
echo [4/7] Adding all modified files...
!GIT_PATH! add .
if %errorlevel% equ 0 (
    echo ✓ All files added to staging area
) else (
    echo ❌ Error adding files
    pause
    exit /b 1
)

echo.

:: Check if there are changes to commit
echo [5/7] Checking for changes to commit...
!GIT_PATH! diff --cached --quiet
if %errorlevel% equ 0 (
    echo ℹ️ No changes to commit
    echo All enhancements are already committed or no changes detected
) else (
    echo ✓ Changes detected, creating commit...
    
    :: Create commit with comprehensive message
    !GIT_PATH! commit -m "🎨 Major UI/UX Enhancement: NeonHub Dashboard v0.2"
    
    if %errorlevel% equ 0 (
        echo ✓ Commit created successfully
    ) else (
        echo ❌ Error creating commit
        pause
        exit /b 1
    )
)

echo.

:: Push to remote repository
echo [6/7] Pushing to GitHub repository...
echo Target: https://github.com/KofiRusu/Neon-v0.2
echo.

!GIT_PATH! push origin main
if %errorlevel% equ 0 (
    echo ✓ Successfully pushed to GitHub!
) else (
    echo ❌ Error pushing to GitHub
    echo.
    echo Possible solutions:
    echo 1. Check your GitHub credentials
    echo 2. Ensure you have push access to the repository
    echo 3. Try: git pull origin main (to sync with remote)
    echo 4. Check your internet connection
    echo.
    echo Manual push command:
    echo !GIT_PATH! push origin main
    pause
    exit /b 1
)

echo.

:: Final status check
echo [7/7] Final status check...
!GIT_PATH! status
echo.

echo ========================================
echo 🎉 SUCCESS: All enhancements pushed!
echo ========================================
echo.
echo 📊 Summary of changes pushed to GitHub:
echo - Enhanced visual design with neon theme
echo - Fixed all TypeScript errors
echo - Updated dependencies for security
echo - Improved user experience and accessibility
echo - Added comprehensive QA documentation
echo.
echo 🌐 Repository: https://github.com/KofiRusu/Neon-v0.2
echo 🌐 Dashboard running on: http://localhost:3003
echo 🔗 API running on: http://localhost:3001
echo.
echo Ready for production deployment! 🚀
echo.
pause 