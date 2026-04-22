# ⚡ QUICKSTART — Finance Tracker V3 (Next.js)

Hướng dẫn nhanh để chạy dự án sau khi migration.

---

## 🚀 Start Development Server

```bash
npm run dev
```

Mở browser: **http://localhost:3000**

→ Tự động redirect đến `/login`

---

## 📍 Routes Available

| Route | Description |
|-------|-------------|
| `/login` | Trang đăng nhập |
| `/register` | Trang đăng ký |
| `/` | Dashboard chính (S2S Hero + Widgets) |
| `/transactions` | Danh sách giao dịch |
| `/goals` | Quản lý mục tiêu tiết kiệm |
| `/bills` | Theo dõi hóa đơn định kỳ |
| `/analytics` | Báo cáo & phân tích |
| `/settings` | Cài đặt người dùng |

---

## 🧩 Components Location

### Core Components (Module-based)

```
/src/app/_components/
├── s2s/S2SHeroSection.tsx          # Khoảng Chi Tiêu An Toàn
├── wallet/CashWalletStrip.tsx      # Cash wallet widget
├── quick-add/
│   ├── QuickInputBar.tsx           # Quick transaction input
│   └── ChatQuickAdd.tsx            # AI chat input
├── layout/
│   ├── Sidebar.tsx                 # Navigation sidebar
│   └── Header.tsx                  # App header
└── ui/                             # Shadcn UI components
```

### Import Example

```tsx
// In dashboard page
import { S2SHeroSection } from '../_components/s2s/S2SHeroSection';
import { CashWalletStrip } from '../_components/wallet/CashWalletStrip';
import { QuickInputBar } from '../_components/quick-add/QuickInputBar';
```

---

## 🔧 Key Files

| File | Purpose |
|------|---------|
| `/src/app/layout.tsx` | Root layout (HTML, Providers) |
| `/src/app/page.tsx` | Root redirect |
| `/src/app/providers.tsx` | React Query setup |
| `/next.config.ts` | Next.js configuration |
| `/package.json` | Dependencies & scripts |

---

## 🎨 Styling

- **Tailwind CSS 4.1.12** (configured)
- **Custom theme:** `/src/styles/theme.css`
- **Fonts:** `/src/styles/fonts.css`
- **Global:** `/src/styles/index.css`

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.4 | Framework |
| `@tanstack/react-query` | 5.99.0 | Data fetching |
| `axios` | 1.15.0 | HTTP client |
| `motion` | 12.23.24 | Animations |
| `recharts` | 2.15.2 | Charts |
| `lucide-react` | 0.487.0 | Icons |
| `sonner` | 2.0.3 | Toast notifications |

---

## 🛠️ Development Tips

### 1. Creating New Pages

```tsx
// /src/app/(dashboard)/new-page/page.tsx
'use client';

export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}
```

→ Automatically available at `/new-page`

### 2. Creating New Components

```tsx
// /src/app/_components/module-name/ComponentName.tsx
'use client'; // Add this if component uses hooks/events

export function ComponentName() {
  return <div>Component</div>;
}
```

### 3. Client vs Server Components

**Use `'use client';` when:**
- Component uses `useState`, `useEffect`, `useRef`
- Component has event handlers (`onClick`, `onChange`)
- Component uses animations (`motion/react`)
- Component uses browser-only APIs

**Don't use `'use client';` for:**
- Pure presentation components
- Static content
- Server-side data fetching

---

## 🔄 Migration Status

✅ **COMPLETED**
- Next.js 16 setup
- All pages migrated
- Components organized
- Routing working

⏳ **PENDING** (Next Phase)
- Backend API integration
- Replace mock data with real API calls
- Add loading states
- Error handling

---

## 📚 Documentation

Full documentation available in:
- `/MIGRATION_COMPLETED_SUMMARY.md` - Complete migration overview
- `/MIGRATION_GUIDE_NEXT_STEPS.md` - Step-by-step migration guide
- `/BACKEND_REQUIREMENTS.md` - API specs for backend
- `/DATABASE_SCHEMA.md` - Database schema

---

## 🐛 Troubleshooting

### Port 3000 already in use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Build errors

```bash
# Clean Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Component not found

Check import path:
```tsx
// ❌ Wrong
import { Component } from '../components/Component';

// ✅ Correct
import { Component } from '../_components/module/Component';
```

---

## 🎯 Next Steps

1. ✅ **Run dev server**: `npm run dev`
2. ✅ **Test all routes**: Login → Dashboard → Pages
3. ⏳ **Wait for backend**: Hono.js API ready
4. ⏳ **Integrate API**: Create API client & hooks
5. ⏳ **Replace mocks**: Use real data from backend

---

**Prepared:** 16/04/2026  
**Framework:** Next.js 16.2.4 App Router  
**Status:** ✅ Ready for Development
