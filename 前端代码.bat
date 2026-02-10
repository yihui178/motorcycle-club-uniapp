@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

REM ========================================
REM 前端项目代码一键导出脚本
REM ========================================

set OUTPUT_FILE=frontend-code.txt
set PROJECT_NAME=Vue Vben Admin Frontend
set file_count=0

color 0A

echo.
echo ======================================
echo      前端项目代码导出工具
echo ======================================
echo.

REM 检查前端项目目录
if not exist "src" if not exist "package.json" (
    color 0C
    echo [错误] 请在前端项目根目录运行此脚本
    pause
    exit /b 1
)

echo [信息] 正在扫描前端文件...
echo.

REM 清空输出文件并写入文件头
(
echo %PROJECT_NAME% - 代码导出
echo 时间: %date% %time%
echo 路径: %cd%
echo.
) > "%OUTPUT_FILE%"

REM ========== 导出 Vue 组件 ==========
echo [1/10] Vue 组件文件...
for /r src %%f in (*.vue) do (
    set "file_path=%%f"
    echo !file_path! | findstr /i "node_modules .git dist .vscode .idea" > nul
    if errorlevel 1 (
        echo    %%~nxf
        (
        echo.
        echo === %%f ===
        echo.
        type "%%f" 2>nul
        echo.
        ) >> "%OUTPUT_FILE%"
        set /a file_count+=1
    )
)

REM ========== 导出 TypeScript 文件 ==========
echo [2/10] TypeScript 文件...
for /r src %%f in (*.ts) do (
    set "file_path=%%f"
    echo !file_path! | findstr /i "node_modules .git dist .vscode .idea .d.ts" > nul
    if errorlevel 1 (
        echo    %%~nxf
        (
        echo.
        echo === %%f ===
        echo.
        type "%%f" 2>nul
        echo.
        ) >> "%OUTPUT_FILE%"
        set /a file_count+=1
    )
)

REM ========== 导出 JavaScript 文件 ==========
echo [3/10] JavaScript 文件...
for /r src %%f in (*.js *.jsx) do (
    set "file_path=%%f"
    echo !file_path! | findstr /i "node_modules .git dist .vscode .idea" > nul
    if errorlevel 1 (
        echo    %%~nxf
        (
        echo.
        echo === %%f ===
        echo.
        type "%%f" 2>nul
        echo.
        ) >> "%OUTPUT_FILE%"
        set /a file_count+=1
    )
)

REM ========== 导出 API 接口文件 ==========
echo [4/10] API 接口文件...
for /r src\api %%f in (*.ts *.js) do (
    set "file_path=%%f"
    echo !file_path! | findstr /i "node_modules .git dist" > nul
    if errorlevel 1 (
        echo    %%~nxf
        (
        echo.
        echo === %%f ===
        echo.
        type "%%f" 2>nul
        echo.
        ) >> "%OUTPUT_FILE%"
        set /a file_count+=1
    )
)

REM ========== 导出 Store 状态管理 ==========
echo [5/10] Store 文件...
for /r src\store %%f in (*.ts *.js) do (
    set "file_path=%%f"
    echo !file_path! | findstr /i "node_modules .git dist" > nul
    if errorlevel 1 (
        echo    %%~nxf
        (
        echo.
        echo === %%f ===
        echo.
        type "%%f" 2>nul
        echo.
        ) >> "%OUTPUT_FILE%"
        set /a file_count+=1
    )
)

REM ========== 导出路由配置 ==========
echo [6/10] 路由配置文件...
for /r src\router %%f in (*.ts *.js) do (
    set "file_path=%%f"
    echo !file_path! | findstr /i "node_modules .git dist" > nul
    if errorlevel 1 (
        echo    %%~nxf
        (
        echo.
        echo === %%f ===
        echo.
        type "%%f" 2>nul
        echo.
        ) >> "%OUTPUT_FILE%"
        set /a file_count+=1
    )
)

REM ========== 导出 CSS/SCSS/LESS 样式文件 ==========
echo [7/10] 样式文件...
for /r src %%f in (*.css *.scss *.less *.sass) do (
    set "file_path=%%f"
    echo !file_path! | findstr /i "node_modules .git dist .vscode" > nul
    if errorlevel 1 (
        echo    %%~nxf
        (
        echo.
        echo === %%f ===
        echo.
        type "%%f" 2>nul
        echo.
        ) >> "%OUTPUT_FILE%"
        set /a file_count+=1
    )
)

REM ========== 导出配置文件 ==========
echo [8/10] 配置文件...
for %%f in (package.json tsconfig.json vite.config.ts vite.config.js .env .env.production .env.development) do (
    if exist "%%f" (
        echo    %%f
        (
        echo.
        echo === %cd%\%%f ===
        echo.
        type "%%f" 2>nul
        echo.
        ) >> "%OUTPUT_FILE%"
        set /a file_count+=1
    )
)

REM ========== 导出 index.html ==========
echo [9/10] HTML 文件...
if exist "index.html" (
    echo    index.html
    (
    echo.
    echo === %cd%\index.html ===
    echo.
    type "index.html" 2>nul
    echo.
    ) >> "%OUTPUT_FILE%"
    set /a file_count+=1
)

REM ========== 导出 Mock 数据（如果有）==========
echo [10/10] Mock 数据...
if exist "mock" (
    for /r mock %%f in (*.ts *.js) do (
        set "file_path=%%f"
        echo !file_path! | findstr /i "node_modules .git" > nul
        if errorlevel 1 (
            echo    %%~nxf
            (
            echo.
            echo === %%f ===
            echo.
            type "%%f" 2>nul
            echo.
            ) >> "%OUTPUT_FILE%"
            set /a file_count+=1
        )
    )
)

REM 写入统计信息
(
echo.
echo === 统计信息 ===
echo 文件数量: %file_count%
echo 导出时间: %date% %time%
echo 项目路径: %cd%
) >> "%OUTPUT_FILE%"

REM 获取文件大小
for %%A in ("%OUTPUT_FILE%") do set file_size=%%~zA
set /a size_kb=!file_size! / 1024

REM 显示结果
color 0A
echo.
echo ======================================
echo            导出完成
echo ======================================
echo.
echo 输出文件: %OUTPUT_FILE%
echo 文件数量: %file_count% 个
echo 文件大小: %size_kb% KB
echo.

REM 询问是否打开
set /p open_file="是否打开文件? (Y/N): "
if /i "!open_file!"=="Y" start notepad "%OUTPUT_FILE%"

echo.
echo 感谢使用前端代码导出工具！
pause