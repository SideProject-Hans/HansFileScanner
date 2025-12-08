# Data Model: 跨平台檔案掃描工具

**Date**: 2025-12-08 | **Phase**: 1 - Design | **Spec**: [spec.md](./spec.md)

---

## 核心實體 (Entities)

### 1. FileEntry（檔案條目）

掃描結果中的每個檔案/資料夾的基本資訊。

```typescript
interface FileEntry {
  /** 檔案完整路徑 (作為唯一識別碼) */
  path: string;
  
  /** 檔案名稱 (含副檔名) */
  name: string;
  
  /** 是否為資料夾 */
  isDirectory: boolean;
  
  /** 檔案大小 (bytes)，資料夾為 0 */
  size: number;
  
  /** 最後修改時間 (ISO 8601 格式) */
  modifiedAt: string;
  
  /** 檔案類型分類 */
  category: FileCategory;
  
  /** 副檔名 (小寫，不含點號)，資料夾為空字串 */
  extension: string;
  
  /** 相對於掃描根目錄的深度 (根目錄 = 0) */
  depth: number;
  
  /** 父資料夾路徑 */
  parentPath: string;
}
```

**Rust 對應結構**:
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub path: String,
    pub name: String,
    pub is_directory: bool,
    pub size: u64,
    pub modified_at: String,
    pub category: FileCategory,
    pub extension: String,
    pub depth: u32,
    pub parent_path: String,
}
```

**驗證規則**:
- `path`: 必須為有效的檔案系統路徑
- `name`: 不可為空
- `size`: >= 0
- `depth`: >= 0

---

### 2. FileCategory（檔案類型）

檔案的分類類型，用於不同顯示模式的過濾。

```typescript
enum FileCategory {
  Document = 'document',   // 文件：PDF、Word、Excel、PPT、TXT 等
  Image = 'image',         // 圖檔：JPG、PNG、GIF、SVG 等
  Video = 'video',         // 影片：MP4、AVI、MKV、MOV 等
  Audio = 'audio',         // 音訊：MP3、WAV、FLAC、AAC 等
  Folder = 'folder',       // 資料夾
  Other = 'other',         // 其他未分類檔案
}
```

**Rust 對應結構**:
```rust
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum FileCategory {
    Document,
    Image,
    Video,
    Audio,
    Folder,
    Other,
}
```

**副檔名映射**:
| 類別 | 支援的副檔名 |
|------|-------------|
| Document | pdf, doc, docx, txt, xls, xlsx, ppt, pptx, odt, ods, odp, rtf, csv |
| Image | jpg, jpeg, png, gif, bmp, svg, webp, ico, tiff, raw |
| Video | mp4, avi, mkv, mov, wmv, flv, webm, m4v, mpeg |
| Audio | mp3, wav, flac, aac, ogg, m4a, wma, aiff |
| Folder | (目錄本身) |
| Other | 所有其他副檔名 |

---

### 3. ScanResult（掃描結果）

一次掃描操作的完整結果。

```typescript
interface ScanResult {
  /** 掃描的根目錄路徑 */
  rootPath: string;
  
  /** 所有掃描到的檔案條目 */
  entries: FileEntry[];
  
  /** 掃描統計資訊 */
  stats: ScanStats;
  
  /** 掃描失敗的檔案列表 (鎖定或無權限) */
  failedPaths: FailedEntry[];
  
  /** 掃描完成時間 */
  completedAt: string;
  
  /** 掃描耗時 (毫秒) */
  durationMs: number;
}
```

**Rust 對應結構**:
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub root_path: String,
    pub entries: Vec<FileEntry>,
    pub stats: ScanStats,
    pub failed_paths: Vec<FailedEntry>,
    pub completed_at: String,
    pub duration_ms: u64,
}
```

---

### 4. ScanStats（掃描統計）

掃描結果的彙總統計資訊。

```typescript
interface ScanStats {
  /** 總檔案數 (不含資料夾) */
  totalFiles: number;
  
  /** 總資料夾數 */
  totalFolders: number;
  
  /** 總大小 (bytes) */
  totalSize: number;
  
  /** 各類型檔案數量統計 */
  categoryCounts: Record<FileCategory, number>;
}
```

**Rust 對應結構**:
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanStats {
    pub total_files: u64,
    pub total_folders: u64,
    pub total_size: u64,
    pub category_counts: HashMap<FileCategory, u64>,
}
```

---

### 5. FailedEntry（失敗條目）

掃描過程中無法處理的檔案記錄。

```typescript
interface FailedEntry {
  /** 檔案路徑 */
  path: string;
  
  /** 失敗原因 */
  reason: FailureReason;
  
  /** 錯誤訊息 */
  errorMessage: string;
}

enum FailureReason {
  PermissionDenied = 'permission_denied',   // 存取權限不足
  FileLocked = 'file_locked',               // 檔案被鎖定
  PathNotFound = 'path_not_found',          // 路徑不存在
  Unknown = 'unknown',                       // 未知錯誤
}
```

**Rust 對應結構**:
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailedEntry {
    pub path: String,
    pub reason: FailureReason,
    pub error_message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FailureReason {
    PermissionDenied,
    FileLocked,
    PathNotFound,
    Unknown,
}
```

---

### 6. ScanProgress（掃描進度）

掃描過程中的進度資訊，用於即時更新 UI。

```typescript
interface ScanProgress {
  /** 目前已處理的檔案數 */
  current: number;
  
  /** 預估總檔案數 (可能動態更新) */
  total: number;
  
  /** 目前正在處理的檔案路徑 */
  currentPath: string;
  
  /** 掃描狀態 */
  status: ScanStatus;
}

enum ScanStatus {
  Idle = 'idle',           // 閒置
  Scanning = 'scanning',   // 掃描中
  Completed = 'completed', // 已完成
  Error = 'error',         // 發生錯誤
}
```

**Rust 對應結構**:
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanProgress {
    pub current: u64,
    pub total: u64,
    pub current_path: String,
    pub status: ScanStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ScanStatus {
    Idle,
    Scanning,
    Completed,
    Error,
}
```

---

## UI 狀態實體

### 7. ViewMode（顯示模式）

使用者選擇的檔案顯示模式。

```typescript
enum ViewMode {
  Tree = 'tree',           // 樹結構視圖
  Documents = 'documents', // 文件清單
  Images = 'images',       // 圖檔清單
  Videos = 'videos',       // 影片清單
  Audio = 'audio',         // 音訊清單
}
```

**模式與類型映射**:
| 模式 | 顯示的 FileCategory |
|------|-------------------|
| Tree | 全部（階層結構） |
| Documents | Document |
| Images | Image |
| Videos | Video |
| Audio | Audio |

---

### 8. FileSelection（檔案選擇狀態）

使用者選擇的檔案集合，用於批量操作。

```typescript
interface FileSelection {
  /** 已選擇的檔案路徑集合 */
  selectedPaths: Set<string>;
  
  /** 最後選擇的檔案路徑 (用於 Shift 連選) */
  lastSelectedPath: string | null;
}
```

---

### 9. FileOperation（檔案操作）

檔案操作請求和結果。

```typescript
interface FileOperationRequest {
  /** 操作類型 */
  operation: OperationType;
  
  /** 要操作的檔案路徑列表 */
  sourcePaths: string[];
  
  /** 目標路徑 (僅複製操作需要) */
  targetPath?: string;
}

enum OperationType {
  Delete = 'delete',
  Copy = 'copy',
}

interface FileOperationResult {
  /** 操作是否成功 */
  success: boolean;
  
  /** 成功處理的檔案數 */
  successCount: number;
  
  /** 失敗的檔案列表 */
  failedFiles: FailedEntry[];
  
  /** 操作摘要訊息 */
  message: string;
}
```

**Rust 對應結構**:
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileOperationRequest {
    pub operation: OperationType,
    pub source_paths: Vec<String>,
    pub target_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OperationType {
    Delete,
    Copy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileOperationResult {
    pub success: bool,
    pub success_count: u64,
    pub failed_files: Vec<FailedEntry>,
    pub message: String,
}
```

---

## 狀態管理 Store

### AppState（應用程式狀態）

前端 Zustand store 的完整狀態結構。

```typescript
interface AppState {
  // === 掃描相關 ===
  scanResult: ScanResult | null;
  scanProgress: ScanProgress;
  isScanning: boolean;
  
  // === UI 狀態 ===
  viewMode: ViewMode;
  searchQuery: string;
  
  // === 選擇狀態 ===
  selectedPaths: Set<string>;
  
  // === 操作狀態 ===
  isOperating: boolean;
  operationProgress: number;
  
  // === Actions ===
  startScan: (path: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  toggleSelection: (path: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteSelected: () => Promise<FileOperationResult>;
  copySelected: (targetPath: string) => Promise<FileOperationResult>;
}
```

---

## 關聯圖

```
┌─────────────────────────────────────────────────────────────────┐
│                        ScanResult                                │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   rootPath    │  │    stats     │  │   failedPaths[]    │   │
│  └───────────────┘  └──────────────┘  └────────────────────┘   │
│          │                │                     │               │
│          │                ▼                     ▼               │
│          │         ┌──────────────┐    ┌────────────────┐      │
│          │         │  ScanStats   │    │  FailedEntry   │      │
│          │         │ totalFiles   │    │  path          │      │
│          │         │ totalFolders │    │  reason        │      │
│          │         │ totalSize    │    │  errorMessage  │      │
│          │         │ categoryCnts │    └────────────────┘      │
│          │         └──────────────┘                             │
│          │                                                      │
│          ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    entries[]                             │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │                   FileEntry                         │ │   │
│  │  │  path | name | isDirectory | size | modifiedAt     │ │   │
│  │  │  category | extension | depth | parentPath         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      UI State (Zustand)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │   ViewMode   │  │ searchQuery  │  │    selectedPaths      │ │
│  │  (enum)      │  │  (string)    │  │    (Set<string>)      │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    ScanProgress                             │ │
│  │  current | total | currentPath | status                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     File Operations                              │
│  ┌────────────────────────┐    ┌─────────────────────────────┐ │
│  │ FileOperationRequest   │ -> │   FileOperationResult       │ │
│  │ operation | sources    │    │ success | successCount      │ │
│  │ targetPath (optional)  │    │ failedFiles | message       │ │
│  └────────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 資料流

### 掃描流程
```
User clicks "瀏覽" 
    → Native folder picker (Tauri Dialog)
    → User selects folder
    → invoke('scan_folder', { path })
    → Rust: walkdir traversal
    → emit('scan-progress', progress) × N
    → return ScanResult
    → Update Zustand store
    → UI re-renders with file list
```

### 搜尋流程
```
User types in search bar
    → debounce 300ms
    → Update searchQuery in store
    → useMemo filters entries
    → UI re-renders filtered list
```

### 檔案操作流程
```
User selects files (checkbox)
    → Update selectedPaths in store
    → User clicks "刪除" or "複製"
    → (Copy only) Show folder picker
    → invoke('delete_files' | 'copy_files', { paths, target? })
    → Rust: perform operation
    → return FileOperationResult
    → Show toast notification
    → (Delete) Re-scan or update entries
    → Clear selection
```

---

## 驗證規則摘要

| 實體 | 欄位 | 驗證規則 |
|------|------|---------|
| FileEntry | path | 必填、有效路徑 |
| FileEntry | name | 必填、非空 |
| FileEntry | size | >= 0 |
| FileEntry | depth | >= 0 |
| FileOperationRequest | sourcePaths | 非空陣列 |
| FileOperationRequest | targetPath | 複製操作必填、與 sourcePaths 不同 |
| ScanProgress | current | <= total |
