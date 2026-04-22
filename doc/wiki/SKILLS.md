# 🎯 SKILLS.md — AI IDE Context Configuration

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

| Technology          | Version    | Purpose                       | Import Pattern                              |
| ------------------- | ---------- | ----------------------------- | ------------------------------------------- |
| **Next.js**         | 16.2.4+    | React framework (App Router)  | Built-in                                    |
| **React**           | 18.3.1     | UI library                    | `import { useState } from 'react'`          |
| **TypeScript**      | 5.x        | Type safety                   | `.tsx`, `.ts` files                         |
| **Tailwind CSS**    | 4.1.12+    | Styling (v4 with Vite plugin) | Inline classes                              |
| **Motion**          | 12.23.24   | Animations                    | `import { motion } from 'motion/react'`     |
| **Lucide React**    | 0.487+     | Icon library                  | `import { Icon } from 'lucide-react'`       |
| **Recharts**        | 2.15.2     | Charts (Donut, Bar, Line)     | `import { ... } from 'recharts'`            |
| **Radix UI**        | (multiple) | Headless UI primitives        | `@radix-ui/react-*`                         |
| **React Hook Form** | 7.55.0     | Form management               | `import { useForm } from 'react-hook-form'` |
| **Sonner**          | 2.0.3      | Toast notifications           | `import { toast } from 'sonner'`            |
| **React Query**     | 5.99.0     | Server state management       | `@tanstack/react-query`                     |
| **Axios**           | 1.15.0     | HTTP client                   | `import axios from 'axios'`                 |
| **date-fns**        | 3.6.0      | Date utilities                | `import { format } from 'date-fns'`         |
| **canvas-confetti** | 1.9.4      | Goal completion effect        | `import confetti from 'canvas-confetti'`    |

### **Backend (Planned — Hono.js)**

| Technology              | Version | Purpose                         |
| ----------------------- | ------- | ------------------------------- |
| **Hono.js**             | 4.x     | Edge-compatible web framework   |
| **Vercel Edge Runtime** | —       | Serverless deployment           |
| **TiDB Serverless**     | —       | MySQL-compatible cloud database |
| **Drizzle ORM**         | 0.30+   | Type-safe query builder         |
| **Jose**                | 5.x     | JWT (Web Crypto API compatible) |
| **Zod**                 | 3.x     | Schema validation               |
| **OpenAI SDK**          | 4.x     | NLP Quick-Add parsing           |
| **Resend**              | 3.x     | Email notifications             |
| **Upstash Redis**       | —       | Rate limiting, cache            |

---

## 📁 PROJECT STRUCTURE

### **Current Next.js 16 App Router**

```
/
├── src/
│   ├── app/
│   │   ├── (auth)/                   # Route group: unauthenticated pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/              # Route group: authenticated pages
│   │   │   ├── layout.tsx            # Dashboard shell (Sidebar + Header)
│   │   │   ├── page.tsx              # Dashboard home (index)
│   │   │   ├── transactions/page.tsx
│   │   │   ├── goals/page.tsx
│   │   │   ├── bills/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── _components/              # ✅ NEW: Module-based components
│   │   │   ├── layout/               # Header, Sidebar
│   │   │   ├── s2s/                  # S2SHeroSection
│   │   │   ├── wallet/               # CashWalletStrip
│   │   │   └── quick-add/            # QuickAddModal, ChatQuickAdd, QuickInputBar
│   │   ├── components/               # ⚠️ OLD: Legacy components (migration từ React Router)
│   │   │   ├── ui/                   # shadcn/ui primitives (60+ components)
│   │   │   ├── figma/                # ImageWithFallback (protected)
│   │   │   ├── Layout.tsx            # Old Layout (deprecated)
│   │   │   ├── S2SHeroSection.tsx    # Old (duplicated in _components/s2s/)
│   │   │   ├── CashWalletWidget.tsx
│   │   │   ├── ChatQuickAdd.tsx
│   │   │   ├── QuickAddModal.tsx
│   │   │   ├── QuickInputBar.tsx
│   │   │   └── CategoryManager.tsx
│   │   ├── pages/                    # ⚠️ OLD: React Router pages (deprecated)
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Goals.tsx
│   │   │   ├── Bills.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Wireframes.tsx
│   │   ├── data/
│   │   │   └── mockData.ts           # Mock data (dev mode)
│   │   ├── hooks/
│   │   │   └── useAPI.ts             # React hooks for API calls
│   │   ├── services/
│   │   │   └── api.ts                # APIClient class
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Root redirect
│   │   ├── providers.tsx             # React Query provider
│   │   ├── App.tsx                   # Legacy RouterProvider
│   │   └── routes.tsx                # Legacy React Router config
│   ├── styles/
│   │   ├── theme.css                 # Design tokens (CSS custom properties)
│   │   ├── fonts.css                 # Font imports
│   │   ├── index.css                 # Global styles
│   │   └── tailwind.css              # Tailwind directives
│   └── imports/                      # Figma imports, assets, docs
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts               # ❌ NOT USED (Tailwind v4 via Vite plugin)
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

### **Naming Conventions**

```typescript
// ✅ CORRECT
export function S2SHeroSection() { ... }                    // PascalCase component
export function SubduedMetricCard({ title, amount }: Props) // PascalCase with typed props

// ✅ CORRECT — utility functions
export function formatVND(amount: number): string { ... }   // camelCase
export const calculateS2S = (data: FinanceData) => { ... }  // camelCase

// ❌ INCORRECT
export function s2sHeroSection() { ... }                    // Wrong casing
export const SubduedMetricCard = ({ ... }) => { ... }      // Arrow function for components (prefer function declaration)
```

### **Component File Structure**

```typescript
'use client'; // ← REQUIRED for client components in Next.js App Router

/**
 * ComponentName — Feature Description
 * Brief description of component responsibility
 */

import { useState } from 'react';
import { Icon } from 'lucide-react';
import { motion } from 'motion/react';
// ... other imports

// ─── Type Definitions ─────────────────────────────────────────────────────────
interface ComponentProps {
  title: string;
  amount: number;
  onAction?: () => void;
}

// ─── Sub-Components (if any) ──────────────────────────────────────────────────
function SubComponent({ ... }: SubProps) {
  return <div>...</div>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ComponentName({ title, amount, onAction }: ComponentProps) {
  const [state, setState] = useState(0);

  return (
    <motion.div
      className="p-4 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Component JSX */}
    </motion.div>
  );
}
```

---

## 🎨 STYLING GUIDELINES

### **Tailwind CSS v4 Usage**

```typescript
// ✅ PREFER — Inline Tailwind classes
<div className="p-4 rounded-xl bg-white shadow-sm">

// ✅ CORRECT — Conditional classes
<div className={cn(
  "p-4 rounded-xl",
  isActive && "bg-blue-500 text-white",
  !isActive && "bg-gray-100"
)}>

// ⚠️ AVOID — Custom CSS unless necessary
// Use theme.css tokens for brand colors
```

### **Design Tokens (theme.css)**

```css
/* Use CSS custom properties from theme.css */
--primary: #4361ee; /* Blue primary */
--background: #ffffff; /* White bg */
--foreground: #1a1a1a; /* Dark text */
--muted: #ececf0; /* Light gray */
--radius: 0.625rem; /* 10px border-radius */
```

### **Color Usage**

| Color            | Hex/Class                 | Usage                             |
| ---------------- | ------------------------- | --------------------------------- |
| **Blue Primary** | `#4361ee` / `blue-600`    | Primary buttons, active states    |
| **Emerald**      | `#10B981` / `emerald-500` | Income, positive values, S2S > 0  |
| **Red**          | `#EF4444` / `red-500`     | Expense, negative values, S2S < 0 |
| **Indigo**       | `#6366F1` / `indigo-600`  | Gradient accents                  |
| **Gray**         | `#ececf0` / `gray-100`    | Muted backgrounds                 |

### **Typography**

```typescript
// ❌ NEVER use Tailwind text size classes (text-xl, text-2xl)
// ❌ NEVER use font-weight classes (font-bold, font-semibold)
// ❌ NEVER use line-height classes (leading-tight)

// ✅ USE semantic HTML tags
<h1>Main Heading</h1>          // Default styling from theme.css
<h2>Section Title</h2>
<p>Body text</p>

// ✅ ONLY override if user explicitly requests
<h1 className="text-4xl font-bold">Custom Size</h1>
```

---

## 🔗 ROUTING PATTERNS

### **Next.js App Router (Current)**

```typescript
// Pages are automatically routed based on folder structure
/app/(dashboard)/page.tsx           → /
/app/(dashboard)/transactions/page.tsx → /transactions
/app/(auth)/login/page.tsx          → /login

// Layouts wrap nested routes
/app/(dashboard)/layout.tsx         → Wraps all dashboard pages
/app/layout.tsx                     → Wraps entire app
```

### **Navigation**

```typescript
// ✅ CORRECT — Use Next.js Link
import Link from 'next/link';
<Link href="/transactions" className="...">Transactions</Link>

// ✅ CORRECT — Programmatic navigation
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');

// ❌ INCORRECT — Don't use React Router (legacy)
import { useNavigate } from 'react-router';  // DEPRECATED
```

---

## 📡 API INTEGRATION PATTERNS

// Flag to switch between mock and real API
const USE_MOCK = false; // ← Default: false

// Prod/Dev mode → Uses TiDB Serverless via Hono.js API
import { mockFinanceData, mockTransactions } from '../data/mockData';

// Future → Use React Query + Axios
import { useFinanceData } from '../hooks/useAPI';
const { data, loading, error } = useFinanceData();

````

### **API Client Structure**

```typescript
// src/app/services/api.ts
class APIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

  async getFinanceData(): Promise<FinanceData> {
    // When backend ready, calls Hono.js API
    // Currently returns mock data
  }

  async createTransaction(data: CreateTransactionDTO): Promise<Transaction> {
    // ...
  }
}

export const apiClient = new APIClient();
````

### **React Hooks Pattern**

```typescript
// src/app/hooks/useAPI.ts
export function useFinanceData() {
  return useAPIData<FinanceData>(() => apiClient.getFinanceData());
}

export function useTransactions(filters: TransactionFilters) {
  return useAPIData<Transaction[]>(
    () => apiClient.getTransactions(filters),
    [filters.month, filters.category],
  );
}
```

---

## 🛠️ DEVELOPMENT GUIDELINES

### **File Creation Rules**

```bash
# ✅ CREATE new components in _components/
/src/app/_components/feature-name/ComponentName.tsx

# ⚠️ AVOID creating in old /components/ (legacy)
/src/app/components/NewComponent.tsx  # Don't use this anymore

# ✅ CREATE new pages in (dashboard)/ or (auth)/
/src/app/(dashboard)/new-page/page.tsx

# ❌ NEVER create in /pages/ (React Router legacy)
/src/app/pages/NewPage.tsx  # DEPRECATED
```

### **Import Path Aliases**

```typescript
// tsconfig.json paths configured:
import { Component } from "@/app/_components/feature/Component";
import { useAPI } from "@/app/hooks/useAPI";
import { mockData } from "@/app/data/mockData";
import "@/styles/theme.css";

// ✅ PREFER absolute imports for clarity
import { S2SHeroSection } from "@/app/_components/s2s/S2SHeroSection";

// ⚠️ AVOID relative imports if deep nested
import { Component } from "../../../_components/feature/Component";
```

### **Type Safety**

```typescript
// ✅ ALWAYS type props interfaces
interface CardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  onClick?: () => void;
}

// ✅ ALWAYS type function returns
function formatVND(amount: number): string { ... }

// ✅ ALWAYS type API responses
interface FinanceData {
  safeToSpend: number;
  totalIncome: number;
  totalExpense: number;
  period: string;
}
```

### **State Management**

```typescript
// ✅ LOCAL state → useState
const [isOpen, setIsOpen] = useState(false);

// ✅ SERVER state → React Query (future)
const { data, isLoading } = useQuery({
  queryKey: ["finance-data"],
  queryFn: () => apiClient.getFinanceData(),
});

// ✅ GLOBAL state → React Context (if needed)
// Currently NOT used, prefer prop drilling or React Query
```

---

## 🚀 BUSINESS LOGIC RULES

### **S2S (Safe-to-Spend) Calculation**

```typescript
// Formula (calculated on backend via Hono.js services)
S2S =
  Total_Income -
  Actual_Expense -
  Fixed_Costs_Pending -
  Goals_Allocation -
  Emergency_Buffer;

// UI Display Rules:
// ✅ S2S > 0 → GREEN (#10B981 emerald-500) → "Bạn có thể tiêu"
// ❌ S2S ≤ 0 → RED (#EF4444 red-500) → "Vượt ngân sách"
```

data flow này

### **Data Flow**

```
[User Action in UI]
       ↓
[Component State Update]
       ↓
[API Call via useAPI hook]  ← Currently returns mock data
       ↓
[Future: Hono.js API on Vercel Edge]
       ↓
[Drizzle ORM → TiDB Serverless]
       ↓
[Response → React Query Cache]
       ↓
[UI Re-render]
```

---

## 🎯 KEY FEATURES TO MAINTAIN

### **1. S2S Hero Section (Top Priority)**

- **Component:** `/src/app/_components/s2s/S2SHeroSection.tsx`
- **Design:** Full-width dark card, 2.5× larger than metric cards
- **Colors:**
  - Positive S2S → `bg-emerald-500` with gradient
  - Negative S2S → `bg-red-500` with gradient
- **Animation:** Smooth number transitions via Motion

### **2. Cash Wallet Strip**

- **Component:** `/src/app/_components/wallet/CashWalletStrip.tsx`
- **Feature:** Quick-sync cash wallet button
- **Position:** Full-width horizontal strip between metric cards and transactions

### **3. Quick-Add Transactions**

- **Components:**
  - `QuickAddModal.tsx` — FAB form modal
  - `ChatQuickAdd.tsx` — AI chat-based quick-add
  - `QuickInputBar.tsx` — Inline quick input
- **NLP:** "ăn sáng 30k" → parsed by OpenAI API (future backend integration)

### **4. Dashboard Layout**

```
┌─────────────────────────────────────────────────┐
│  S2S HERO SECTION (full-width, dark, large)    │
├─────────────────────────────────────────────────┤
│  Income Card  │  Expense Card  │  Bills Card   │ ← Subdued metric cards
├─────────────────────────────────────────────────┤
│  CASH WALLET STRIP (horizontal, isolated)      │
├─────────────────────────────────────────────────┤
│  Transactions (8/12)  │  Bills (4/12)          │
│  Goals (8/12)         │                         │
└─────────────────────────────────────────────────┘
```

---

## 📦 PACKAGE INSTALLATION RULES

```bash
# ✅ ALWAYS check package.json first
cat package.json

# ✅ Install if NOT present
npm install package-name

# ⚠️ SPECIFIC VERSION REQUIREMENTS
npm install react-hook-form@7.55.0  # Must use this version

# ✅ Peer dependencies for @mui/material
npm install @emotion/react @emotion/styled @mui/icons-material

# ✅ Import Motion correctly
import { motion } from 'motion/react';  # NOT from 'framer-motion'
```

---

## 🔒 PROTECTED FILES (DO NOT EDIT)

```
/src/app/components/figma/ImageWithFallback.tsx  ← System component
/pnpm-lock.yaml                                   ← Lockfile
```

---

## 🌍 INTERNATIONALIZATION

```typescript
// Language: Vietnamese (Tiếng Việt)
// Currency: VNĐ (₫)
// Number format: vi-VN locale

// ✅ CORRECT
const formatted = new Intl.NumberFormat("vi-VN").format(12500000);
// Output: "12.500.000"

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "₫";
}
// Output: "12.500.000₫"

// Date format
import { format } from "date-fns";
format(new Date(), "dd/MM/yyyy"); // Vietnamese format
```

---

## 🐛 DEBUGGING TIPS

```typescript
// ✅ Check if running in client component
console.log("Is Client:", typeof window !== "undefined");

// ✅ Check API mode
console.log("USE_REAL_API:", USE_REAL_API);
console.log("API Base URL:", process.env.NEXT_PUBLIC_API_URL);

// ✅ Inspect mock data
import { mockFinanceData } from "@/app/data/mockData";
console.log("Mock Data:", mockFinanceData);

// ✅ Check React Query dev tools (future)
// Automatically available in dev mode when React Query integrated
```

---

## 📝 COMMIT MESSAGE CONVENTIONS

```bash
# Format: <type>(<scope>): <subject>

feat(s2s): add S2S Hero Section with gradient animation
fix(wallet): correct cash wallet sync calculation
refactor(components): migrate Layout to _components/layout/
docs(skills): update AI IDE context with new patterns
chore(deps): upgrade Next.js to 16.2.4
```

---

## 🎓 BEST PRACTICES SUMMARY

### ✅ DO

- Use `'use client'` directive for client components
- Use Next.js `<Link>` for navigation
- Import Motion from `'motion/react'`
- Use shadcn/ui components from `/components/ui/`
- Type all props and function returns
- Follow module-based component organization
- Use Vietnamese for all UI text
- Format currency with `formatVND()` utility
- Check package.json before installing packages
- Use mock data until backend is ready

### ❌ DON'T

- Use React Router hooks (`useNavigate`, `useParams` from 'react-router')
- Create new CSS files (use Tailwind inline)
- Use Framer Motion (use Motion instead)
- Override font sizes/weights without user request
- Edit protected files (ImageWithFallback, lockfiles)
- Create components in old `/components/` folder
- Use English in UI (Vietnamese only)
- Hardcode API URLs (use env variables)
- Mix old and new component patterns

---

## 🔮 FUTURE ROADMAP

1. **Backend Integration** → Integrate Hono.js API (replace mock data)
2. **React Query Migration** → Full server state management
3. **Authentication** → JWT-based auth with Hono.js backend
4. **Real-time Updates** → WebSocket for live S2S updates
5. **OCR Receipt Scanning** → OpenAI Vision API integration
6. **PWA Support** → Offline-first with service workers
7. **Component Library Cleanup** → Remove deprecated `/components/` folder

---

## 📞 AI ASSISTANT DIRECTIVES

### When generating code:

1. **ALWAYS** check existing file structure first
2. **PREFER** editing existing components over creating new ones
3. **FOLLOW** the module-based organization in `_components/`
4. **USE** TypeScript with explicit types
5. **MAINTAIN** Vietnamese UI text
6. **RESPECT** the S2S Hero Section design priority
7. **ASK** if user wants mock data or backend integration

### When user asks to "add feature X":

1. Check if similar component exists in `_components/`
2. Propose location for new component
3. Ask about data source (mock vs API)
4. Implement with proper TypeScript types
5. Follow existing styling patterns

### When debugging:

1. Check if `'use client'` is present
2. Verify import paths are correct
3. Check package.json for dependencies
4. Suggest React Query dev tools for API debugging

---

**Last Updated:** April 18, 2026  
**Document Version:** 1.0  
**Maintained by:** AI Development Team for Finance Tracker V3
