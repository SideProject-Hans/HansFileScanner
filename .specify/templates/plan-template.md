# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 程式碼品質標準
- [ ] 已定義程式碼風格指南和命名慣例
- [ ] 已配置靜態分析工具(linter)和格式化工具
- [ ] 已建立程式碼審查流程(至少一位審查者)
- [ ] SOLID 原則已考慮於架構設計中
- [ ] 技術債務追蹤機制已就緒

### II. 測試驅動開發 (非協商性)
- [ ] 測試策略已定義(單元/整合/契約/端對端測試範圍)
- [ ] 測試覆蓋率目標已設定 (≥ 80% 單元測試覆蓋率)
- [ ] 紅-綠-重構 TDD 流程將被遵循
- [ ] CI 管線將執行所有測試並阻止失敗合併
- [ ] 關鍵業務邏輯已識別並將達到 100% 覆蓋率

### III. 使用者體驗一致性
- [ ] UI 元件和設計模式已定義或參考現有設計系統
- [ ] 無障礙存取需求已確認 (WCAG 2.1 AA 級)
- [ ] 回應性設計需求已明確(目標裝置和螢幕尺寸)
- [ ] 錯誤處理和使用者回饋策略已定義
- [ ] 載入狀態和非同步操作回饋機制已計畫

### IV. 效能需求
- [ ] 回應時間目標已定義 (API < 200ms, UI FCP < 1.5s)
- [ ] 效能預算已設定 (套件大小、圖片、記憶體)
- [ ] 效能測試策略已規劃(負載測試、效能回歸測試)
- [ ] 監控和可觀測性已考慮(指標、日誌、追蹤)
- [ ] 可擴展性需求已評估(預期使用者量、資料量)

### V. 文件語言需求 (NON-NEGOTIABLE)
- [ ] 規格文件將使用繁體中文撰寫 (spec.md, plan.md, research.md 等)
- [ ] 使用者面向文件將使用繁體中文 (README, 使用者指南, API 文件)
- [ ] 程式碼註解將使用英文 (業務邏輯說明可使用繁體中文)
- [ ] 內部溝通將使用繁體中文 (commit 訊息, PR 描述)

**違規理由** (僅在有未通過檢查點時填寫):
| 違規項目 | 為何需要 | 被拒絕的更簡單替代方案及理由 |
|---------|---------|---------------------------|
| [例如: 跳過單元測試] | [當前需求] | [為何無法使用 TDD] |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
