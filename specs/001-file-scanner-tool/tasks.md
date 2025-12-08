# Tasks: 跨平台檔案掃描工具

**Input**: Design documents from `/specs/001-file-scanner-tool/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: 根據 Constitution Principle II (Test-Driven Development)，測試為必要項目，必須在實作前撰寫。採用 TDD 紅-綠-重構流程。

**Organization**: 任務依 User Story 分組，以便獨立實作與測試每個 Story。

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 可平行執行（不同檔案、無相依性）
- **[Story]**: 任務所屬的 User Story (US1, US2, US3, US4)
- 描述中包含完整檔案路徑

## Path Conventions

- **Rust 後端**: `src-tauri/src/`
- **React 前端**: `src/`
- **前端測試**: `tests/`
- **Rust 測試**: `src-tauri/src/` 內的 `#[cfg(test)]` 模組

---

## Phase 1: Setup (專案初始化)

**Purpose**: 建立 Tauri 2.x + React 專案基礎架構

- [ ] T001 使用 `pnpm create tauri-app` 建立 Tauri 2.x + React + TypeScript 專案
- [ ] T002 安裝前端相依套件：zustand, lucide-react, tailwindcss, @radix-ui/react-* 等
- [ ] T003 安裝 shadcn/ui 並初始化：`pnpm dlx shadcn@latest init`
- [ ] T004 [P] 安裝 Tauri plugins: `pnpm tauri add dialog` 和 `pnpm tauri add fs`
- [ ] T005 [P] 新增 Rust 相依套件至 `src-tauri/Cargo.toml`: walkdir, chrono, trash, serde, serde_json
- [ ] T006 [P] 設定 Tailwind CSS：建立 `tailwind.config.js` 和 `postcss.config.js`
- [ ] T007 [P] 設定 TypeScript 路徑別名：更新 `tsconfig.json` 和 `vite.config.ts` 中的 `@/*` 路徑
- [ ] T008 [P] 設定 ESLint + Prettier 前端程式碼品質工具 (Constitution I: Code Quality Standards)
- [ ] T009 [P] 設定 rustfmt + clippy Rust 程式碼品質工具 (Constitution I: Code Quality Standards)
- [ ] T010 [P] 設定 Vitest + React Testing Library 前端測試框架 (Constitution II: TDD mandatory)
- [ ] T011 [P] 設定 cargo-tarpaulin Rust 測試覆蓋率工具 (Constitution II: TDD mandatory)
- [ ] T012 設定 Tauri 權限：更新 `src-tauri/capabilities/default.json` 加入 dialog 和 fs 權限

---

## Phase 2: Foundational (基礎架構)

**Purpose**: 建立所有 User Story 都需要的核心基礎設施

**⚠️ CRITICAL**: 此階段必須完成後才能開始任何 User Story 工作

### Rust 後端基礎架構

- [ ] T013 建立 Rust 模組結構：`src-tauri/src/lib.rs` 匯出 commands, models, scanner 模組
- [ ] T014 [P] 建立 FileCategory 列舉型別於 `src-tauri/src/models/file_category.rs`
- [ ] T015 [P] 建立 FileEntry 資料結構於 `src-tauri/src/models/file_entry.rs`
- [ ] T016 [P] 建立 ScanStats 資料結構於 `src-tauri/src/models/scan_stats.rs`
- [ ] T017 [P] 建立 FailedEntry 和 FailureReason 資料結構於 `src-tauri/src/models/failed_entry.rs`
- [ ] T018 [P] 建立 ScanResult 資料結構於 `src-tauri/src/models/scan_result.rs`
- [ ] T019 [P] 建立 ScanProgress 和 ScanStatus 資料結構於 `src-tauri/src/models/scan_progress.rs`
- [ ] T020 [P] 建立 FileOperationResult 和 OperationType 資料結構於 `src-tauri/src/models/file_operation.rs`
- [ ] T021 建立 models 模組彙整檔 `src-tauri/src/models/mod.rs`
- [ ] T022 實作副檔名分類函式 `classify_extension()` 於 `src-tauri/src/scanner/file_category.rs`
- [ ] T023 更新 `src-tauri/src/main.rs` 註冊所有 Tauri commands

### React 前端基礎架構

- [ ] T024 [P] 建立 TypeScript 型別定義於 `src/types/file.ts`（FileEntry, FileCategory, ScanStats 等）
- [ ] T025 [P] 建立 TypeScript 型別定義於 `src/types/scan.ts`（ScanResult, ScanProgress 等）
- [ ] T026 [P] 建立 Tauri API 封裝於 `src/lib/tauri.ts`（invoke wrapper, event listeners）
- [ ] T027 [P] 建立通用工具函式於 `src/lib/utils.ts`（cn(), formatFileSize(), formatDate()）
- [ ] T028 [P] 建立檔案相關工具函式於 `src/lib/file-utils.ts`（getFileIcon(), getCategoryColor()）
- [ ] T029 建立主版面配置元件 `src/components/layout/MainLayout.tsx`
- [ ] T030 安裝並設定 shadcn/ui 基礎元件：Button, Input, Checkbox, Dialog, Progress, Toast, ScrollArea 於 `src/components/ui/`
- [ ] T031 設定 Toast 通知系統於 `src/App.tsx`
- [ ] T032 [P] 設定 GitHub Actions CI 管線：`.github/workflows/ci.yml` 執行測試和品質檢查 (Constitution II & IV)

**Checkpoint**: 基礎架構完成 - 可開始實作 User Stories

---

## Phase 3: User Story 1 - 掃描資料夾並顯示檔案資訊 (Priority: P1) 🎯 MVP

**Goal**: 使用者可選擇資料夾、掃描所有檔案（含子資料夾）、查看檔案路徑/大小/修改時間

**Independent Test**: 選擇任一資料夾 → 點擊掃描 → 顯示檔案清單（含進度條）

### Tests for User Story 1 (MANDATORY - Constitution II: TDD) ⚠️

> **CRITICAL: 先撰寫測試、確保測試失敗、再實作 (Red-Green-Refactor)**

- [ ] T033 [P] [US1] Rust 單元測試：`classify_extension()` 於 `src-tauri/src/scanner/file_category.rs` 的 `#[cfg(test)]` 模組
- [ ] T034 [P] [US1] Rust 單元測試：`FileEntry::from_path()` 於 `src-tauri/src/models/file_entry.rs` 的 `#[cfg(test)]` 模組
- [ ] T035 [P] [US1] Rust 單元測試：目錄遍歷 `scan_directory()` 於 `src-tauri/src/scanner/walker.rs` 的 `#[cfg(test)]` 模組
- [ ] T036 [P] [US1] Rust 整合測試：`scan_folder` command 於 `src-tauri/src/commands/scan.rs` 的 `#[cfg(test)]` 模組
- [ ] T037 [P] [US1] 前端元件測試：FolderSelector 於 `tests/components/FolderSelector.test.tsx`
- [ ] T038 [P] [US1] 前端元件測試：ProgressBar 於 `tests/components/ProgressBar.test.tsx`
- [ ] T039 [P] [US1] 前端元件測試：FileTable 於 `tests/components/FileTable.test.tsx`
- [ ] T040 [P] [US1] 前端 Hook 測試：useScanner 於 `tests/hooks/useScanner.test.ts`
- [ ] T041 [P] [US1] 前端 Store 測試：scanStore 於 `tests/stores/scanStore.test.ts`

### Implementation for User Story 1

#### Rust 後端實作

- [ ] T042 [US1] 實作目錄遍歷核心邏輯於 `src-tauri/src/scanner/walker.rs`：使用 walkdir 遍歷、收集 FileEntry
- [ ] T043 [US1] 實作 FileEntry::from_path() 方法於 `src-tauri/src/models/file_entry.rs`：從檔案系統讀取 metadata
- [ ] T044 [US1] 實作 `scan_folder` Tauri command 於 `src-tauri/src/commands/scan.rs`：整合 walker, 計算 stats, 處理錯誤
- [ ] T045 [US1] 實作掃描進度事件發送於 `src-tauri/src/commands/scan.rs`：使用 `window.emit("scan_progress", ...)`
- [ ] T046 [US1] 建立 scanner 模組彙整檔 `src-tauri/src/scanner/mod.rs`
- [ ] T047 [US1] 建立 commands 模組彙整檔 `src-tauri/src/commands/mod.rs`

#### React 前端實作

- [ ] T048 [P] [US1] 建立掃描狀態 Store 於 `src/stores/scanStore.ts`：Zustand store 管理掃描結果、進度、狀態
- [ ] T049 [US1] 建立 useScanner Hook 於 `src/hooks/useScanner.ts`：封裝掃描邏輯、進度監聽、錯誤處理
- [ ] T050 [P] [US1] 建立 FolderSelector 元件於 `src/components/scanner/FolderSelector.tsx`：資料夾選擇按鈕 + 顯示路徑
- [ ] T051 [P] [US1] 建立 ScanButton 元件於 `src/components/scanner/ScanButton.tsx`：掃描/停止按鈕
- [ ] T052 [P] [US1] 建立 ProgressBar 元件於 `src/components/scanner/ProgressBar.tsx`：進度條 + 目前掃描路徑
- [ ] T053 [P] [US1] 建立 FileTable 元件於 `src/components/file-list/FileTable.tsx`：表格顯示檔案清單（路徑、大小、修改時間）
- [ ] T054 [P] [US1] 建立 FileItem 元件於 `src/components/file-list/FileItem.tsx`：單一檔案列項目
- [ ] T055 [US1] 整合所有元件於 `src/App.tsx`：MainLayout + FolderSelector + ScanButton + ProgressBar + FileTable

### Validation for User Story 1

- [ ] T056 [US1] 驗證 Rust 測試覆蓋率 ≥ 80%：執行 `cargo tarpaulin` (Constitution II)
- [ ] T057 [US1] 驗證前端測試覆蓋率 ≥ 80%：執行 `pnpm test:coverage` (Constitution II)
- [ ] T058 [US1] 執行效能測試：掃描 1000 個檔案應 < 10 秒 (Constitution IV)
- [ ] T059 [US1] 執行 Rust clippy 檢查：`cargo clippy` (Constitution I)
- [ ] T060 [US1] 執行 ESLint 檢查：`pnpm lint` (Constitution I)

**Checkpoint**: User Story 1 完成 - 使用者可選擇資料夾並掃描顯示檔案清單 (MVP 可交付)

---

## Phase 4: User Story 2 - 以不同模式檢視檔案並搜尋 (Priority: P2)

**Goal**: 使用者可切換顯示模式（樹結構/文檔/圖檔/影片/音訊）、篩選檔案類型、搜尋檔案名稱

**Independent Test**: 掃描完成後 → 切換顯示模式 → 選擇檔案類型篩選 → 輸入搜尋關鍵字 → 驗證結果正確

### Tests for User Story 2 (MANDATORY - Constitution II: TDD) ⚠️

- [ ] T061 [P] [US2] 前端元件測試：ViewModeSelector 於 `tests/components/ViewModeSelector.test.tsx`
- [ ] T062 [P] [US2] 前端元件測試：TypeFilter 於 `tests/components/TypeFilter.test.tsx`
- [ ] T063 [P] [US2] 前端元件測試：SearchBox 於 `tests/components/SearchBox.test.tsx`
- [ ] T064 [P] [US2] 前端元件測試：FileTree 於 `tests/components/FileTree.test.tsx`
- [ ] T065 [P] [US2] 前端 Store 測試：filterStore 於 `tests/stores/filterStore.test.ts`
- [ ] T066 [P] [US2] 前端 Hook 測試：useFileFilter 於 `tests/hooks/useFileFilter.test.ts`

### Implementation for User Story 2

- [ ] T067 [P] [US2] 建立 ViewMode 型別於 `src/types/file.ts`：Tree, Documents, Images, Videos, Audio
- [ ] T068 [P] [US2] 建立篩選狀態 Store 於 `src/stores/filterStore.ts`：viewMode, searchQuery, selectedExtensions
- [ ] T069 [US2] 建立 useFileFilter Hook 於 `src/hooks/useFileFilter.ts`：結合 viewMode + extensions + search 的篩選邏輯
- [ ] T070 [P] [US2] 建立 ViewModeSelector 元件於 `src/components/filters/ViewModeSelector.tsx`：5 種模式切換按鈕
- [ ] T071 [P] [US2] 建立 TypeFilter 元件於 `src/components/filters/TypeFilter.tsx`：副檔名下拉選單（依模式動態顯示）
- [ ] T072 [P] [US2] 建立 SearchBox 元件於 `src/components/filters/SearchBox.tsx`：搜尋框 + 清除按鈕 + 300ms debounce
- [ ] T073 [US2] 建立 FileTree 元件於 `src/components/file-list/FileTree.tsx`：樹狀結構顯示（可展開/收合資料夾）
- [ ] T074 [US2] 更新 FileTable 元件：整合 useFileFilter 篩選結果
- [ ] T075 [US2] 整合篩選元件於 `src/App.tsx`：ViewModeSelector + TypeFilter + SearchBox

### Validation for User Story 2

- [ ] T076 [US2] 驗證前端測試覆蓋率 ≥ 80%：執行 `pnpm test:coverage` (Constitution II)
- [ ] T077 [US2] 驗證搜尋即時性：輸入後 300ms 內顯示結果 (Constitution IV)

**Checkpoint**: User Story 2 完成 - 使用者可切換模式、篩選類型、搜尋檔案

---

## Phase 5: User Story 3 - 選擇並刪除檔案 (Priority: P3)

**Goal**: 使用者可勾選檔案、全選/取消全選、刪除選中檔案（移至資源回收筒）

**Independent Test**: 勾選多個檔案 → 點擊刪除 → 確認對話框 → 驗證檔案已刪除並顯示結果

### Tests for User Story 3 (MANDATORY - Constitution II: TDD) ⚠️

- [ ] T078 [P] [US3] Rust 單元測試：`delete_files` command 於 `src-tauri/src/commands/file_ops.rs` 的 `#[cfg(test)]` 模組
- [ ] T079 [P] [US3] 前端元件測試：FileCheckbox 於 `tests/components/FileCheckbox.test.tsx`
- [ ] T080 [P] [US3] 前端元件測試：DeleteButton 於 `tests/components/DeleteButton.test.tsx`
- [ ] T081 [P] [US3] 前端元件測試：ConfirmDialog 於 `tests/components/ConfirmDialog.test.tsx`
- [ ] T082 [P] [US3] 前端 Store 測試：selectionStore 於 `tests/stores/selectionStore.test.ts`
- [ ] T083 [P] [US3] 前端 Hook 測試：useFileSelection 於 `tests/hooks/useFileSelection.test.ts`
- [ ] T084 [P] [US3] 前端 Hook 測試：useFileOperations 於 `tests/hooks/useFileOperations.test.ts`

### Implementation for User Story 3

#### Rust 後端實作

- [ ] T085 [US3] 實作 `delete_files` Tauri command 於 `src-tauri/src/commands/file_ops.rs`：使用 trash crate 移至資源回收筒

#### React 前端實作

- [ ] T086 [P] [US3] 建立選擇狀態 Store 於 `src/stores/selectionStore.ts`：selectedPaths Set, selectAll, clearSelection
- [ ] T087 [US3] 建立 useFileSelection Hook 於 `src/hooks/useFileSelection.ts`：toggle, selectAll, shift-click 連選邏輯
- [ ] T088 [US3] 建立 useFileOperations Hook 於 `src/hooks/useFileOperations.ts`：deleteSelected, copySelected
- [ ] T089 [P] [US3] 建立 FileCheckbox 元件於 `src/components/file-list/FileCheckbox.tsx`：單一檔案勾選框
- [ ] T090 [P] [US3] 建立 SelectAllCheckbox 元件於 `src/components/file-list/SelectAllCheckbox.tsx`：全選/取消全選
- [ ] T091 [P] [US3] 建立 DeleteButton 元件於 `src/components/operations/DeleteButton.tsx`：刪除按鈕（disabled when no selection）
- [ ] T092 [US3] 建立 ConfirmDialog 元件於 `src/components/operations/ConfirmDialog.tsx`：確認刪除對話框
- [ ] T093 [US3] 更新 FileItem/FileTable 整合 FileCheckbox
- [ ] T094 [US3] 整合刪除功能於 `src/App.tsx`：SelectAllCheckbox + DeleteButton + ConfirmDialog + Toast 通知

### Validation for User Story 3

- [ ] T095 [US3] 驗證 Rust 測試覆蓋率 ≥ 80%：執行 `cargo tarpaulin` (Constitution II)
- [ ] T096 [US3] 驗證前端測試覆蓋率 ≥ 80%：執行 `pnpm test:coverage` (Constitution II)
- [ ] T097 [US3] 驗證刪除操作正確處理鎖定檔案：顯示錯誤訊息並繼續處理其他檔案

**Checkpoint**: User Story 3 完成 - 使用者可選擇並刪除檔案

---

## Phase 6: User Story 4 - 選擇並複製檔案 (Priority: P4)

**Goal**: 使用者可選擇檔案並複製到指定資料夾，處理同名檔案衝突

**Independent Test**: 勾選檔案 → 點擊複製 → 選擇目標資料夾 → 驗證檔案已複製

### Tests for User Story 4 (MANDATORY - Constitution II: TDD) ⚠️

- [ ] T098 [P] [US4] Rust 單元測試：`copy_files` command 於 `src-tauri/src/commands/file_ops.rs` 的 `#[cfg(test)]` 模組
- [ ] T099 [P] [US4] 前端元件測試：CopyButton 於 `tests/components/CopyButton.test.tsx`
- [ ] T100 [P] [US4] 前端元件測試：ConflictDialog 於 `tests/components/ConflictDialog.test.tsx`

### Implementation for User Story 4

#### Rust 後端實作

- [ ] T101 [US4] 實作 `copy_files` Tauri command 於 `src-tauri/src/commands/file_ops.rs`：std::fs::copy, 處理同名衝突

#### React 前端實作

- [ ] T102 [P] [US4] 建立 CopyButton 元件於 `src/components/operations/CopyButton.tsx`：複製按鈕 + 目標資料夾選擇
- [ ] T103 [US4] 建立 ConflictDialog 元件於 `src/components/operations/ConflictDialog.tsx`：同名檔案處理選項（覆蓋/跳過/重新命名）
- [ ] T104 [US4] 更新 useFileOperations Hook 加入 copySelected 邏輯
- [ ] T105 [US4] 整合複製功能於 `src/App.tsx`：CopyButton + ConflictDialog + Toast 通知

### Validation for User Story 4

- [ ] T106 [US4] 驗證 Rust 測試覆蓋率 ≥ 80%：執行 `cargo tarpaulin` (Constitution II)
- [ ] T107 [US4] 驗證前端測試覆蓋率 ≥ 80%：執行 `pnpm test:coverage` (Constitution II)
- [ ] T108 [US4] 驗證來源與目標同資料夾時顯示錯誤

**Checkpoint**: User Story 4 完成 - 使用者可選擇並複製檔案

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨 User Story 的改進與最終打磨

- [ ] T109 [P] 設定 GitHub Actions 多平台建構：`.github/workflows/release.yml` (Windows, macOS Intel, macOS ARM)
- [ ] T110 [P] 更新 README.md 文件：功能說明、截圖、安裝指南
- [ ] T111 [P] 建立 CHANGELOG.md 追蹤版本變更
- [ ] T112 [P] 執行無障礙存取檢查：確保 WCAG 2.1 AA 合規 (Constitution III)
- [ ] T113 執行 quickstart.md 驗證：依步驟建構並測試應用程式
- [ ] T114 執行完整效能測試：掃描 10,000 檔案應 < 60 秒 (Constitution IV)
- [ ] T115 程式碼最終審查：確認 SOLID 原則 (Constitution I)
- [ ] T116 安全性檢查：確認檔案操作權限與錯誤處理

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 無相依性 - 可立即開始
- **Phase 2 (Foundational)**: 相依於 Phase 1 完成 - **阻擋所有 User Stories**
- **Phase 3-6 (User Stories)**: 皆相依於 Phase 2 完成
  - User Story 1 (P1): 可在 Phase 2 完成後開始
  - User Story 2 (P2): 可與 US1 平行，但顯示需要 US1 的掃描結果
  - User Story 3 (P3): 相依於 US1 的檔案清單顯示
  - User Story 4 (P4): 相依於 US3 的檔案選擇機制
- **Phase 7 (Polish)**: 相依於所有 User Stories 完成

### User Story Dependencies

```
Phase 2 (Foundational)
       │
       ▼
    ┌──────────────────┐
    │  User Story 1    │ ← MVP 可交付點
    │  (掃描 + 顯示)   │
    └────────┬─────────┘
             │
    ┌────────┴─────────┐
    │                  │
    ▼                  ▼
┌──────────────┐  ┌──────────────┐
│ User Story 2 │  │ User Story 3 │
│ (篩選+搜尋)  │  │ (選擇+刪除)  │
└──────────────┘  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ User Story 4 │
                  │ (複製檔案)   │
                  └──────────────┘
```

### Within Each User Story

- 測試必須先撰寫並確保失敗 (TDD)
- Models → Services/Hooks → UI Components
- 核心實作 → 整合 → 驗證

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003-T012 皆可平行執行

**Phase 2 (Foundational)**:
- T014-T020 (Rust models) 可全部平行
- T024-T028 (Frontend types/lib) 可全部平行
- T030 完成後，T029 可獨立進行

**User Story 1**:
- T033-T041 (所有測試) 可全部平行
- T048-T054 (前端元件) 大部分可平行

**User Story 2**:
- T061-T066 (所有測試) 可全部平行
- T067-T072 (前端元件) 大部分可平行

**User Story 3**:
- T078-T084 (所有測試) 可全部平行
- T086, T089-T091 (前端元件) 可平行

**User Story 4**:
- T098-T100 (所有測試) 可全部平行

---

## Parallel Example: User Story 1

```bash
# 同時啟動所有 User Story 1 測試:
Task: T033 [P] [US1] Rust 單元測試 classify_extension()
Task: T034 [P] [US1] Rust 單元測試 FileEntry::from_path()
Task: T035 [P] [US1] Rust 單元測試 scan_directory()
Task: T036 [P] [US1] Rust 整合測試 scan_folder command
Task: T037 [P] [US1] 前端測試 FolderSelector
Task: T038 [P] [US1] 前端測試 ProgressBar
Task: T039 [P] [US1] 前端測試 FileTable
Task: T040 [P] [US1] 前端測試 useScanner
Task: T041 [P] [US1] 前端測試 scanStore

# 同時啟動 User Story 1 前端元件:
Task: T050 [P] [US1] FolderSelector 元件
Task: T051 [P] [US1] ScanButton 元件
Task: T052 [P] [US1] ProgressBar 元件
Task: T053 [P] [US1] FileTable 元件
Task: T054 [P] [US1] FileItem 元件
```

---

## Implementation Strategy

### MVP First (僅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (關鍵 - 阻擋所有 stories)
3. 完成 Phase 3: User Story 1
4. **停止並驗證**: 獨立測試 User Story 1
5. 可部署/展示 (MVP!)

### Incremental Delivery

1. Setup + Foundational → 基礎架構完成
2. User Story 1 → 獨立測試 → 部署/展示 (MVP!)
3. User Story 2 → 獨立測試 → 部署/展示
4. User Story 3 → 獨立測試 → 部署/展示
5. User Story 4 → 獨立測試 → 部署/展示
6. 每個 Story 都增加價值且不破壞之前的功能

---

## Notes

- [P] 任務 = 不同檔案、無相依性
- [Story] 標籤將任務對應到特定 User Story 以便追蹤
- 每個 User Story 應可獨立完成並測試
- 先驗證測試失敗再開始實作
- 每個任務或邏輯群組完成後 commit
- 可在任何 checkpoint 停止以獨立驗證 Story
- 避免：模糊任務、相同檔案衝突、破壞獨立性的跨 Story 相依
