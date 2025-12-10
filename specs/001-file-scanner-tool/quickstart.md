# Quickstart Guide: 跨平台檔案掃描工具

**Date**: 2025-12-08 | **Phase**: 1 - Design | **Spec**: [spec.md](./spec.md)

---

## 目錄

1. [環境需求](#環境需求)
2. [專案初始化](#專案初始化)
3. [開發環境設定](#開發環境設定)
4. [專案結構](#專案結構)
5. [開發命令](#開發命令)
6. [建構與發布](#建構與發布)
7. [常見問題](#常見問題)

---

## 環境需求

### 必要軟體

| 軟體 | 版本需求 | 說明 |
|-----|---------|------|
| Node.js | 18.x 或更新 | JavaScript 執行環境 |
| pnpm | 8.x 或更新 | 套件管理器（建議使用） |
| Rust | 1.75 或更新 | 後端語言 |
| Git | 2.x 或更新 | 版本控制 |

### 平台特定需求

#### Windows

```powershell
# 安裝 Rust
winget install Rustlang.Rust.MSVC

# 或使用 rustup
Invoke-WebRequest https://win.rustup.rs -OutFile rustup-init.exe
./rustup-init.exe

# 安裝 Node.js
winget install OpenJS.NodeJS.LTS

# 安裝 pnpm
corepack enable
corepack prepare pnpm@latest --activate

# 安裝 Visual Studio Build Tools (如果尚未安裝)
winget install Microsoft.VisualStudio.2022.BuildTools
```

**Windows 額外需求**:
- Microsoft Visual C++ Build Tools
- Windows 10 SDK

#### macOS

```bash
# 安裝 Xcode Command Line Tools
xcode-select --install

# 安裝 Homebrew (如果尚未安裝)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安裝 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安裝 Node.js
brew install node@18

# 安裝 pnpm
corepack enable
corepack prepare pnpm@latest --activate
```

**macOS 額外需求**:
- Xcode Command Line Tools
- 支援 macOS 12 (Monterey) 或更新版本

---

## 專案初始化

### 1. 建立 Tauri 專案

```bash
# 使用 pnpm 建立新專案
pnpm create tauri-app@latest hans-file-scanner

# 選擇以下選項:
# - Project name: hans-file-scanner
# - Package manager: pnpm
# - Frontend framework: React
# - UI Template: TypeScript
# - Frontend project name: frontend
```

### 2. 進入專案目錄

```bash
cd hans-file-scanner
```

### 3. 安裝前端相依套件

```bash
pnpm install

# 安裝額外的前端套件
pnpm add zustand @tanstack/react-virtual lucide-react
pnpm add -D tailwindcss postcss autoprefixer
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-checkbox

# 安裝 shadcn/ui 相關套件
pnpm dlx shadcn@latest init
```

### 4. 安裝 Tauri Plugins

```bash
# 安裝 Dialog plugin (用於選擇資料夾)
pnpm tauri add dialog

# 安裝 fs plugin (用於檔案系統操作)
pnpm tauri add fs
```

### 5. 新增 Rust 相依套件

編輯 `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
walkdir = "2.4"
chrono = "0.4"
trash = "3"  # 用於移至資源回收筒

[target.'cfg(target_os = "macos")'.dependencies]
# macOS 特定相依套件 (如需要)

[target.'cfg(target_os = "windows")'.dependencies]
# Windows 特定相依套件 (如需要)
```

---

## 開發環境設定

### 1. 設定 Tailwind CSS

建立 `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

建立 `postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

在 `src/index.css` 加入:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2. 設定 TypeScript

確認 `tsconfig.json` 包含:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. 設定 Vite 路徑別名

編輯 `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  clearScreen: false,
  server: {
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'esnext',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

### 4. 設定 Tauri 權限

編輯 `src-tauri/capabilities/default.json`:

```json
{
  "identifier": "default",
  "description": "Default capability for file scanner",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "dialog:default",
    "dialog:allow-open",
    "fs:default",
    "fs:allow-read",
    "fs:allow-write",
    "fs:allow-exists",
    "fs:allow-remove",
    "fs:allow-copy"
  ]
}
```

---

## 專案結構

```
hans-file-scanner/
├── src/                          # React 前端程式碼
│   ├── components/               # UI 元件
│   │   ├── ui/                   # shadcn/ui 基礎元件
│   │   ├── FileList/             # 檔案列表元件
│   │   ├── Toolbar/              # 工具列元件
│   │   ├── Sidebar/              # 側邊欄元件
│   │   └── Dialog/               # 對話框元件
│   ├── hooks/                    # 自訂 React Hooks
│   │   ├── useFileScanner.ts     # 檔案掃描邏輯
│   │   ├── useFileOperations.ts  # 檔案操作邏輯
│   │   └── useSelection.ts       # 選取邏輯
│   ├── stores/                   # Zustand 狀態管理
│   │   ├── scanStore.ts          # 掃描狀態
│   │   ├── selectionStore.ts     # 選取狀態
│   │   └── viewStore.ts          # 檢視狀態
│   ├── lib/                      # 工具函式
│   │   ├── tauri.ts              # Tauri API 封裝
│   │   ├── fileUtils.ts          # 檔案工具函式
│   │   └── formatters.ts         # 格式化函式
│   ├── types/                    # TypeScript 型別定義
│   │   └── index.ts              # 共用型別
│   ├── App.tsx                   # 主應用元件
│   ├── main.tsx                  # 進入點
│   └── index.css                 # 全域樣式
├── src-tauri/                    # Rust 後端程式碼
│   ├── src/
│   │   ├── commands/             # Tauri 命令
│   │   │   ├── mod.rs
│   │   │   ├── scan.rs           # 掃描命令
│   │   │   └── file_ops.rs       # 檔案操作命令
│   │   ├── models/               # 資料模型
│   │   │   ├── mod.rs
│   │   │   ├── file_entry.rs     # 檔案條目
│   │   │   └── scan_result.rs    # 掃描結果
│   │   ├── utils/                # 工具函式
│   │   │   ├── mod.rs
│   │   │   └── file_category.rs  # 檔案分類
│   │   ├── lib.rs                # 函式庫入口
│   │   └── main.rs               # 應用程式入口
│   ├── capabilities/
│   │   └── default.json          # 權限設定
│   ├── Cargo.toml                # Rust 相依套件
│   └── tauri.conf.json           # Tauri 設定
├── specs/                        # 規格文件
├── package.json                  # 前端相依套件
├── pnpm-lock.yaml
├── vite.config.ts                # Vite 設定
├── tailwind.config.js            # Tailwind 設定
└── tsconfig.json                 # TypeScript 設定
```

---

## 開發命令

### 日常開發

```bash
# 啟動開發環境 (前端 + Tauri)
pnpm tauri dev

# 僅啟動前端開發伺服器
pnpm dev

# 執行前端測試
pnpm test

# 執行前端測試並產生覆蓋率報告
pnpm test:coverage
```

### Rust 後端開發

```bash
# 進入 Tauri 目錄
cd src-tauri

# 執行 Rust 測試
cargo test

# 執行測試並產生覆蓋率報告
cargo tarpaulin --out Html

# 檢查程式碼
cargo clippy

# 格式化程式碼
cargo fmt
```

### 程式碼品質

```bash
# 前端 lint
pnpm lint

# 前端格式化
pnpm format

# 型別檢查
pnpm type-check
```

---

## 建構與發布

### 本地建構

```bash
# 建構 debug 版本
pnpm tauri build --debug

# 建構 release 版本
pnpm tauri build
```

### 建構產出

建構完成後，安裝檔位於:

- **Windows**: `src-tauri/target/release/bundle/msi/` 或 `nsis/`
- **macOS**: `src-tauri/target/release/bundle/dmg/` 或 `macos/`

### GitHub Actions CI/CD

專案使用 GitHub Actions 進行自動化建構。詳見 `.github/workflows/build.yml`。

建構矩陣:
- Windows x64
- macOS x64 (Intel)
- macOS arm64 (Apple Silicon)

---

## 常見問題

### Q: Windows 建構時出現 `link.exe` 錯誤

**A**: 確認已安裝 Visual Studio Build Tools:
```powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

### Q: macOS 建構時出現 codesign 錯誤

**A**: 開發階段可以在 `tauri.conf.json` 中停用簽署:
```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": null
    }
  }
}
```

### Q: `pnpm tauri dev` 啟動很慢

**A**: 第一次執行時 Rust 需要編譯所有相依套件，後續執行會使用快取。

### Q: 如何測試 Tauri 命令？

**A**: 在 Rust 測試中模擬 Tauri 環境:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_folder() {
        let result = scan_directory_impl("./test-fixtures");
        assert!(result.is_ok());
    }
}
```

### Q: 如何除錯 IPC 通訊？

**A**: 在前端使用 console.log，在 Rust 使用 println!:
```typescript
// 前端
const result = await invoke('scan_folder', { path });
console.log('Scan result:', result);
```

```rust
// Rust
#[tauri::command]
async fn scan_folder(path: String) -> Result<ScanResult, String> {
    println!("Scanning: {}", path);
    // ...
}
```

---

## 相關文件

- [Tauri 2.x 官方文件](https://v2.tauri.app/)
- [React 官方文件](https://react.dev/)
- [Zustand 文件](https://zustand-demo.pmnd.rs/)
- [shadcn/ui 文件](https://ui.shadcn.com/)
- [Tailwind CSS 文件](https://tailwindcss.com/)

---

## 下一步

1. 參考 [spec.md](./spec.md) 了解功能需求
2. 參考 [data-model.md](./data-model.md) 了解資料結構
3. 參考 [contracts/tauri-commands.ts](./contracts/tauri-commands.ts) 了解 API 介面
4. 開始實作第一個 User Story: P1 - 掃描資料夾
