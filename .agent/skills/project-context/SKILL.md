---
name: project-context
description: Cấu hình bối cảnh dự án S2S Finance Tracker V3, bao gồm Tech Stack, cấu trúc thư mục, quy tắc thiết kế Antigravity, và luồng dữ liệu (Data Flow).
origin: project-wiki
---

# 🎯 S2S Finance — Project Context & Standards

> **Mục đích:** Cung cấp đầy đủ context cho AI Coding Assistants (Cursor, Windsurf, Cline, GitHub Copilot) để hiểu rõ project structure, coding patterns, và best practices của **Finance Tracker V3**.

---

## 📋 PROJECT OVERVIEW

**Project Name:** Finance Tracker V3 (S2S Finance)  
**Concept:** Ứng dụng quản lý tài chính cá nhân theo triết lý **Behavioral Finance** với Hero Section là "Khoảng Chi Tiêu An Toàn (Safe-to-Spend - S2S)"  
**Current Phase:** ✅ Real Data Integration & Seeding completed
**Architecture:** Monorepo Turborepo (Next.js Frontend + Hono.js Backend riêng biệt)  
**Design Language:** Tiếng Việt UI, theme trắng tối giản, primary color `#4361ee` (xanh dương)

---

## 🏗️ TECH STACK

### **Frontend (Current — Next.js 16)**

| Technology | Version | Purpose | Import Pattern |
|------------|---------|---------|----------------|
| **Next.js** | 16.2.4+ | React framework (App Router) | Built-in |
| **React** | 18.3.1 | UI library | `import { useState } from 'react'` |
| **TypeScript** | 5.x | Type safety | `.tsx`, `.ts` files |
| **Tailwind CSS** | 4.1.12+ | Styling (v4 with Vite plugin) | Inline classes |
| **Motion** | 12.23.24 | Animations | `import { motion } from 'motion/react'` |
| **Lucide React** | 0.487+ | Icon library | `import { Icon } from 'lucide-react'` |
| **Recharts** | 2.15.2 | Charts (Donut, Bar, Line) | `import { ... } from 'recharts'` |
| **Radix UI** | (multiple) | Headless UI primitives | `@radix-ui/react-*` |
| **React Hook Form** | 7.55.0 | Form management | `import { useForm } from 'react-hook-form'` |
| **Sonner** | 2.0.3 | Toast notifications | `import { toast } from 'sonner'` |
| **React Query** | 5.99.0 | Server state management | `@tanstack/react-query` |
| **Axios** | 1.15.0 | HTTP client | `import axios from 'axios'` |
| **date-fns** | 3.6.0 | Date utilities | `import { format } from 'date-fns'` |
| **canvas-confetti** | 1.9.4 | Goal completion effect | `import confetti from 'canvas-confetti'` |

### **Backend (Planned — Hono.js)**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Hono.js** | 4.x | Edge-compatible web framework |
| **Vercel Edge Runtime** | — | Serverless deployment |
| **TiDB Serverless** | — | MySQL-compatible cloud database |
| **Drizzle ORM** | 0.30+ | Type-safe query builder |
| **Jose** | 5.x | JWT (Web Crypto API compatible) |
| **Zod** | 3.x | Schema validation |
| **OpenAI SDK** | 4.x | NLP Quick-Add parsing |
| **Resend** | 3.x | Email notifications |
| **Upstash Redis** | — | Rate limiting, cache |

---

## 📁 PROJECT STRUCTURE

### **Current Next.js 16 App Router**

```
/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/             # Route group: unauthenticated pages
│   │   │   │   └── (dashboard)/        # Route group: authenticated pages
│   │   │   │       ├── page.tsx        # Dashboard home (S2S Hero)
│   │   │   │       └── _components/    # ✅ Module-based components
│   │   │   └── _lib/
│   │   │       ├── hooks/              # Custom React Query hooks
│   │   │       └── utils/              # Frontend utilities
│   └── api/                    # Hono.js Backend
├── packages/
│   ├── db/                     # Drizzle Schemas & Repositories
│   ├── shared-schemas/         # Shared Zod schemas (Source of Truth)
│   └── api-client/             # Typed API client for frontend
├── doc/                        # Project Documentation & Context
│   ├── wiki/                   # Permanent docs (Arch, DB, Guides)
│   ├── update/                 # Project milestone logs
│   ├── update-feature/         # Feature implementation details
│   ├── hot-fix/                # Critical fix reports
│   └── problem                 # Current known issues & blockers
```

---

## 🧩 COMPONENT ARCHITECTURE

### **Module-Based Component Organization**

Sử dụng **prefix-based modules** để phân vùng components theo feature:

```
_components/
├── layout/           # Navigation, shell components
├── s2s/              # Safe-to-Spend related components
├── wallet/           # Cash wallet components
└── quick-add/        # Quick-add transaction components
```

### **Financial Integrity Rules (Non-Negotiable)**

- **Money as `string`**: Tất cả giá trị tiền tệ phải được truyền dưới dạng `string` và tính toán bằng `Decimal.js` để tránh sai số dấu phẩy động.
- **BigInt IDs as `string`**: Các ID `BIGINT` từ TiDB phải được giữ dưới dạng `string` trong TypeScript (sử dụng `mode: "string"` trong Drizzle).
- **Soft Delete Only**: Sử dụng cột `deleted_at`, không bao giờ dùng `DELETE` cứng cho các bản ghi tài chính.
- **Idempotency Keys**: Bắt buộc cho tất cả các request tạo/sửa dữ liệu tài chính (POST/PATCH/PUT).

---

## 🎨 STYLING & UI (Antigravity Standard)

### **Design Language**
- **S2S is Hero**: Khoảng Chi Tiêu An Toàn là con số quan trọng nhất, hiển thị lớn nhất (2.5x so với card khác).
- **Color Psychology**: 
  - ✅ S2S > 0 → Emerald (#10B981) → An toàn.
  - ❌ S2S ≤ 0 → Red (#EF4444) → Nguy hiểm.
- **Aesthetics**: Sử dụng Glassmorphism, đổ bóng tầng thấp, và micro-animations từ `motion/react`.

---

## 🔄 DATA FLOW

```
[User Action in UI]
       ↓
[Component State Update / TanStack Mutation]
       ↓
[API Call via @finance/api-client]
       ↓
[Hono.js API Layer]
       ↓
[Drizzle ORM → TiDB Serverless]
       ↓
[Success Response]
       ↓
[React Query Cache Invalidation]
       ↓
[UI Re-render with New S2S Value]
```

---

## 📚 DOCUMENTATION STANDARDS

Mọi thay đổi quan trọng về cấu trúc hoặc logic nghiệp vụ phải được ghi lại trong thư mục `doc/`:

- **Permanent Docs (`doc/wiki/`)**: Cập nhật khi có thay đổi về Architecture hoặc Database Schema.
- **Feature Updates (`doc/update-feature/`)**: Tạo mới khi hoàn thành một tính năng (VD: `UPDATE_20240421_GOALS_CRUD.md`).
- **Hotfixes (`doc/hot-fix/`)**: Ghi lại nguyên nhân và cách xử lý các lỗi nghiêm trọng.
- **Known Issues (`doc/problem`)**: Luôn cập nhật các lỗi hiện tại và blockers để AI/Developer có thể tiếp tục công việc.

---

## 🎓 AI ASSISTANT DIRECTIVES

### Khi tạo code:
1. **LUÔN LUÔN** kiểm tra cấu trúc file hiện tại trước khi tạo mới.
2. **ƯU TIÊN** chỉnh sửa các component module-based trong `_components/`.
3. **SỬ DỤNG** TypeScript với kiểu dữ liệu tường minh (explicit types).
4. **GIỮ** ngôn ngữ UI là Tiếng Việt.
5. **TUÂN THỦ** quy tắc tiền tệ là `string`.

---
**Last Updated:** April 19, 2026  
**Document Version:** 1.2 (Antigravity Standard)