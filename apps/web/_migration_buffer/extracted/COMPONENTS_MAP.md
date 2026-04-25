# 🗺️ COMPONENTS_MAP.md — Component Architecture & Usage Guide

> **Mục đích:** Document chi tiết phân vùng components theo modules, component tree hierarchy, props interfaces, và usage examples để AI hiểu rõ cách sử dụng từng component.

---

## 📊 COMPONENT ORGANIZATION OVERVIEW

Finance Tracker V3 sử dụng **Module-Based Component Architecture** với 2 layers:

### **Layer 1: New Module-Based Components** (✅ Recommended)
```
/src/app/_components/
├── layout/           # Navigation & shell components
├── s2s/              # Safe-to-Spend related components
├── wallet/           # Cash wallet components
└── quick-add/        # Quick-add transaction components
```

### **Layer 2: Legacy Components** (⚠️ Deprecated)
```
/src/app/components/
├── ui/               # shadcn/ui primitives (KEEP - still used)
├── figma/            # Figma system components (PROTECTED)
├── Layout.tsx        # Old shell (deprecated → use (dashboard)/layout.tsx)
├── S2SHeroSection.tsx    # Old (→ moved to _components/s2s/)
├── CashWalletWidget.tsx  # Old (→ renamed to CashWalletStrip in _components/wallet/)
├── ChatQuickAdd.tsx      # Old (→ moved to _components/quick-add/)
├── QuickAddModal.tsx     # Old (→ moved to _components/quick-add/)
├── QuickInputBar.tsx     # Old (→ moved to _components/quick-add/)
└── CategoryManager.tsx   # ⚠️ Not yet migrated
```

---

## 🏗️ COMPONENT TREE HIERARCHY

```
RootLayout (src/app/layout.tsx)
│
├─ Providers (src/app/providers.tsx)
│  └─ QueryClientProvider (React Query)
│
├─ Route: /login (src/app/(auth)/login/page.tsx)
│
├─ Route: /register (src/app/(auth)/register/page.tsx)
│
└─ Route: / (Dashboard Layout - src/app/(dashboard)/layout.tsx)
   ├─ Sidebar (src/app/_components/layout/Sidebar.tsx)
   ├─ Header (src/app/_components/layout/Header.tsx)
   │
   └─ Outlet (nested pages)
      │
      ├─ Dashboard Page (src/app/(dashboard)/page.tsx)
      │  ├─ S2SHeroSection
      │  ├─ SubduedMetricCard (x3) [Internal component]
      │  ├─ CashWalletStrip
      │  ├─ TransactionsList [Internal component]
      │  ├─ GoalsList [Internal component]
      │  └─ BillsList [Internal component]
      │
      ├─ Transactions Page (src/app/(dashboard)/transactions/page.tsx)
      ├─ Goals Page (src/app/(dashboard)/goals/page.tsx)
      ├─ Bills Page (src/app/(dashboard)/bills/page.tsx)
      ├─ Analytics Page (src/app/(dashboard)/analytics/page.tsx)
      └─ Settings Page (src/app/(dashboard)/settings/page.tsx)
```

---

## 📁 MODULE 1: Layout Components

### **1.1 Sidebar** (`_components/layout/Sidebar.tsx`)

**Purpose:** Main navigation sidebar with menu items  
**Status:** ✅ Implemented  
**Used In:** Dashboard Layout (`(dashboard)/layout.tsx`)

#### Props Interface
```typescript
// No props - standalone component
```

#### Usage Example
```typescript
import { Sidebar } from '@/app/_components/layout/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

#### Key Features
- Active link highlighting
- Menu items: Dashboard, Transactions, Goals, Bills, Analytics, Settings
- Responsive collapse on mobile
- Icon-based navigation (Lucide React icons)

---

### **1.2 Header** (`_components/layout/Header.tsx`)

**Purpose:** Top header with user profile, notifications, quick actions  
**Status:** ✅ Implemented  
**Used In:** Dashboard Layout (`(dashboard)/layout.tsx`)

#### Props Interface
```typescript
// No props - standalone component
```

#### Usage Example
```typescript
import { Header } from '@/app/_components/layout/Header';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

#### Key Features
- User avatar with dropdown menu
- Notification bell icon
- Quick-add FAB trigger
- Breadcrumb navigation (future)

---

## 📁 MODULE 2: S2S Components

### **2.1 S2SHeroSection** (`_components/s2s/S2SHeroSection.tsx`)

**Purpose:** **HERO COMPONENT** - Displays Safe-to-Spend calculation with large visual prominence  
**Status:** ✅ Implemented  
**Used In:** Dashboard Page (`(dashboard)/page.tsx`)

#### Props Interface
```typescript
interface S2SHeroSectionProps {
  safeToSpend: number;         // Amount in VND
  isOverBudget: boolean;       // true if S2S < 0
  totalIncome: number;         // Monthly income
  totalExpense: number;        // Monthly expense
  fixedCostsPending: number;   // Unpaid bills
  goalsAllocation: number;     // Monthly goals contribution
  emergencyBuffer: number;     // User emergency buffer
  period: string;              // "YYYY-MM" format
}
```

#### Usage Example
```typescript
import { S2SHeroSection } from '@/app/_components/s2s/S2SHeroSection';
import { mockS2SData } from '@/app/data/mockData';

export default function DashboardPage() {
  // Future: Replace with API call
  const s2sData = mockS2SData;

  return (
    <div className="space-y-6">
      <S2SHeroSection {...s2sData} />
      {/* Other dashboard components */}
    </div>
  );
}
```

#### Component Structure
```typescript
'use client';

import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatVND } from '@/app/data/mockData';

export function S2SHeroSection({ 
  safeToSpend, 
  isOverBudget, 
  totalIncome,
  totalExpense,
  fixedCostsPending,
  goalsAllocation,
  emergencyBuffer,
  period 
}: S2SHeroSectionProps) {
  return (
    <motion.div
      className={cn(
        "relative p-8 rounded-2xl overflow-hidden",
        isOverBudget 
          ? "bg-gradient-to-br from-red-500 to-red-600" 
          : "bg-gradient-to-br from-emerald-500 to-emerald-600"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Large S2S amount display */}
      <div className="text-white text-6xl font-bold">
        {formatVND(safeToSpend)}
      </div>
      
      {/* Breakdown tooltip */}
      <div className="mt-4 text-white/80 text-sm">
        Thu nhập: {formatVND(totalIncome)} - 
        Chi tiêu: {formatVND(totalExpense)} - 
        Hóa đơn: {formatVND(fixedCostsPending)} - 
        Mục tiêu: {formatVND(goalsAllocation)} - 
        Dự phòng: {formatVND(emergencyBuffer)}
      </div>
    </motion.div>
  );
}
```

#### Design Rules
- **Size:** 2.5× larger than metric cards
- **Colors:**
  - Positive S2S → `bg-emerald-500` to `bg-emerald-600` gradient
  - Negative S2S → `bg-red-500` to `bg-red-600` gradient
- **Animation:** Fade in + slide up on mount
- **Typography:** Text size **NOT restricted** (uses `text-6xl`)
- **Position:** Always first element on Dashboard

---

## 📁 MODULE 3: Wallet Components

### **3.1 CashWalletStrip** (`_components/wallet/CashWalletStrip.tsx`)

**Purpose:** Horizontal strip showing cash wallet balance with quick-sync action  
**Status:** ✅ Implemented  
**Used In:** Dashboard Page (`(dashboard)/page.tsx`)

#### Props Interface
```typescript
interface CashWalletStripProps {
  balance: number;              // Current cash balance
  lastSyncedAt: string;         // ISO date string
  onSync: () => void;           // Sync button callback
}
```

#### Usage Example
```typescript
import { CashWalletStrip } from '@/app/_components/wallet/CashWalletStrip';
import { useState } from 'react';

export default function DashboardPage() {
  const [cashBalance, setCashBalance] = useState(500000);
  const [lastSynced, setLastSynced] = useState(new Date().toISOString());

  const handleSync = async () => {
    // Future: Call API to sync cash wallet
    const newBalance = prompt('Nhập số dư ví thực tế:');
    if (newBalance) {
      setCashBalance(Number(newBalance));
      setLastSynced(new Date().toISOString());
    }
  };

  return (
    <div className="space-y-6">
      <S2SHeroSection {...s2sData} />
      <CashWalletStrip 
        balance={cashBalance} 
        lastSyncedAt={lastSynced}
        onSync={handleSync}
      />
    </div>
  );
}
```

#### Component Structure
```typescript
'use client';

import { Wallet, RefreshCw } from 'lucide-react';
import { formatVND } from '@/app/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function CashWalletStrip({ balance, lastSyncedAt, onSync }: CashWalletStripProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
      <div className="flex items-center gap-3">
        <Wallet className="w-6 h-6 text-amber-600" />
        <div>
          <p className="text-sm text-amber-900/60">Ví tiền mặt</p>
          <p className="text-2xl font-bold text-amber-900">{formatVND(balance)}</p>
        </div>
      </div>
      
      <button 
        onClick={onSync}
        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
      >
        <RefreshCw className="w-4 h-4" />
        Đồng bộ
      </button>
    </div>
  );
}
```

#### Key Features
- Full-width horizontal layout
- Amber color scheme (differentiate from other components)
- Last synced time display (relative time)
- Quick sync button with icon
- Responsive padding

---

## 📁 MODULE 4: Quick-Add Components

### **4.1 QuickAddModal** (`_components/quick-add/QuickAddModal.tsx`)

**Purpose:** FAB-triggered modal for quick transaction entry  
**Status:** ✅ Implemented  
**Trigger:** Floating Action Button (FAB) in Header

#### Props Interface
```typescript
interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: CreateTransactionDTO) => Promise<void>;
}

interface CreateTransactionDTO {
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  note: string;
  date: string; // ISO date
}
```

#### Usage Example
```typescript
import { QuickAddModal } from '@/app/_components/quick-add/QuickAddModal';
import { useState } from 'react';

export default function DashboardLayout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (data: CreateTransactionDTO) => {
    // Future: Call API
    console.log('New transaction:', data);
    // await apiClient.createTransaction(data);
    setIsModalOpen(false);
  };

  return (
    <>
      <Header onOpenQuickAdd={() => setIsModalOpen(true)} />
      <QuickAddModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
      {children}
    </>
  );
}
```

#### Component Structure
```typescript
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Select } from '@/app/components/ui/select';
import { useForm } from 'react-hook-form';

export function QuickAddModal({ isOpen, onClose, onSubmit }: QuickAddModalProps) {
  const { register, handleSubmit } = useForm<CreateTransactionDTO>();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm giao dịch nhanh</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            type="number" 
            placeholder="Số tiền" 
            {...register('amount', { required: true })} 
          />
          <Select {...register('type')}>
            <option value="income">Thu nhập</option>
            <option value="expense">Chi tiêu</option>
          </Select>
          <Input 
            type="text" 
            placeholder="Ghi chú" 
            {...register('note')} 
          />
          <Button type="submit">Lưu</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

### **4.2 ChatQuickAdd** (`_components/quick-add/ChatQuickAdd.tsx`)

**Purpose:** AI chat-based quick-add using NLP ("ăn sáng 30k")  
**Status:** ✅ Implemented  
**Trigger:** Special button in Header or Dashboard

#### Props Interface
```typescript
interface ChatQuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: CreateTransactionDTO) => Promise<void>;
}
```

#### Usage Example
```typescript
import { ChatQuickAdd } from '@/app/_components/quick-add/ChatQuickAdd';

export default function DashboardLayout({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatSubmit = async (data: CreateTransactionDTO) => {
    // Future: OpenAI API parses natural language
    // "ăn sáng 30k" → { amount: 30000, type: 'expense', category_id: 1, note: 'ăn sáng' }
    console.log('Parsed transaction:', data);
    setIsChatOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsChatOpen(true)}>
        💬 Thêm bằng chat
      </button>
      <ChatQuickAdd 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSubmit={handleChatSubmit}
      />
    </>
  );
}
```

#### Component Structure
```typescript
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

export function ChatQuickAdd({ isOpen, onClose, onSubmit }: ChatQuickAddProps) {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    // Future: Parse message via OpenAI API
    // const parsed = await apiClient.parseNaturalLanguage(message);
    // await onSubmit(parsed);
    
    // Mock parsing
    const amount = parseInt(message.match(/\d+k?/)?.[0] || '0') * 1000;
    await onSubmit({
      amount,
      type: 'expense',
      category_id: 1,
      note: message,
      date: new Date().toISOString()
    });
    
    setMessage('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>💬 Thêm giao dịch bằng chat</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            Ví dụ: "ăn sáng 30k", "lương tháng 4 20 triệu"
          </p>
          
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập giao dịch..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          
          <Button onClick={handleSend} className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Gửi
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

### **4.3 QuickInputBar** (`_components/quick-add/QuickInputBar.tsx`)

**Purpose:** Inline quick input bar (alternative to modal)  
**Status:** ✅ Implemented  
**Used In:** Dashboard Page (optional inline mode)

#### Props Interface
```typescript
interface QuickInputBarProps {
  onSubmit: (transaction: CreateTransactionDTO) => Promise<void>;
  placeholder?: string;
}
```

#### Usage Example
```typescript
import { QuickInputBar } from '@/app/_components/quick-add/QuickInputBar';

export default function DashboardPage() {
  const handleQuickSubmit = async (data: CreateTransactionDTO) => {
    console.log('Quick input:', data);
  };

  return (
    <div className="space-y-6">
      <QuickInputBar 
        onSubmit={handleQuickSubmit}
        placeholder="Thêm nhanh: ăn sáng 30k..."
      />
      {/* Rest of dashboard */}
    </div>
  );
}
```

---

## 📁 MODULE 5: UI Primitives (shadcn/ui)

**Location:** `/src/app/components/ui/`  
**Status:** ✅ Keep all — used throughout app  
**Total Components:** 60+ primitives

### **Commonly Used Primitives**

#### **5.1 Button**
```typescript
import { Button } from '@/app/components/ui/button';

<Button variant="default" size="md">Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" size="sm">Delete</Button>
```

#### **5.2 Dialog**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

#### **5.3 Sheet (Drawer)**
```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet';

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Drawer</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Drawer Title</SheetTitle>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

#### **5.4 Card**
```typescript
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### **5.5 Input**
```typescript
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

<div>
  <Label htmlFor="amount">Số tiền</Label>
  <Input id="amount" type="number" placeholder="0" />
</div>
```

#### **5.6 Select**
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Chọn danh mục" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="food">Ăn uống</SelectItem>
    <SelectItem value="transport">Di chuyển</SelectItem>
  </SelectContent>
</Select>
```

#### **5.7 Tabs**
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

<Tabs defaultValue="income">
  <TabsList>
    <TabsTrigger value="income">Thu nhập</TabsTrigger>
    <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
  </TabsList>
  <TabsContent value="income">Income content</TabsContent>
  <TabsContent value="expense">Expense content</TabsContent>
</Tabs>
```

#### **5.8 Toast (Sonner)**
```typescript
import { toast } from 'sonner';

// Success
toast.success('Lưu thành công!');

// Error
toast.error('Có lỗi xảy ra');

// Loading
toast.loading('Đang xử lý...');

// Custom
toast('Custom message', {
  description: 'Additional info',
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo')
  }
});
```

---

## 📁 MODULE 6: Page Components

### **6.1 Dashboard Page** (`(dashboard)/page.tsx`)

**Route:** `/`  
**Layout:** Dashboard Layout with Sidebar + Header  
**Status:** ✅ Implemented

#### Page Structure
```typescript
'use client';

import { S2SHeroSection } from '@/app/_components/s2s/S2SHeroSection';
import { CashWalletStrip } from '@/app/_components/wallet/CashWalletStrip';
import { mockS2SData, mockTransactions, mockGoals, mockBills } from '@/app/data/mockData';

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Row 1: S2S Hero */}
      <S2SHeroSection {...mockS2SData} />
      
      {/* Row 2: Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SubduedMetricCard title="Thu nhập" amount={20000000} />
        <SubduedMetricCard title="Chi tiêu" amount={15000000} />
        <SubduedMetricCard title="Hóa đơn" amount={3000000} />
      </div>
      
      {/* Row 3: Cash Wallet */}
      <CashWalletStrip balance={500000} lastSyncedAt={new Date().toISOString()} onSync={() => {}} />
      
      {/* Row 4: Transactions + Bills */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <TransactionsList transactions={mockTransactions} />
          <GoalsList goals={mockGoals} />
        </div>
        <div className="col-span-4">
          <BillsList bills={mockBills} />
        </div>
      </div>
    </div>
  );
}
```

---

### **6.2 Transactions Page** (`(dashboard)/transactions/page.tsx`)

**Route:** `/transactions`  
**Status:** ⚠️ Placeholder (needs implementation)

#### Planned Structure
```typescript
'use client';

import { useState } from 'react';
import { useTransactions } from '@/app/hooks/useAPI';
import { Tabs } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';

export default function TransactionsPage() {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const { data, loading } = useTransactions({ type: filter });

  return (
    <div className="p-6">
      <h1>Lịch sử giao dịch</h1>
      
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="income">Thu nhập</TabsTrigger>
          <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Transaction list with filters */}
    </div>
  );
}
```

---

### **6.3 Goals Page** (`(dashboard)/goals/page.tsx`)

**Route:** `/goals`  
**Status:** ⚠️ Placeholder

#### Planned Features
- Goal cards with progress bars
- "Add New Goal" button
- Confetti animation on completion (canvas-confetti)

---

### **6.4 Bills Page** (`(dashboard)/bills/page.tsx`)

**Route:** `/bills`  
**Status:** ⚠️ Placeholder

#### Planned Features
- Recurring bills list
- "Mark as Paid" button
- Payment history

---

### **6.5 Analytics Page** (`(dashboard)/analytics/page.tsx`)

**Route:** `/analytics`  
**Status:** ⚠️ Placeholder

#### Planned Features
- Category spending donut chart (Recharts)
- Monthly trend line chart
- Income vs Expense bar chart

---

### **6.6 Settings Page** (`(dashboard)/settings/page.tsx`)

**Route:** `/settings`  
**Status:** ⚠️ Placeholder

#### Planned Features
- User profile settings
- Emergency buffer configuration
- Budget settings
- Notification preferences

---

## 🔧 UTILITY FUNCTIONS

### **formatVND** (`data/mockData.ts`)

```typescript
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

// Usage
formatVND(12500000); // "12.500.000₫"
```

### **cn** (Tailwind class merger)

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-blue-500",
  !isActive && "bg-gray-100"
)} />
```

---

## 📦 COMPONENT IMPORT PATTERNS

### **Absolute Imports (Preferred)**
```typescript
// ✅ Use tsconfig paths
import { S2SHeroSection } from '@/app/_components/s2s/S2SHeroSection';
import { Button } from '@/app/components/ui/button';
import { useAPI } from '@/app/hooks/useAPI';
import { mockData } from '@/app/data/mockData';
```

### **Relative Imports (Avoid if deep nested)**
```typescript
// ⚠️ Only use for same-level components
import { SubComponent } from './SubComponent';

// ❌ Avoid deep relative paths
import { Component } from '../../../_components/feature/Component';
```

---

## 🎨 COMPONENT STYLING PATTERNS

### **Motion Animation**
```typescript
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Animated content */}
</motion.div>
```

### **Conditional Styling**
```typescript
import { cn } from '@/app/components/ui/utils';

<div className={cn(
  "base-class",
  condition && "conditional-class",
  variant === 'primary' && "primary-variant",
  variant === 'secondary' && "secondary-variant"
)} />
```

### **Responsive Grid**
```typescript
// 3 columns on desktop, 1 on mobile
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

// 2/3 - 1/3 split
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-8">Left</div>
  <div className="col-span-12 md:col-span-4">Right</div>
</div>
```

---

## 🚨 DEPRECATED COMPONENTS (DO NOT USE)

### **Legacy Components to Avoid**
```typescript
// ❌ DO NOT USE - Deprecated
import { Layout } from '@/app/components/Layout';              // Use (dashboard)/layout.tsx
import { S2SHeroSection } from '@/app/components/S2SHeroSection';  // Use _components/s2s/
import { CashWalletWidget } from '@/app/components/CashWalletWidget'; // Use _components/wallet/CashWalletStrip

// ❌ DO NOT USE - React Router
import { useNavigate } from 'react-router';
import { RouterProvider } from 'react-router';
```

---

## 📝 COMPONENT CREATION CHECKLIST

When creating a new component:

- [ ] Place in appropriate `_components/` module folder
- [ ] Add `'use client'` directive if uses hooks/state
- [ ] Define TypeScript interface for props
- [ ] Use formatVND() for currency
- [ ] Use Vietnamese text for UI
- [ ] Import Motion from 'motion/react'
- [ ] Use shadcn/ui primitives from `/components/ui/`
- [ ] Add Motion animations if appropriate
- [ ] Follow existing naming conventions
- [ ] Test with mock data first

---

## 🔮 FUTURE COMPONENT ROADMAP

### **Components to Create**
1. `_components/transactions/TransactionCard.tsx` — Individual transaction item
2. `_components/goals/GoalCard.tsx` — Goal progress card with confetti
3. `_components/bills/BillCard.tsx` — Bill item with "Pay" button
4. `_components/analytics/CategoryChart.tsx` — Donut chart wrapper
5. `_components/analytics/TrendChart.tsx` — Line chart wrapper
6. `_components/shared/CategoryManager.tsx` — Migrate from old location

### **Components to Refactor**
1. Move `CategoryManager.tsx` → `_components/shared/`
2. Delete old `/components/` (except ui/ and figma/)
3. Consolidate all quick-add variants

---

**Last Updated:** April 16, 2026  
**Document Version:** 1.0  
**Maintained by:** AI Development Team for Finance Tracker V3
