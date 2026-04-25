---
name: project-context
description: Cấu hình bối cảnh dự án Finance Tracker V3, bao gồm Tech Stack, cấu trúc thư mục, quy tắc thiết kế Antigravity, và luồng dữ liệu (Data Flow). Đã chuyển sang mô hình Budget-First.
origin: project-wiki
---

# 🎯 Finance Tracker V3 — Project Context & Standards

> **Mục đích:** Cung cấp đầy đủ context cho AI Coding Assistants (Cursor, Windsurf, Cline, Antigravity) để hiểu rõ project structure, coding patterns, và best practices của **Finance Tracker V3**.

> ⚠️ **LƯU Ý MIGRATION:** Dự án đã hoàn thành chuyển đổi từ **S2S Engine** sang **Budget-First**. Không còn `S2SHeroSection`. Hero component mới là `BudgetOverviewCard`. Cache key thay đổi từ `['finance', 's2s']` sang `['budgets', 'summary']`.

---

## 📋 PROJECT OVERVIEW

**Project Name:** Finance Tracker V3  
**Concept:** Ứng dụng quản lý tài chính cá nhân theo mô hình **Budget-First** — người dùng chủ động tạo và quản lý hạn mức chi tiêu (Budget) cho từng danh mục. Dashboard Hero là `BudgetOverviewCard` hiển thị "Tổng ngân sách còn lại".  
**Current Phase:** ✅ Budget-First Migration completed  
**Architecture:** Monorepo Turborepo (Next.js Frontend + Hono.js Backend riêng biệt)  
**Design Language:** Tiếng Việt UI, dark hero card, primary color `#4361ee` (xanh dương)

---

## 🏗️ TECH STACK

### **Frontend (Next.js 16)**

| Technology | Version | Purpose | Import Pattern |
|------------|---------|---------|----------------|
| **Next.js** | 16.2.4+ | React framework (App Router) | Built-in |
| **React** | 18.3.1 | UI library | `import { useState } from 'react'` |
| **TypeScript** | 5.x | Type safety | `.tsx`, `.ts` files |
| **Tailwind CSS** | 4.1.12+ | Styling (v4) — dùng `bg-linear-to-*`, `shrink-0` | Inline classes |
| **Motion** | 12.x | Animations | `import { motion } from 'motion/react'` ✅ (KHÔNG dùng `framer-motion`) |
| **Lucide React** | 0.487+ | Icon library | `import { Icon } from 'lucide-react'` |
| **Recharts** | 2.15.2 | Charts (Donut, Bar, Line) | `import { ... } from 'recharts'` |
| **Radix UI** | (multiple) | Headless UI primitives | `@radix-ui/react-*` |
| **React Hook Form** | 7.55.0 | Form management | `import { useForm } from 'react-hook-form'` |
| **Sonner** | 2.0.3 | Toast notifications | `import { toast } from 'sonner'` |
| **React Query** | 5.99.0 | Server state management | `@tanstack/react-query` |
| **Axios** | 1.15.0 | HTTP client | `@finance/api-client` (interceptors tự unwrap data) |
| **date-fns** | 3.6.0 | Date utilities | `import { format } from 'date-fns'` |
| **Decimal.js** | — | Tính toán tiền tệ | `import Decimal from 'decimal.js'` |

### **Backend (Hono.js — Active)**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Hono.js** | 4.x | Edge-compatible web framework |
| **TiDB Serverless** | — | MySQL-compatible cloud database |
| **Drizzle ORM** | 0.30+ | Type-safe query builder |
| **Jose** | 5.x | JWT via HttpOnly cookies |
| **Zod** | 3.x | Schema validation (`@finance/shared-schemas`) |
| **Pino** | — | Structured JSON logging |

---

## 📁 PROJECT STRUCTURE

```
/
├── apps/
│   ├── web/                          # Next.js 16 Frontend
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/           # Login, Register
│   │       │   └── (dashboard)/      # Authenticated pages
│   │       │       ├── page.tsx      # Dashboard (BudgetOverviewCard là Hero)
│   │       │       ├── transactions/ # Trang Giao Dịch
│   │       │       ├── goals/        # Trang Mục Tiêu
│   │       │       ├── bills/        # Trang Hóa Đơn
│   │       │       ├── analytics/    # Trang Phân Tích
│   │       │       └── settings/     # Trang Cài Đặt
│   │       └── _lib/
│   │           ├── hooks/
│   │           │   ├── finance.ts    # Hooks chính: useTransactions, useBills, useGoals, ...
│   │           │   └── use-budgets.ts # Budget CRUD hooks
│   │           └── utils/finance.ts  # Utility: formatCurrency, calculateBudgetStatus
│   └── api/                          # Hono.js Backend
│       └── src/
│           ├── routes/
│           │   ├── budgets.ts        # ✅ GET /summary, GET /:id, POST, PUT, DELETE
│           │   ├── transactions.ts
│           │   ├── goals.ts
│           │   ├── bills.ts
│           │   └── analytics.ts
│           └── services/
│               ├── budget-service.ts # ✅ Business logic Budget (spent, left, percent, projectedSpending)
│               ├── transaction-service.ts
│               └── container.ts      # DI Container
├── packages/
│   ├── db/                           # Drizzle Schemas & Repositories
│   ├── shared-schemas/               # Zod schemas — Source of Truth
│   │   └── src/budget.schema.ts      # ✅ Budget Zod schemas
│   └── api-client/                   # Typed API client
│       └── src/
│           ├── types.ts              # Budget, BudgetSummary, BudgetDetail types
│           └── endpoints.ts          # budgetsAPI object
└── doc/                              # Project Documentation
```

---

## 🧩 COMPONENT ARCHITECTURE

### **Module-Based Component Organization**

```
_components/
├── layout/           # Sidebar, shell components (Finance Tracker branding)
├── budget/           # ✅ Budget-First components
│   └── BudgetOverviewCard.tsx   # Hero Dashboard widget (thay thế S2SHeroSection)
├── goals/            # Goal components
├── transactions/     # Transaction components
├── wallet/           # CashWalletStrip (offline-first)
├── quick-add/        # QuickAddModal
└── ui/               # shadcn/ui primitives
```

### **Key Components**

| Component | Vị trí | Vai trò |
|---|---|---|
| `BudgetOverviewCard` | `_components/budget/` | ✅ **Hero Dashboard** — hiển thị left/spent/percent/projectedSpending |
| `CashWalletStrip` | `_components/wallet/` | Offline-first Cash Wallet, không tính vào Budget |
| `QuickAddModal` | `_components/quick-add/` | Nhập giao dịch nhanh |
| `Sidebar` | `_components/layout/` | Navigation (Finance Tracker branding) |

### **Financial Integrity Rules (Non-Negotiable)**

- **Money as `string`**: Tất cả giá trị tiền tệ phải là `string`. Tính toán bằng `Decimal.js`.
- **BigInt IDs as `string`**: ID `BIGINT` từ TiDB → `mode: "string"` trong Drizzle.
- **Soft Delete Only**: Dùng cột `deleted_at`, không dùng `DELETE` cứng.
- **Idempotency Keys**: Bắt buộc cho POST/PATCH/PUT tài chính.
- **User Scope**: Mọi query DB phải filter theo `userId`.

---

## 🎨 STYLING & UI (Antigravity Standard)

### **Design Language**
- **Budget is Hero**: `BudgetOverviewCard` là widget quan trọng nhất — dark theme (zinc-900/black), hiển thị số dư còn lại lớn nhất.
- **Color Psychology (Budget Status)**:
  - ✅ `percent < 80` → Emerald → Xanh lá → An toàn.
  - ⚠️ `80 ≤ percent ≤ 100` → Amber → Vàng → Cảnh báo.
  - ❌ `percent > 100` → Red → Đỏ → Vượt ngân sách.
- **Tailwind v4 Rules**: Dùng `bg-linear-to-*` (KHÔNG dùng `bg-gradient-to-*`), `shrink-0` (KHÔNG dùng `flex-shrink-0`).
- **Animations**: Sử dụng `motion/react` — KHÔNG dùng `framer-motion`.
- **Aesthetics**: Glassmorphism, dark hero cards, micro-animations.

---

## 🔄 DATA FLOW

```
[User Action in UI]
       ↓
[Component / TanStack Mutation]
       ↓
[API Call via @finance/api-client (Axios — tự unwrap response.data)]
       ↓
[Hono.js API Route (Zod validation)]
       ↓
[Service Layer (BudgetService, TransactionService...)]
       ↓
[Drizzle ORM → TiDB Serverless]
       ↓
[Success Response]
       ↓
[React Query Cache Invalidation: ['budgets', 'summary'] / ['transactions']]
       ↓
[UI Re-render với BudgetOverviewCard cập nhật]
```

### **React Query Cache Keys (Chuẩn)**

| Data | Query Key |
|------|-----------|
| Budget Summary (Dashboard) | `['budgets', 'summary']` |
| Budget List | `['budgets']` |
| Transactions | `['transactions']` |
| Goals | `['goals']` |
| Bills | `['bills']` |
| Cash Wallet | `['wallet', 'cash']` |

---

## 📚 DOCUMENTATION STANDARDS

Mọi thay đổi quan trọng phải được ghi lại trong thư mục `doc/`:

- **`doc/wiki/`**: Architecture, Database Schema thay đổi.
- **`doc/update-feature/`**: Mỗi tính năng hoàn thành (VD: `UPDATE_20260422_BUDGET_MIGRATION.md`).
- **`doc/hot-fix/`**: Lỗi nghiêm trọng và cách xử lý.
- **`doc/problem`**: Lỗi hiện tại và blockers.

---

## 🎓 AI ASSISTANT DIRECTIVES

### Khi tạo code:
1. **LUÔN LUÔN** kiểm tra cấu trúc file hiện tại trước khi tạo mới — dùng `gitnexus_query` trước.
2. **ƯU TIÊN** chỉnh sửa component module-based trong `_components/`.
3. **SỬ DỤNG** TypeScript với kiểu dữ liệu tường minh — import types từ `@finance/api-client`.
4. **GIỮ** ngôn ngữ UI là Tiếng Việt.
5. **TUÂN THỦ** quy tắc tiền tệ: `string` + `Decimal.js`.
6. **KHÔNG** dùng `framer-motion` — dùng `motion/react`.
7. **KHÔNG** dùng `bg-gradient-to-*` — dùng `bg-linear-to-*` (Tailwind v4).
8. **KHÔNG** dùng `flex-shrink-0` — dùng `shrink-0` (Tailwind v4).
9. **LUÔN** chạy `gitnexus_impact` trước khi sửa shared utilities.
10. **Cache key Budget Summary** là `['budgets', 'summary']` — KHÔNG dùng `['finance', 's2s']`.

### ❌ Anti-Patterns (Đã bị loại bỏ):
- `S2SHeroSection` — **ĐÃ XÓA**, thay bằng `BudgetOverviewCard`
- `s2sAPI` endpoints — **ĐÃ XÓA**
- `S2SPeriod`, `S2SStatus` types — **ĐÃ XÓA**
- Query key `['finance', 's2s']` — **ĐÃ DEPRECATED**, dùng `['budgets', 'summary']`
- `import { motion } from 'framer-motion'` — **KHÔNG HỢP LỆ**, dùng `motion/react`

---
**Last Updated:** April 22, 2026  
**Document Version:** 2.0 (Budget-First Architecture)