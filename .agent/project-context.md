# 🎯 S2S Finance — Project Context & Standards

> **Mục đích:** Cung cấp đầy đủ bối cảnh hệ thống cho AI Coding Assistants để hiểu rõ cấu trúc monorepo, quy trình xử lý tài chính và các công cụ thông minh.

## 📋 Project Overview
- **Project Name:** Finance Tracker V3 (S2S Finance)
- **Concept:** Quản lý tài chính dựa trên triết lý Behavioral Finance (Safe-to-Spend).
- **Architecture:** Monorepo Turborepo (Next.js + Hono.js + Drizzle ORM).
- **Database:** TiDB Serverless (MySQL).

## 🛠️ Development Tools & Intelligence

| Tool | Purpose | Mandatory |
|------|---------|-----------|
| **GitNexus** | Code Impact Analysis & Call Graph Tracing | ✅ Yes (Before any refactor) |
| **Drizzle Studio** | Visual database management | Recommended |
| **pino** | Structured logging | ✅ Yes |

## 🏗️ Tech Stack
- **Frontend:** Next.js 16 (App Router), Tailwind CSS v4, Motion, TanStack Query.
- **Backend:** Hono.js, Edge Runtime.
- **Data Layer:** Drizzle ORM, TiDB Serverless.
- **Validation:** Zod (Shared schemas).
- **Precision:** Decimal.js (All money as `string`).

## 📁 Core Structure
- `apps/web`: Frontend application.
- `apps/api`: Backend API services.
- `packages/db`: Database schemas & repositories.
- `packages/shared-schemas`: Single source of truth for validation.

---
*Last Updated: 2026-04-20*
