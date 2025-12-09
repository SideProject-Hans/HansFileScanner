# Tasks: 跨平台檔案掃描工具

**Input**: Design documents from `/specs/001-file-scanner-tool/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: 本專案遵循 Constitution Principle II (TDD)，測試為必要項目，必須在實作前撰寫。

**Organization**: 任務按 User Story 分組，以支援各 Story 的獨立實作與測試。

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 可平行執行（不同檔案、無相依性）
- **[Story]**: 此任務所屬的 User Story（例如：US1, US2, US3, US4）
- 描述中包含確切的檔案路徑

## Path Conventions

依據 plan.md 的專案結構：
- **Rust 後端**: `src-tauri/src/`
- **React 前端**: `src/`
- **前端測試**: `tests/`

---

## Phase 1: Setup (共用基礎建設)

**Purpose**: 專案初始化與基本結構建立

- [ ] T001 使用 `pnpm create tauri-app@latest` 建立 Tauri 2.x + React + TypeScript 專案
- [ ] T002 安裝前端相依套件 (zustand, lucide-react, tailwindcss, @tanstack/react-virtual) 於 `package.json`
- [ ] T003 [P] 安裝 shadcn/ui 並初始化設定 (`pnpm dlx shadcn@latest init`)
- [ ] T004 [P] 設定 Tailwind CSS (`tailwind.config.js`, `postcss.config.js`, `src/index.css`)
- [ ] T005 [P] 設定 TypeScript 嚴格模式於 `tsconfig.json`
- [ ] T006 安裝 Tauri plugins (dialog, fs) 於 `src-tauri/Cargo.toml`
- [ ] T007 [P] 新增 Rust 相依套件 (walkdir, chrono, trash, serde, serde_json) 於 `src-tauri/Cargo.toml`
- [ ] T008 [P] 設定 ESLint + Prettier 前端程式碼風格於 `.eslintrc.cjs` 和 `.prettierrc`
- [ ] T009 [P] 設定 rustfmt + clippy Rust 程式碼風格於 `src-tauri/rustfmt.toml` 和 `src-tauri/.clippy.toml`
- [ ] T010 [P] 設定前端測試框架 Vitest 於 `vitest.config.ts`
- [ ] T011 [P] 建立 GitHub Actions CI 工作流程於 `.github/workflows/ci.yml`
- [ ] T012 [P] 設定 Tauri 權限於 `src-tauri/capabilities/default.json`

---

## Phase 2: Foundational (阻塞性前置作業)

**Purpose**: 核心基礎建設，所有 User Story 實作前必須完成

**⚠️ 重要**: 此階段完成前，不能開始任何 User Story 的工作

### 共用型別定義

- [ ] T013 建立前端共用型別定義於 `src/types/file.ts` (FileEntry, FileCategory, ScanResult, ScanStats 等)
- [ ] T014 [P] 建立前端掃描相關型別於 `src/types/scan.ts` (ScanProgress, ScanStatus, ViewMode 等)
- [ ] T015 [P] 建立 Rust 資料模型於 `src-tauri/src/models/mod.rs` (模組匯出)
- [ ] T016 [P] 建立 Rust FileEntry 結構於 `src-tauri/src/models/file_entry.rs`
- [ ] T017 [P] 建立 Rust ScanResult 結構於 `src-tauri/src/models/scan_result.rs`

### 核心掃描引擎

- [ ] T018 建立 Rust 掃描模組於 `src-tauri/src/scanner/mod.rs` (模組匯出)
- [ ] T019 實作檔案類型分類邏輯於 `src-tauri/src/scanner/file_info.rs` (FileCategory 映射)
- [ ] T020 實作目錄遍歷核心於 `src-tauri/src/scanner/walker.rs` (使用 walkdir crate)

### Tauri 命令框架

- [ ] T021 建立 Tauri 命令模組於 `src-tauri/src/commands/mod.rs` (模組匯出)
- [ ] T022 設定 Tauri 應用程式進入點於 `src-tauri/src/main.rs`
- [ ] T023 設定模組匯出於 `src-tauri/src/lib.rs`

### 前端基礎架構

- [ ] T024 建立 Tauri API 封裝於 `src/lib/tauri.ts` (invoke 包裝函式)
- [ ] T025 [P] 建立通用工具函式於 `src/lib/utils.ts` (cn 函式、格式化等)
- [ ] T026 [P] 建立檔案相關工具於 `src/lib/file-utils.ts` (檔案大小格式化、副檔名處理)
- [ ] T027 建立主版面配置元件於 `src/components/layout/MainLayout.tsx`
- [ ] T028 更新應用程式根元件於 `src/App.tsx` (引入 MainLayout)

### shadcn/ui 基礎元件

- [ ] T029 [P] 新增 shadcn Button 元件於 `src/components/ui/button.tsx`
- [ ] T030 [P] 新增 shadcn Dialog 元件於 `src/components/ui/dialog.tsx`
- [ ] T031 [P] 新增 shadcn Checkbox 元件於 `src/components/ui/checkbox.tsx`
- [ ] T032 [P] 新增 shadcn Select 元件於 `src/components/ui/select.tsx`
- [ ] T033 [P] 新增 shadcn Input 元件於 `src/components/ui/input.tsx`
- [ ] T034 [P] 新增 shadcn Progress 元件於 `src/components/ui/progress.tsx`
- [ ] T035 [P] 新增 shadcn Toast/Sonner 元件於 `src/components/ui/sonner.tsx`

**Checkpoint**: 基礎建設完成 - 可開始 User Story 實作

---

## Phase 3: User Story 1 - 掃描資料夾並顯示檔案資訊 (Priority: P1) 🎯 MVP

**Goal**: 使用者可選擇資料夾、執行掃描、查看所有檔案資訊（包含子資料夾）

**Independent Test**: 選擇任一資料夾 → 點擊掃描 → 顯示檔案清單（路徑、大小、修改時間、資料夾總大小）

### Tests for User Story 1 (Constitution II: TDD) ⚠️

- [ ] T036 [P] [US1] 建立 Rust 掃描模組單元測試於 `src-tauri/src/scanner/walker.rs` (內嵌 #[cfg(test)])
- [ ] T037 [P] [US1] 建立 Rust 檔案資訊單元測試於 `src-tauri/src/scanner/file_info.rs` (內嵌 #[cfg(test)])
- [ ] T038 [P] [US1] 建立前端 useScanner Hook 測試於 `tests/hooks/useScanner.test.ts`
- [ ] T039 [P] [US1] 建立前端 scanStore 測試於 `tests/stores/scanStore.test.ts`
- [ ] T040 [P] [US1] 建立 FolderSelector 元件測試於 `tests/components/scanner/FolderSelector.test.tsx`
- [ ] T041 [P] [US1] 建立 ProgressBar 元件測試於 `tests/components/scanner/ProgressBar.test.tsx`

### Implementation for User Story 1

#### Rust 後端

- [ ] T042 [US1] 實作 scan_folder Tauri 命令於 `src-tauri/src/commands/scan.rs`
- [ ] T043 [US1] 實作掃描進度事件發送於 `src-tauri/src/commands/scan.rs` (emit scan_progress)

#### 前端狀態管理

- [ ] T044 [US1] 建立 scanStore 狀態管理於 `src/stores/scanStore.ts` (Zustand)

#### 前端 Hooks

- [ ] T045 [US1] 建立 useScanner Hook 於 `src/hooks/useScanner.ts` (封裝掃描邏輯)

#### 前端元件

- [ ] T046 [P] [US1] 建立 FolderSelector 元件於 `src/components/scanner/FolderSelector.tsx` (資料夾選擇)
- [ ] T047 [P] [US1] 建立 ScanButton 元件於 `src/components/scanner/ScanButton.tsx` (掃描按鈕)
- [ ] T048 [P] [US1] 建立 ProgressBar 元件於 `src/components/scanner/ProgressBar.tsx` (進度條)
- [ ] T049 [US1] 建立 FileTable 元件於 `src/components/file-list/FileTable.tsx` (表格式顯示)
- [ ] T050 [US1] 建立 FileItem 元件於 `src/components/file-list/FileItem.tsx` (單一檔案項目)
- [ ] T051 [US1] 整合掃描功能至 MainLayout 於 `src/components/layout/MainLayout.tsx`

### Validation for User Story 1

- [ ] T052 [US1] 驗證 Rust 測試通過 (`cargo test` 於 src-tauri/)
- [ ] T053 [US1] 驗證前端測試覆蓋率 ≥ 80% (`pnpm test:coverage`)
- [ ] T054 [US1] 驗證效能：掃描 1000 個檔案 < 10 秒

**Checkpoint**: User Story 1 完成 - 使用者可選擇資料夾並掃描顯示檔案資訊

---

## Phase 4: User Story 2 - 以不同模式檢視檔案並搜尋 (Priority: P2)

**Goal**: 使用者可切換顯示模式（樹結構/文檔/圖檔/影片/音訊）、使用下拉選單篩選副檔名、並透過搜尋框即時搜尋

**Independent Test**: 切換到「圖檔清單」模式 → 從下拉選單選擇「jpg」→ 輸入搜尋關鍵字 → 驗證顯示結果

### Tests for User Story 2 (Constitution II: TDD) ⚠️

- [ ] T055 [P] [US2] 建立 filterStore 測試於 `tests/stores/filterStore.test.ts`
- [ ] T056 [P] [US2] 建立 ViewModeSelector 元件測試於 `tests/components/filters/ViewModeSelector.test.tsx`
- [ ] T057 [P] [US2] 建立 TypeFilter 元件測試於 `tests/components/filters/TypeFilter.test.tsx`
- [ ] T058 [P] [US2] 建立 SearchBox 元件測試於 `tests/components/filters/SearchBox.test.tsx`
- [ ] T059 [P] [US2] 建立 FileTree 元件測試於 `tests/components/file-list/FileTree.test.tsx`

### Implementation for User Story 2

#### 前端狀態管理

- [ ] T060 [US2] 建立 filterStore 狀態管理於 `src/stores/filterStore.ts` (ViewMode, 搜尋, 篩選)

#### 前端元件 - 篩選功能

- [ ] T061 [P] [US2] 建立 ViewModeSelector 元件於 `src/components/filters/ViewModeSelector.tsx` (模式切換)
- [ ] T062 [P] [US2] 建立 TypeFilter 元件於 `src/components/filters/TypeFilter.tsx` (副檔名下拉篩選)
- [ ] T063 [P] [US2] 建立 SearchBox 元件於 `src/components/filters/SearchBox.tsx` (即時搜尋)

#### 前端元件 - 顯示模式

- [ ] T064 [US2] 建立 FileTree 元件於 `src/components/file-list/FileTree.tsx` (樹結構顯示)
- [ ] T065 [US2] 更新 FileTable 支援篩選於 `src/components/file-list/FileTable.tsx`
- [ ] T066 [US2] 整合篩選功能至 MainLayout 於 `src/components/layout/MainLayout.tsx`

### Validation for User Story 2

- [ ] T067 [US2] 驗證前端測試覆蓋率 ≥ 80%
- [ ] T068 [US2] 驗證 UI 操作回應時間 < 100ms

**Checkpoint**: User Story 2 完成 - 使用者可切換模式、篩選類型並搜尋檔案

---

## Phase 5: User Story 3 - 選擇並刪除檔案 (Priority: P3)

**Goal**: 使用者可勾選檔案（單選/多選/全選）並刪除選中的檔案

**Independent Test**: 勾選多個檔案 → 點擊刪除 → 確認對話框 → 驗證檔案被刪除並顯示結果

### Tests for User Story 3 (Constitution II: TDD) ⚠️

- [ ] T069 [P] [US3] 建立 Rust delete_files 命令測試於 `src-tauri/src/commands/file_ops.rs` (內嵌 #[cfg(test)])
- [ ] T070 [P] [US3] 建立 selectionStore 測試於 `tests/stores/selectionStore.test.ts`
- [ ] T071 [P] [US3] 建立 useFileSelection Hook 測試於 `tests/hooks/useFileSelection.test.ts`
- [ ] T072 [P] [US3] 建立 useFileOperations Hook 測試於 `tests/hooks/useFileOperations.test.ts`
- [ ] T073 [P] [US3] 建立 FileCheckbox 元件測試於 `tests/components/file-list/FileCheckbox.test.tsx`
- [ ] T074 [P] [US3] 建立 DeleteButton 元件測試於 `tests/components/operations/DeleteButton.test.tsx`
- [ ] T075 [P] [US3] 建立 ConfirmDialog 元件測試於 `tests/components/operations/ConfirmDialog.test.tsx`

### Implementation for User Story 3

#### Rust 後端

- [ ] T076 [US3] 實作 delete_files Tauri 命令於 `src-tauri/src/commands/file_ops.rs` (使用 trash crate)

#### 前端狀態管理

- [ ] T077 [US3] 建立 selectionStore 狀態管理於 `src/stores/selectionStore.ts`

#### 前端 Hooks

- [ ] T078 [P] [US3] 建立 useFileSelection Hook 於 `src/hooks/useFileSelection.ts`
- [ ] T079 [P] [US3] 建立 useFileOperations Hook 於 `src/hooks/useFileOperations.ts`

#### 前端元件

- [ ] T080 [P] [US3] 建立 FileCheckbox 元件於 `src/components/file-list/FileCheckbox.tsx`
- [ ] T081 [P] [US3] 建立 SelectAllButton 元件於 `src/components/operations/SelectAllButton.tsx`
- [ ] T082 [P] [US3] 建立 DeleteButton 元件於 `src/components/operations/DeleteButton.tsx`
- [ ] T083 [US3] 建立 ConfirmDialog 元件於 `src/components/operations/ConfirmDialog.tsx`
- [ ] T084 [US3] 整合選擇與刪除功能至 FileTable/FileTree 於 `src/components/file-list/`
- [ ] T085 [US3] 整合操作按鈕至 MainLayout 於 `src/components/layout/MainLayout.tsx`

### Validation for User Story 3

- [ ] T086 [US3] 驗證 Rust 測試通過
- [ ] T087 [US3] 驗證前端測試覆蓋率 ≥ 80%
- [ ] T088 [US3] 驗證刪除操作有確認對話框且錯誤有明確提示

**Checkpoint**: User Story 3 完成 - 使用者可選擇並刪除檔案

---

## Phase 6: User Story 4 - 選擇並複製檔案 (Priority: P4)

**Goal**: 使用者可選擇檔案並複製到指定目標資料夾

**Independent Test**: 勾選檔案 → 點擊複製 → 選擇目標資料夾 → 驗證檔案被複製並顯示結果

### Tests for User Story 4 (Constitution II: TDD) ⚠️

- [ ] T089 [P] [US4] 建立 Rust copy_files 命令測試於 `src-tauri/src/commands/file_ops.rs` (內嵌 #[cfg(test)])
- [ ] T090 [P] [US4] 建立 CopyButton 元件測試於 `tests/components/operations/CopyButton.test.tsx`

### Implementation for User Story 4

#### Rust 後端

- [ ] T091 [US4] 實作 copy_files Tauri 命令於 `src-tauri/src/commands/file_ops.rs`

#### 前端元件

- [ ] T092 [US4] 建立 CopyButton 元件於 `src/components/operations/CopyButton.tsx`
- [ ] T093 [US4] 更新 useFileOperations Hook 支援複製於 `src/hooks/useFileOperations.ts`
- [ ] T094 [US4] 整合複製按鈕至 MainLayout 於 `src/components/layout/MainLayout.tsx`

### Validation for User Story 4

- [ ] T095 [US4] 驗證 Rust 測試通過
- [ ] T096 [US4] 驗證前端測試覆蓋率 ≥ 80%
- [ ] T097 [US4] 驗證複製時同名檔案處理邏輯正確

**Checkpoint**: User Story 4 完成 - 使用者可選擇並複製檔案

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨 User Story 的改進與收尾

- [ ] T098 [P] 建立 GitHub Actions 多平台建構工作流程於 `.github/workflows/release.yml`
- [ ] T099 [P] 更新 README.md 加入使用說明與安裝指南
- [ ] T100 [P] 建立應用程式圖示於 `src-tauri/icons/`
- [ ] T101 設定 Tauri 應用程式 metadata 於 `src-tauri/tauri.conf.json`
- [ ] T102 執行完整效能測試（10,000 檔案掃描、UI 回應時間）
- [ ] T103 執行無障礙功能檢查 (shadcn/ui ARIA 支援)
- [ ] T104 驗證 quickstart.md 所有步驟可正常執行
- [ ] T105 最終程式碼審查與清理

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 無相依性 - 可立即開始
- **Foundational (Phase 2)**: 相依於 Setup 完成 - **阻塞所有 User Story**
- **User Stories (Phase 3-6)**: 全部相依於 Foundational 階段完成
  - 各 User Story 可平行進行（若有多人）
  - 或依優先順序執行（P1 → P2 → P3 → P4）
- **Polish (Phase 7)**: 相依於所有預期 User Story 完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成後即可開始 - 無其他 Story 相依性
- **User Story 2 (P2)**: Foundational 完成後即可開始 - 與 US1 整合但可獨立測試
- **User Story 3 (P3)**: Foundational 完成後即可開始 - 需要 US1 的檔案清單但選擇功能獨立
- **User Story 4 (P4)**: Foundational 完成後即可開始 - 與 US3 共用選擇機制

### Within Each User Story

- 測試必須先撰寫並確認失敗（Red-Green-Refactor）
- Rust 後端先於前端整合
- 狀態管理先於 UI 元件
- 元件完成後再整合至 MainLayout

### Parallel Opportunities

**Phase 1 內平行任務**: T003, T004, T005, T007, T008, T009, T010, T011, T012

**Phase 2 內平行任務**: T014-T017, T025-T026, T029-T035

**User Story 內平行測試**: 各 Story 的測試任務均可平行執行

**User Story 間平行**: US1 完成後，US2/US3/US4 可由不同開發者同時進行

---

## Parallel Example: User Story 1

```bash
# 同時啟動所有 US1 測試任務：
T036: Rust walker 測試
T037: Rust file_info 測試
T038: useScanner Hook 測試
T039: scanStore 測試
T040: FolderSelector 元件測試
T041: ProgressBar 元件測試

# 測試就緒後，同時啟動平行元件任務：
T046: FolderSelector 元件
T047: ScanButton 元件
T048: ProgressBar 元件
```

---

## Implementation Strategy

### MVP First (僅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (重要 - 阻塞所有 Story)
3. 完成 Phase 3: User Story 1
4. **停止並驗證**: 獨立測試 User Story 1
5. 若準備就緒可部署/展示 MVP

### Incremental Delivery

1. Setup + Foundational → 基礎建設完成
2. 新增 User Story 1 → 獨立測試 → 部署/展示 (MVP!)
3. 新增 User Story 2 → 獨立測試 → 部署/展示
4. 新增 User Story 3 → 獨立測試 → 部署/展示
5. 新增 User Story 4 → 獨立測試 → 部署/展示
6. 每個 Story 增加價值而不破壞先前功能

### Parallel Team Strategy

若有多位開發者：

1. 團隊一起完成 Setup + Foundational
2. Foundational 完成後：
   - 開發者 A: User Story 1 (Rust 後端)
   - 開發者 B: User Story 1 (React 前端)
3. US1 完成後可分配 US2/US3/US4

---

## Summary

| 統計項目 | 數量 |
|---------|------|
| 總任務數 | 105 |
| Phase 1: Setup | 12 |
| Phase 2: Foundational | 23 |
| Phase 3: User Story 1 | 19 |
| Phase 4: User Story 2 | 14 |
| Phase 5: User Story 3 | 20 |
| Phase 6: User Story 4 | 9 |
| Phase 7: Polish | 8 |
| 可平行任務數 | 62 |

### MVP Scope

**建議 MVP 範圍**: 僅實作 User Story 1（Phase 1-3，共 54 個任務）

MVP 交付價值：
- 選擇資料夾並掃描
- 顯示進度條
- 以表格顯示所有檔案資訊（路徑、大小、修改時間、資料夾總大小）

### Independent Test Criteria

| User Story | 獨立測試方式 |
|------------|-------------|
| US1 | 選擇資料夾 → 掃描 → 顯示檔案清單 |
| US2 | 切換顯示模式 → 篩選類型 → 輸入搜尋 |
| US3 | 勾選檔案 → 刪除 → 確認結果 |
| US4 | 勾選檔案 → 複製 → 選擇目標 → 確認結果 |

---

## Notes

- [P] 任務 = 不同檔案、無相依性，可平行執行
- [Story] 標籤將任務對應至特定 User Story 以便追蹤
- 每個 User Story 應可獨立完成與測試
- 實作前確認測試失敗（Red-Green-Refactor）
- 每個任務或邏輯群組完成後提交
- 可在任何 Checkpoint 停止並獨立驗證該 Story
- 避免：模糊任務、同檔案衝突、破壞獨立性的跨 Story 相依
