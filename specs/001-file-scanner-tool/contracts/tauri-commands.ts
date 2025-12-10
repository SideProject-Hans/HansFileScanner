# Tauri IPC Commands Contract

**Date**: 2025-12-08 | **Phase**: 1 - Design | **Spec**: [spec.md](../spec.md)

---

## Overview

本文件定義 Tauri 應用程式中前端 (React) 與後端 (Rust) 之間的 IPC 通訊介面。
所有命令透過 `@tauri-apps/api/core` 的 `invoke` 函式呼叫。

---

## 命令定義

### 1. scan_folder - 掃描資料夾

掃描指定資料夾並回傳所有檔案/資料夾的詳細資訊。

**Command Name**: `scan_folder`

**Request**:
```typescript
interface ScanFolderRequest {
  /** 要掃描的資料夾完整路徑 */
  path: string;
}
```

**Response**:
```typescript
interface ScanFolderResponse {
  /** 掃描結果 */
  result: ScanResult;
}
```

**Rust Command Signature**:
```rust
#[tauri::command]
async fn scan_folder(path: String) -> Result<ScanResult, String>
```

**錯誤情況**:
| 錯誤碼 | 說明 |
|-------|------|
| `PATH_NOT_FOUND` | 指定路徑不存在 |
| `NOT_A_DIRECTORY` | 指定路徑不是資料夾 |
| `PERMISSION_DENIED` | 沒有權限存取該資料夾 |

**Frontend Usage**:
```typescript
import { invoke } from '@tauri-apps/api/core';
import type { ScanResult } from './types';

async function scanFolder(path: string): Promise<ScanResult> {
  return await invoke<ScanResult>('scan_folder', { path });
}
```

---

### 2. delete_files - 刪除檔案

刪除指定的多個檔案（移至資源回收筒）。

**Command Name**: `delete_files`

**Request**:
```typescript
interface DeleteFilesRequest {
  /** 要刪除的檔案路徑陣列 */
  paths: string[];
}
```

**Response**:
```typescript
interface DeleteFilesResponse {
  /** 操作結果 */
  result: FileOperationResult;
}
```

**Rust Command Signature**:
```rust
#[tauri::command]
async fn delete_files(paths: Vec<String>) -> Result<FileOperationResult, String>
```

**錯誤情況**:
| 錯誤碼 | 說明 |
|-------|------|
| `FILE_NOT_FOUND` | 指定檔案不存在 |
| `PERMISSION_DENIED` | 沒有權限刪除該檔案 |
| `FILE_IN_USE` | 檔案被其他程式使用中 |

**Frontend Usage**:
```typescript
import { invoke } from '@tauri-apps/api/core';
import type { FileOperationResult } from './types';

async function deleteFiles(paths: string[]): Promise<FileOperationResult> {
  return await invoke<FileOperationResult>('delete_files', { paths });
}
```

---

### 3. copy_files - 複製檔案

複製指定的多個檔案到目標資料夾。

**Command Name**: `copy_files`

**Request**:
```typescript
interface CopyFilesRequest {
  /** 要複製的檔案路徑陣列 */
  sourcePaths: string[];
  /** 目標資料夾路徑 */
  targetFolder: string;
}
```

**Response**:
```typescript
interface CopyFilesResponse {
  /** 操作結果 */
  result: FileOperationResult;
}
```

**Rust Command Signature**:
```rust
#[tauri::command]
async fn copy_files(
    source_paths: Vec<String>, 
    target_folder: String
) -> Result<FileOperationResult, String>
```

**錯誤情況**:
| 錯誤碼 | 說明 |
|-------|------|
| `SOURCE_NOT_FOUND` | 來源檔案不存在 |
| `TARGET_NOT_FOUND` | 目標資料夾不存在 |
| `SAME_FOLDER` | 來源與目標為同一資料夾 |
| `FILE_EXISTS` | 目標資料夾已存在同名檔案 |
| `PERMISSION_DENIED` | 沒有權限複製到目標資料夾 |
| `INSUFFICIENT_SPACE` | 目標磁碟空間不足 |

**Frontend Usage**:
```typescript
import { invoke } from '@tauri-apps/api/core';
import type { FileOperationResult } from './types';

async function copyFiles(
  sourcePaths: string[], 
  targetFolder: string
): Promise<FileOperationResult> {
  return await invoke<FileOperationResult>('copy_files', { 
    sourcePaths, 
    targetFolder 
  });
}
```

---

### 4. select_folder - 選擇資料夾 (Dialog)

開啟系統資料夾選擇對話框。

**Command Name**: 使用 `@tauri-apps/plugin-dialog`

**Frontend Usage**:
```typescript
import { open } from '@tauri-apps/plugin-dialog';

async function selectFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: '選擇要掃描的資料夾',
  });
  return selected as string | null;
}
```

---

## 共用型別定義

### ScanResult

```typescript
interface ScanResult {
  /** 掃描的根目錄路徑 */
  rootPath: string;
  
  /** 所有檔案條目 */
  entries: FileEntry[];
  
  /** 統計資訊 */
  stats: ScanStats;
  
  /** 無法存取的檔案清單 */
  failedEntries: FailedEntry[];
  
  /** 掃描耗時 (毫秒) */
  durationMs: number;
}
```

### FileEntry

```typescript
interface FileEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: string;
  category: FileCategory;
  extension: string;
  depth: number;
  parentPath: string;
}
```

### FileCategory

```typescript
enum FileCategory {
  Document = 'document',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Folder = 'folder',
  Other = 'other',
}
```

### ScanStats

```typescript
interface ScanStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  documentCount: number;
  imageCount: number;
  videoCount: number;
  audioCount: number;
  otherCount: number;
}
```

### FailedEntry

```typescript
interface FailedEntry {
  path: string;
  reason: string;
}
```

### FileOperationResult

```typescript
interface FileOperationResult {
  /** 操作類型 */
  operation: 'delete' | 'copy';
  
  /** 成功的檔案數量 */
  successCount: number;
  
  /** 失敗的檔案數量 */
  failedCount: number;
  
  /** 失敗的檔案詳情 */
  failedFiles: FailedEntry[];
  
  /** 操作耗時 (毫秒) */
  durationMs: number;
}
```

---

## 進度回報事件

### scan_progress - 掃描進度

使用 Tauri 的事件系統回報掃描進度。

**Event Name**: `scan_progress`

**Payload**:
```typescript
interface ScanProgressPayload {
  /** 已掃描的檔案數量 */
  scannedCount: number;
  
  /** 目前正在掃描的路徑 */
  currentPath: string;
  
  /** 預估進度 (0-100)，如果可以計算 */
  estimatedProgress?: number;
}
```

**Rust Emit**:
```rust
app_handle.emit("scan_progress", ScanProgressPayload {
    scanned_count: 100,
    current_path: "/Users/user/Documents/file.txt".to_string(),
    estimated_progress: None,
});
```

**Frontend Listen**:
```typescript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen<ScanProgressPayload>('scan_progress', (event) => {
  console.log(`已掃描 ${event.payload.scannedCount} 個檔案`);
  console.log(`目前路徑: ${event.payload.currentPath}`);
});

// 清理監聽器
unlisten();
```

---

## 權限設定

需要在 `src-tauri/capabilities/default.json` 設定以下權限：

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

## API 版本

| 版本 | 日期 | 變更說明 |
|-----|------|---------|
| 1.0.0 | 2025-12-08 | 初始版本 |
