# Finance Tracker — System Architecture & Project Overview

> **Last updated:** April 13, 2026
> **Version:** 11.0 (Monorepo Turborepo — Option A Confirmed)
> **Author:** Antigravity & User (Collaborative Staff-grade Design)
> **⚠️ Cảnh báo thực tế:** Kiến trúc đang trong giai đoạn "Hardening". Bản thiết kế này là mục tiêu (Blueprint) đã được đồng bộ với thực trạng mã nguồn sau khi xử lý nợ kỹ thuật.

---

## 1. PROJECT OVERVIEW

**Finance Tracker** (Safe-to-Spend) là ứng dụng quản lý tài chính cá nhân tập trung vào một chỉ số cốt lõi duy nhất: **"Bạn còn có thể tiêu bao nhiêu tiền hôm nay mà không phá vỡ kế hoạch tài chính?"**

### Concept Core — Budget-First Formula

```
Budget = Total_Income - Actual_Expense - Fixed_Costs_Pending - Goals_Allocation - Emergency_Buffer
```

- Màu **xanh lá** khi Budget > 0 → ngân sách an toàn
- Màu **đỏ** khi Budget ≤ 0 → cảnh báo vượt ngân sách

---

## 2. MONOREPO STRUCTURE (Turborepo)

### Cấu trúc thư mục Monorepo

```
finance-tracker/                    # Root monorepo
├── apps/
│   ├── web/                        # Frontend (Next.js 14 App Router)
│   ├── api/                        # Backend API (Hono.js → Vercel Edge / Cloudflare)
│   └── worker/                     # Backend Worker (Tác vụ nền, Auto-billing, Reports)
├── packages/
│   ├── db/                         # Drizzle ORM schemas + repositories
│   ├── cache/                      # Caching Layer (Upstash Redis interface)
│   └── shared-schemas/             # Zod validation schemas (dùng cho cả web & api)
├── turbo.json                      # Turborepo pipeline config
├── package.json                    # Root package.json (workspaces)
└── pnpm-workspace.yaml             # pnpm workspaces
```

---

## 3. TECH STACK (Target)

### Frontend — `apps/web`
- Next.js 14 (App Router), Tailwind CSS v4, Motion 12, Lucide React, Recharts.

### Backend — `apps/api`
- Hono.js (Edge-ready), Zod, OpenAI SDK (NLP Quick-Add), Upstash Redis.

### Database — `packages/db`
- TiDB Serverless, Drizzle ORM, @tidbcloud/serverless (HTTP Driver).

---

## 4. CLEAN ARCHITECTURE — BACKEND SERVICES

### 📂 Cấu trúc logic tại `apps/api/src/services/` (Staff-grade)

Bạn đã cấu trúc lại folder này để đảm bảo tính **Decoupled** và **Testable**:

```
/apps/api/src/services/
├── adapters/        # Lớp Adapter (ví dụ: RegexNLPAdapter, OpenAIAdapter)
├── services/        # Lớp Logic nghiệp vụ chính (TransactionService, BudgetService...)
├── lib/             # Các utility dùng riêng cho service layer
└── container.ts     # DI Container: Khởi tạo và quản lý vòng đời của các Service.
```

### ✅ Dependency Injection (DI) Pattern
Mọi Service đều nhận Repository và Adapter qua Constructor. Điều này cho phép "Transaction-per-Test" isolation trong kiểm thử.

#### Example: TransactionService
```typescript
class TransactionService {
  constructor(
    private repo: TransactionRepository,
    private nlp: INLPAdapter,
    private cache: ICache
  ) {}
  // Logic xử lý nghiệp vụ...
}
```

---

## 5. FRONTEND ARCHITECTURE (Next.js 14)

### Cấu trúc ứng dụng
- **App Router**: Sử dụng các page-specific components tại `app-pages/`.
- **Type-safe Client**: Sử dụng `TransactionUI` làm cầu nối giữa Mock data và API Real data.
- **Optimistic State**: Quản lý trạng thái giao dịch lạc quan với cơ chế Rollback an toàn.

---

## 6. BACKEND ROADMAP

1. **Phase 1: Hardening (Completed)** — Loại bỏ `any`, chuẩn hóa Type Safety, xử lý nợ kỹ thuật tại Service Layer.
2. **Phase 2: Auth & Security** — JWT flow Edge-compatible, Rate limiting via Upstash.
3. **Phase 3: Core API Enhancement** — Triển khai logic Budget thời gian thực, quản lý Bills và Goals.
4. **Phase 4: AI & Automation** — NLP Quick-add nâng cao (OpenAI) & Tự động tạo hóa đơn định kỳ (Worker logic).

---

## 7. QUY TẮC PHÁT TRIỂN (Development Rules)

- **No ANY**: Tuyệt đối không dùng kiểu `any`. Sử dụng Zod schemas hoặc interface rõ ràng.
- **Monetary Safety**: Sử dụng chuỗi (string) trong DB và `Decimal.js` trong code khi tính toán tiền tệ.
- **VNĐ Standard**: Toàn bộ UI hiển thị đơn vị `₫`, format `vi-VN`.

---

## 8. ENVIRONMENT VARIABLES

`DATABASE_URL`, `JWT_SECRET`, `UPSTASH_REDIS_REST_URL`, `OPENAI_API_KEY`.

---

## 9. FONT
- Font chính: **Inter** (Google Fonts)
