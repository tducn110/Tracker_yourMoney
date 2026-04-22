# 💰 Finance Tracker V3 - S2S (Safe-to-Spend)

**Ứng dụng quản lý tài chính cá nhân theo triết lý Behavioral Finance**

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.12-38bdf8?style=flat-square&logo=tailwindcss)

---

## 🎯 Về Dự Án

**Finance Tracker V3** là ứng dụng quản lý tài chính thế hệ mới, tập trung vào **"Khoảng Chi Tiêu An Toàn" (Safe-to-Spend - S2S)** thay vì chỉ theo dõi thu chi truyền thống.

### Triết lý S2S

> **"Bạn có bao nhiêu tiền AN TOÀN để chi tiêu hôm nay?"**

S2S tự động tính toán số tiền bạn có thể chi tiêu mỗi ngày sau khi:
- ✅ Đã trừ các hóa đơn định kỳ
- ✅ Đã trừ tiền dành cho mục tiêu tiết kiệm
- ✅ Đã trừ quỹ dự phòng

---

## ✨ Features

### Core Features
- 💎 **S2S Hero Section** - Hiển thị khoảng chi tiêu an toàn theo ngày/tuần/tháng
- 💸 **Quick Transaction Input** - Nhập giao dịch nhanh với categories
- 🤖 **AI Chat Input** - Nhập giao dịch bằng ngôn ngữ tự nhiên
- 💳 **Cash Wallet Widget** - Theo dõi ví tiền mặt
- 📊 **Analytics Dashboard** - Phân tích chi tiêu chi tiết
- 🎯 **Goals Management** - Quản lý mục tiêu tiết kiệm
- 🧾 **Bills Tracking** - Theo dõi hóa đơn định kỳ
- 📝 **Transaction History** - Lịch sử giao dịch đầy đủ

### UI/UX
- 🎨 Minimalist white theme với primary blue (#4361ee)
- 📱 Fully responsive (Mobile-first design)
- ✨ Smooth animations với Motion (Framer Motion)
- 🌙 Dark mode ready (future)

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 16.2.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.1.12
- **State Management:** React Query 5.99.0
- **HTTP Client:** Axios 1.15.0
- **Animations:** Motion 12.23.24
- **Charts:** Recharts 2.15.2
- **Icons:** Lucide React 0.487.0
- **UI Components:** Radix UI + shadcn/ui

### Backend (Ready for Integration)
- **API:** Hono.js
- **Database:** TiDB Serverless + Drizzle ORM
- **Architecture:** Monorepo with Turborepo

---

## 📦 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd finance-tracker-v3

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

---

## 🏃 Quick Start

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
/src/app/
├── (auth)/                         # Auth routes (no layout)
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── (dashboard)/                    # Dashboard routes (with sidebar)
│   ├── layout.tsx                 # Sidebar + Header wrapper
│   ├── page.tsx                   # Main dashboard
│   ├── transactions/page.tsx
│   ├── goals/page.tsx
│   ├── bills/page.tsx
│   ├── analytics/page.tsx
│   └── settings/page.tsx
│
├── _components/                    # Reusable components
│   ├── s2s/                       # S2S module
│   │   └── S2SHeroSection.tsx
│   ├── wallet/                    # Wallet module
│   │   └── CashWalletStrip.tsx
│   ├── quick-add/                 # Quick input module
│   │   ├── QuickInputBar.tsx
│   │   ├── ChatQuickAdd.tsx
│   │   └── QuickAddModal.tsx
│   ├── layout/                    # Layout components
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/                        # shadcn/ui components
│
├── _lib/                          # Utilities & hooks
│   ├── api/                       # API client (future)
│   └── hooks/                     # React Query hooks (future)
│
├── layout.tsx                     # Root layout
├── page.tsx                       # Root redirect
└── providers.tsx                  # React Query provider
```

---

## 🎨 Design System

### Colors
- **Primary:** `#4361ee` (Blue)
- **Background:** `#F8FAFC` (Light gray)
- **Text:** `#1E293B` (Dark slate)

### Typography
- **Font:** Inter (Google Fonts)
- **Sizes:** Tailwind default scale

### Components
- Rounded corners: `rounded-xl`, `rounded-2xl`
- Shadows: Soft, subtle shadows
- Animations: Spring-based transitions

---

## 🔌 API Integration (Ready)

Dự án đã sẵn sàng để integrate backend API:

```typescript
// Example: /src/app/_lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Example: /src/app/_lib/hooks/useS2S.ts
import { useQuery } from '@tanstack/react-query';

export function useS2S(userId: string, period: string) {
  return useQuery({
    queryKey: ['s2s', userId, period],
    queryFn: () => apiClient.get('/s2s', { params: { userId, period } }),
  });
}
```

---

## 📖 Documentation

- **[QUICKSTART.md](./doc/wiki/QUICKSTART.md)** - Quick start guide
- **[BACKEND_REQUIREMENTS.md](./doc/wiki/BACKEND_REQUIREMENTS.md)** - API specifications
- **[DATABASE_SCHEMA.md](./doc/wiki/DATABASE_SCHEMA.md)** - Database schema (v12.0)
- **[SYSTEM_ARCHITECTURE.md](./doc/wiki/SYSTEM_ARCHITECTURE.md)** - System Architecture

---

## 🛠️ Development

### Adding New Pages

```tsx
// /src/app/(dashboard)/new-page/page.tsx
'use client';

export default function NewPage() {
  return <div>New Page</div>;
}
```

### Adding New Components

```tsx
// /src/app/_components/module/Component.tsx
'use client'; // If uses hooks/events

export function Component() {
  return <div>Component</div>;
}
```

### Using API Hooks

```tsx
'use client';

import { useS2S } from '../_lib/hooks/useS2S';

export default function DashboardPage() {
  const { data, isLoading } = useS2S('user-id', 'weekly');
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{data.safeToSpend}</div>;
}
```

---

## 🧪 Testing

```bash
# Run tests (future)
npm run test

# Run E2E tests (future)
npm run test:e2e
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

1. Build: `npm run build`
2. Start: `npm run start`
3. Server runs on port 3000

---

## 🗺️ Roadmap

### Phase 1 ✅ (Completed)
- [x] Next.js 16 migration
- [x] Module-based component structure
- [x] All core pages
- [x] S2S Hero Section
- [x] Quick transaction input

### Phase 2 🚧 (In Progress)
- [x] Backend API integration
- [x] Real-time data fetching
- [x] Data persistence
- [ ] User authentication
- [ ] Multi-region sync optimization

### Phase 3 📅 (Planned)
- [ ] Advanced analytics
- [ ] Budget predictions
- [ ] Multi-currency support
- [ ] Export reports (PDF, Excel)
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Developer:** Your Name
- **Framework:** Next.js 16
- **Design:** Minimalist UI/UX

---

## 📞 Support

- **Documentation:** See `/docs` folder
- **Issues:** [GitHub Issues](your-repo-url/issues)
- **Email:** your-email@example.com

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Vercel** - Deployment platform
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **Radix UI** - Accessible components

---

**Made with ❤️ and ☕ by Finance Tracker Team**

---

## 🎯 Quick Links

- [Live Demo](#) (Coming soon)
- [API Documentation](./doc/wiki/BACKEND_REQUIREMENTS.md)
- [System Architecture](./doc/wiki/SYSTEM_ARCHITECTURE.md)
- [Quickstart Guide](./doc/wiki/QUICKSTART.md)

---

**Last Updated:** 18/04/2026  
**Version:** 3.1.0  
**Status:** ✅ Production Ready
