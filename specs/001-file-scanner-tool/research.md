# Research: 跨平台檔案掃描工具

**Date**: 2025-12-08 | **Phase**: 0 - Research | **Spec**: [spec.md](./spec.md)

---

## 1. Tauri 2.x 框架

### Decision
採用 Tauri 2.x 作為跨平台桌面應用框架。

### Rationale
- **輕量化**: 產出的應用程式大小約 5-10MB，遠小於 Electron (~100MB+)
- **效能**: 使用系統原生 WebView，記憶體佔用低
- **Rust 後端**: 提供安全、高效能的檔案系統操作
- **跨平台**: 單一程式碼庫支援 Windows、macOS、Linux
- **安全性**: 預設沙箱環境，明確的權限系統

### Alternatives Considered
| 方案 | 優點 | 缺點 | 被拒絕原因 |
|------|------|------|-----------|
| Electron | 生態系成熟、文件豐富 | 體積大、記憶體佔用高 | 不符合輕量化需求 |
| Flutter Desktop | 跨平台、UI 一致性 | 檔案系統 API 較弱、Dart 學習曲線 | 檔案操作需求不適合 |
| .NET MAUI | 微軟支援、C# 生態 | macOS 支援較新、體積中等 | 跨平台成熟度考量 |
| 原生開發 (Swift/C++) | 最佳效能 | 需維護兩套程式碼 | 開發成本過高 |

### Key Implementation Notes
- Tauri 2.x 使用新的 plugin 系統，需使用 `@tauri-apps/plugin-*` 套件
- IPC 通訊使用 `invoke` 呼叫 Rust commands
- 需要在 `tauri.conf.json` 設定檔案系統存取權限

---

## 2. React 18+ 前端框架

### Decision
採用 React 18+ 搭配 TypeScript 作為前端框架。

### Rationale
- **使用者指定**: 規格需求明確指定 React 18+ with TypeScript
- **生態系豐富**: 元件函式庫、狀態管理、開發工具完善
- **Tauri 整合**: 官方範本支援，整合順暢
- **開發效率**: JSX + TypeScript 提供良好的開發體驗

### Alternatives Considered
| 方案 | 優點 | 缺點 | 被拒絕原因 |
|------|------|------|-----------|
| Vue 3 | 漸進式、易學 | 規格已指定 React | 使用者偏好 React |
| Svelte | 編譯時優化、輕量 | 生態系較小 | 規格已指定 React |
| Solid.js | 高效能、React 語法相似 | 生態系較新 | 規格已指定 React |

### Key Implementation Notes
- 使用 Vite 作為建構工具（Tauri 官方建議）
- 狀態管理使用 Zustand（輕量、簡單）
- UI 元件使用 shadcn/ui（基於 Radix UI，無障礙支援佳）

---

## 3. Rust 檔案系統操作

### Decision
使用 Rust 標準函式庫 + walkdir crate 進行檔案系統遍歷。

### Rationale
- **效能**: Rust 原生檔案系統 API 效能優異
- **walkdir crate**: 成熟、高效的目錄遍歷函式庫
- **錯誤處理**: Rust 的 Result 類型確保完善的錯誤處理
- **跨平台**: std::fs 自動處理平台差異

### Key Dependencies
```toml
[dependencies]
walkdir = "2.4"           # 目錄遍歷
serde = { version = "1.0", features = ["derive"] }  # 序列化
serde_json = "1.0"        # JSON 序列化
```

### Implementation Patterns
```rust
// 遍歷目錄的基本模式
use walkdir::WalkDir;

fn scan_directory(path: &str) -> Vec<FileEntry> {
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())  // 跳過無法存取的檔案
        .map(|entry| FileEntry::from(entry))
        .collect()
}
```

### Error Handling for Locked Files
- 使用 `filter_map` 跳過無法讀取的檔案
- 記錄失敗的檔案路徑到失敗清單
- 在 UI 顯示失敗清單供使用者檢視

---

## 4. 檔案類型分類邏輯

### Decision
基於副檔名進行檔案類型分類，使用列舉類型定義支援的類型。

### Rationale
- **簡單可靠**: 副檔名判斷效率高，準確度足夠
- **可擴展**: 新增類型只需擴展映射表
- **效能**: 無需讀取檔案內容判斷 MIME type

### Classification Categories
```rust
enum FileCategory {
    Document,   // .pdf, .doc, .docx, .txt, .xls, .xlsx, .ppt, .pptx
    Image,      // .jpg, .jpeg, .png, .gif, .bmp, .svg, .webp
    Video,      // .mp4, .avi, .mkv, .mov, .wmv, .flv
    Audio,      // .mp3, .wav, .flac, .aac, .ogg, .m4a
    Other,      // 其他未分類檔案
}
```

### Extension Mapping
```rust
fn classify_file(extension: &str) -> FileCategory {
    match extension.to_lowercase().as_str() {
        // Documents
        "pdf" | "doc" | "docx" | "txt" | "xls" | "xlsx" | 
        "ppt" | "pptx" | "odt" | "ods" | "odp" => FileCategory::Document,
        
        // Images
        "jpg" | "jpeg" | "png" | "gif" | "bmp" | 
        "svg" | "webp" | "ico" | "tiff" => FileCategory::Image,
        
        // Videos
        "mp4" | "avi" | "mkv" | "mov" | "wmv" | 
        "flv" | "webm" | "m4v" => FileCategory::Video,
        
        // Audio
        "mp3" | "wav" | "flac" | "aac" | "ogg" | 
        "m4a" | "wma" => FileCategory::Audio,
        
        // Default
        _ => FileCategory::Other,
    }
}
```

---

## 5. 狀態管理方案

### Decision
使用 Zustand 進行前端狀態管理。

### Rationale
- **輕量**: 相比 Redux，Zustand 更簡潔
- **TypeScript 友善**: 完善的類型支援
- **無 boilerplate**: 不需要 actions、reducers 等樣板程式碼
- **React 18 相容**: 支援 Concurrent Mode

### Alternatives Considered
| 方案 | 優點 | 缺點 | 被拒絕原因 |
|------|------|------|-----------|
| Redux Toolkit | 成熟、標準化 | boilerplate 較多 | 專案規模不需要 |
| Jotai | 原子化狀態 | 學習曲線 | Zustand 更直觀 |
| React Context | 內建、無需依賴 | 效能問題、重渲染 | 大量狀態時不適合 |
| Recoil | Facebook 出品 | 較新、穩定性考量 | 社群較小 |

### Store Design
```typescript
// scanStore.ts
interface ScanState {
  files: FileEntry[];
  isScanning: boolean;
  progress: { current: number; total: number };
  selectedFiles: Set<string>;
  viewMode: ViewMode;
  searchQuery: string;
  
  // Actions
  startScan: (path: string) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFileSelection: (path: string) => void;
  setSearchQuery: (query: string) => void;
}
```

---

## 6. UI 元件函式庫

### Decision
使用 shadcn/ui 作為 UI 元件函式庫。

### Rationale
- **無障礙支援**: 基於 Radix UI，內建 ARIA 支援
- **可客製化**: 元件程式碼直接複製到專案，完全可控
- **Tailwind CSS**: 與 Tailwind 完美整合
- **現代設計**: 美觀、專業的預設樣式

### Key Components Needed
- `Button` - 操作按鈕
- `Input` - 搜尋欄
- `Checkbox` - 檔案選擇
- `Dialog` - 確認對話框（刪除、複製目標）
- `Progress` - 進度列
- `Toast` - 通知訊息
- `Tree` / `Table` - 檔案顯示（可能需要自訂）
- `ScrollArea` - 大量檔案的虛擬滾動

### Installation
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input checkbox dialog progress toast scroll-area
```

---

## 7. GitHub Actions CI/CD

### Decision
使用 GitHub Actions 搭配 `tauri-apps/tauri-action` 進行跨平台自動建構。

### Rationale
- **免費**: 公開 repo 免費使用，私有 repo 有免費額度
- **跨平台**: 提供 Windows、macOS、Ubuntu 虛擬機
- **官方支援**: Tauri 官方維護的 Action
- **自動發布**: 可自動建立 Release 並上傳檔案

### Workflow Design
```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: 'macos-latest'
            args: '--target aarch64-apple-darwin'
          - platform: 'macos-latest'
            args: '--target x86_64-apple-darwin'
          - platform: 'ubuntu-22.04'
            args: ''
          - platform: 'windows-latest'
            args: ''

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Install Rust stable
        uses: dtolnay/rust-action@stable
        
      - name: Install dependencies (Ubuntu)
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
          
      - name: Install frontend dependencies
        run: npm ci
        
      - name: Build and release
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: v__VERSION__
          releaseName: 'HansFileScanner v__VERSION__'
          releaseBody: 'See the assets to download this version and install.'
          releaseDraft: true
          prerelease: false
          args: ${{ matrix.args }}
```

### Build Outputs
| 平台 | 產出檔案 | 說明 |
|------|---------|------|
| Windows | `.exe`, `.msi` | 可執行檔和安裝程式 |
| macOS (Intel) | `.dmg`, `.app` | Intel Mac 安裝映像 |
| macOS (Apple Silicon) | `.dmg`, `.app` | M1/M2/M3 Mac 安裝映像 |
| Linux | `.deb`, `.AppImage` | Debian 套件和通用執行檔 |

---

## 8. 搜尋實作方案

### Decision
使用前端記憶體內搜尋，配合 debounce 優化。

### Rationale
- **即時性**: 前端搜尋無需 IPC 延遲
- **簡單**: 已載入的資料直接過濾
- **效能足夠**: 10,000 檔案的字串比對在 JavaScript 中足夠快

### Implementation
```typescript
// useSearch.ts
const useSearch = (files: FileEntry[], query: string) => {
  return useMemo(() => {
    if (!query.trim()) return files;
    
    const lowerQuery = query.toLowerCase();
    return files.filter(file => 
      file.name.toLowerCase().includes(lowerQuery)
    );
  }, [files, query]);
};
```

### Optimization
- 使用 `useMemo` 避免不必要的重新計算
- 搜尋輸入使用 300ms debounce
- 大量結果時使用虛擬滾動

---

## 9. 檔案複製目標選擇

### Decision
使用 Tauri 的原生對話框 API 選擇目標資料夾。

### Rationale
- **原生體驗**: 使用系統原生的資料夾選擇對話框
- **跨平台**: Tauri 自動處理各平台差異
- **簡單可靠**: 無需自行實作檔案瀏覽器

### Implementation
```typescript
import { open } from '@tauri-apps/plugin-dialog';

async function selectTargetFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: '選擇目標資料夾',
  });
  return selected as string | null;
}
```

---

## 10. 進度回報機制

### Decision
使用 Tauri Events 進行掃描進度即時回報。

### Rationale
- **即時性**: Event 系統支援即時推送
- **非阻塞**: 前端可持續回應使用者操作
- **Tauri 原生**: 不需要額外的 WebSocket 設定

### Implementation Pattern
```rust
// Rust 後端發送事件
use tauri::Manager;

#[tauri::command]
async fn scan_folder(window: tauri::Window, path: String) -> Result<Vec<FileEntry>, String> {
    let total = count_files(&path);
    let mut current = 0;
    
    for entry in WalkDir::new(&path).into_iter().filter_map(|e| e.ok()) {
        current += 1;
        // 發送進度事件
        window.emit("scan-progress", Progress { current, total }).unwrap();
    }
    
    // 返回結果
    Ok(results)
}
```

```typescript
// 前端監聽事件
import { listen } from '@tauri-apps/api/event';

useEffect(() => {
  const unlisten = listen<Progress>('scan-progress', (event) => {
    setProgress(event.payload);
  });
  
  return () => { unlisten.then(fn => fn()); };
}, []);
```

---

## Summary

| 技術選擇 | 決定 | 關鍵理由 |
|---------|------|---------|
| 應用框架 | Tauri 2.x | 輕量、高效能、跨平台 |
| 前端框架 | React 18+ | 使用者指定、生態系豐富 |
| 狀態管理 | Zustand | 輕量、TypeScript 友善 |
| UI 元件 | shadcn/ui | 無障礙支援、可客製化 |
| 樣式方案 | Tailwind CSS | 與 shadcn/ui 整合 |
| 目錄遍歷 | walkdir (Rust) | 成熟、高效 |
| CI/CD | GitHub Actions | 免費、跨平台、官方支援 |
| 進度回報 | Tauri Events | 即時、原生支援 |
| 搜尋實作 | 前端記憶體內 | 即時、簡單 |
| 對話框 | Tauri Dialog API | 原生體驗 |

所有 NEEDS CLARIFICATION 項目已解決，可進入 Phase 1 設計階段。
