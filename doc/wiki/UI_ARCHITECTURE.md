# UI Architecture — Finance Tracker V3

**Giao thức Antigravity V1.2 · Frontend Layer**  
**Ngày cập nhật:** 01/04/2026  
**Stack:** React 18 + Vite + Tailwind CSS v4 + Motion

---

## Triết Lý Thiết Kế: Behavioral Finance UI

Finance Tracker V3 áp dụng **Behavioral Finance** principles vào UI/UX:

1. **Budget là Hero** — Khoảng Chi Tiêu An Toàn là con số DUY NHẤT user cần quan tâm ngay khi mở app
2. **Demote Accounting Metrics** — Thu nhập, chi phí cố định, tiết kiệm là thứ yếu (subdued cards)
3. **Cash Wallet Isolation** — Ví tiền mặt tách biệt hoàn toàn → tránh nhầm lẫn tâm lý
4. **Status Color Psychology** — Xanh lá = an toàn, Vàng = cảnh báo, Đỏ = nguy hiểm

---

## Cấu Trúc Dashboard (Antigravity V1.2)

```
┌─────────────────────────────────────────────────────────────────────┐
│  HÀNG 1 — Budget HERO SECTION (full-width, dark, height ~2.5× card)   │
│  • Element đầu tiên, KHÔNG có gì chen trước                         │
│  • Dark gradient background (#0a0f1e → #111827)                     │
│  • Ring chart + formula breakdown + period switcher                  │
├─────────────────────────────────────────────────────────────────────┤
│  HÀNG 2 — 3 METRIC CARDS (demoted, subdued, gray bg)               │
│  │ Thu Nhập Tháng │ Chi Phí Cố Định │ Cam Kết Tiết Kiệm │          │
│  • Intentionally nhỏ hơn, ít nổi bật hơn Budget Hero                  │
│  • Không icon lớn, không badge %, font mờ hơn                       │
├─────────────────────────────────────────────────────────────────────┤
│  HÀNG 3 — CASH WALLET STRIP (isolated horizontal, amber)            │
│  • Dải ngang mỏng, tách biệt hoàn toàn                             │
│  • Badge "Không tính vào Budget" rõ ràng                               │
│  • Quick Sync inline (không cần navigate)                            │
├────────────────────────────────────┬────────────────────────────────┤
│  HÀNG 4 — CONTENT (Left 8/12)     │  HÀNG 4 — Bills (Right 4/12)  │
│  ┌─ Giao Dịch Gần Đây ───────────┐ │  ┌─ Hóa Đơn Sắp Tới ────────┐ │
│  │  (6 recent transactions)      │ │  │  (all bills with status)  │ │
│  └───────────────────────────────┘ │  └───────────────────────────┘ │
│  ┌─ Mục Tiêu Tiết Kiệm ──────────┐ │                                │
│  │  (4 goals, 2×2 grid)          │ │                                │
│  └───────────────────────────────┘ │                                │
└────────────────────────────────────┴────────────────────────────────┘
```

---

## Component Architecture

### Core Components

| Component         | File                             | Vai trò                          |
| ----------------- | -------------------------------- | -------------------------------- |
| `BudgetOverviewCard`  | `components/BudgetOverviewCard.tsx`  | Hero Section chính — Budget display |
| `CashWalletStrip` | `components/CashWalletStrip.tsx` | Cash wallet isolated strip       |
| `Layout`          | `components/Layout.tsx`          | App shell với sidebar + header   |
| `QuickAddModal`   | `components/QuickAddModal.tsx`   | Modal thêm transaction nhanh     |
| `ChatQuickAdd`    | `components/ChatQuickAdd.tsx`    | Chat AI interface                |

### Page Components

| Page           | Route           | Mô tả                                    |
| -------------- | --------------- | ---------------------------------------- |
| `Dashboard`    | `/`             | Main dashboard (Antigravity V1.2 layout) |
| `Transactions` | `/transactions` | Lịch sử giao dịch                        |
| `Goals`        | `/goals`        | Mục tiêu tiết kiệm                       |
| `Bills`        | `/bills`        | Hóa đơn định kỳ                          |
| `Analytics`    | `/analytics`    | Phân tích chi tiêu                       |
| `UserFlows`    | `/userflows`    | UX flow documentation                    |
| `Settings`     | `/settings`     | Cài đặt tài khoản                        |
| `Wireframes`   | `/wireframes`   | 8-screen wireframe document              |

---

## Budget Hero Section Design Spec

### Layout

```tsx
<BudgetOverviewCard>
  ├── Top Bar: [Shield Icon + Label] + [Period Switcher] ├── Main Body: │ ├──
  Left: Label + Big Amount + Status Badge + Formula │ └── Right: SVG Ring Chart
  (% usage) └── Formula Pills: Income − FixedExp − Savings − Buffer = Budget
</BudgetOverviewCard>
```

### Color System — Budget Status

```
safe    (< 50%) → emerald-400 (#34d399) — ring + glow + status text
warning (50-80%) → amber-400 (#fbbf24)  — ring + glow + status text
danger  (> 80%) → red-400 (#f87171)     — ring + glow + status text
```

### Ring Chart (SVG)

```
radius = (size - strokeWidth*2) / 2
circumference = 2π × radius
strokeDashoffset = circumference − (percent/100) × circumference
Animation: spring(1.6s, [0.34, 1.56, 0.64, 1])
```

### Period Switcher

```
Hôm nay → budget_remaining = daily_budget − spent_today
Tuần    → budget_remaining = weekly_budget − spent_this_week
Tháng   → budget_remaining = monthly_budget − spent_this_month (default)
```

---

## Cash Wallet Strip Design Spec

```
[💳 Icon] [Tên + Timestamp] | [₫ Balance] [SPACER] [Badge: Không Budget] [Quick Sync btn]
```

- **Height:** ~56px (thin strip)
- **Color:** amber gradient (`#fffbeb → #fef3c7`)
- **Border:** `1.5px solid #fde68a`
- **Position:** Hàng 3, sau 3 metric cards, trước content area

### Quick Sync UX

1. Nhấn → Modal mở (không fullscreen)
2. Preview: old balance, new balance, diff
3. If diff > 0: hiển thị "Chi phí không tên" sẽ được tạo
4. Confirm → animate balance update trên strip

---

## API Contract (Frontend ↔ Backend)

Khi backend ready, thay `USE_REAL_API = false` → `true`:

```typescript
// GET /api/budget/summary
type BudgetSummary = {
  period: string;
  budgetBudget: number;
  budgetSpent: number;
  budgetRemaining: number;
  usagePercent: number;
  status: "safe" | "warning" | "danger";
  breakdown: {
    income: number;
    fixedExpenses: number;
    savingsCommitment: number;
    emergencyBuffer: number;
  };
};

// POST /api/transactions
type CreateTransaction = {
  amount: number;
  type: "income" | "expense";
  category_id?: number;
  wallet_id: number;
  note?: string;
  date?: Date;
};
```

---

## Routing (React Router v7)

```
/              → Dashboard (Antigravity V1.2 layout)
/transactions  → Transactions page
/goals         → Goals page
/bills         → Bills page
/analytics     → Analytics page
/userflows     → UserFlows UX documentation
/settings      → Settings page
/wireframes    → 8-screen wireframe (static, no auth)
/login         → Login page (no sidebar)
/register      → Register page (no sidebar)
```

---

## Dependencies

| Package        | Version  | Dùng cho                |
| -------------- | -------- | ----------------------- |
| `react`        | 18.3.1   | Core                    |
| `react-router` | 7.13.0   | Routing                 |
| `motion`       | 12.23.24 | Animation               |
| `lucide-react` | 0.487.0  | Icons                   |
| `recharts`     | 2.15.2   | Charts (Analytics page) |
| `tailwindcss`  | 4.1.12   | Styling                 |
| `sonner`       | 2.0.3    | Toast notifications     |

---

## Conventions

### Naming

- Components: PascalCase (`BudgetOverviewCard`)
- Files: kebab-case (`budget-hero-section.tsx`) → **ngoại lệ**: hiện tại dùng PascalCase cho files
- CSS: Tailwind utilities, không custom CSS classes
- Colors: Inline style cho dynamic values (status-based), Tailwind cho static

### Animation Defaults (Motion)

```typescript
// Spring preset cho hover
whileHover={{ y: -2, scale: 1.02 }}
transition={{ type: "spring", stiffness: 400, damping: 25 }}

// List stagger
containerVariants = { hidden: {opacity:0}, show: {opacity:1, transition:{staggerChildren:0.06}} }
itemVariants = { hidden: {opacity:0, y:14}, show: {opacity:1, y:0, transition:{type:"spring"}} }
```

### VND Formatting

```typescript
export const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(Math.abs(amount)) + "₫";
```

---

_Xem thêm: `SYSTEM_ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `CHANGELOG_AND_SUMMARY.md` trong Monorepo root._
