'use client';

/**
 * Dev Guide / UI Style Guide — Finance Tracker V3
 * Tổng hợp pattern, component, color token, cách add UI mới.
 * No motion/react — pure CSS transitions.
 */

import { useState } from 'react';
import {
  Code2, Palette, Layout, Component, Plus, Check, Info,
  TrendingUp, TrendingDown, Wallet, Target, Receipt,
  ChevronRight, Layers, BarChart3, Copy,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CodeBlock({ code, language = 'tsx' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <><Check size={11} /> Đã copy!</> : <><Copy size={11} /> Copy</>}
        </button>
      </div>
      <pre className="p-4 text-[12px] text-gray-300 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={16} className="text-blue-600" />
      </div>
      <div>
        <h2 className="text-[17px] font-black text-gray-900">{title}</h2>
        {subtitle && <p className="text-[12px] font-bold text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-100 my-8" />;
}

// ─── Color Palette ─────────────────────────────────────────────────────────────

const COLOR_TOKENS = [
  { name: 'Primary Blue',   hex: '#4361ee', usage: 'Màu chủ đạo, button, highlight' },
  { name: 'Emerald (income)', hex: '#059669', usage: 'Thu nhập, success states' },
  { name: 'Red (expense)',  hex: '#dc2626', usage: 'Chi tiêu, danger, overbudget' },
  { name: 'Amber (warning)', hex: '#d97706', usage: 'Cảnh báo, gần hết ngân sách' },
  { name: 'Violet (goals)', hex: '#7c3aed', usage: 'Mục tiêu, savings' },
  { name: 'Dark Navy',      hex: '#0f172a', usage: 'Sidebar background' },
  { name: 'Gray-900',       hex: '#111827', usage: 'Primary text' },
  { name: 'Gray-400',       hex: '#9ca3af', usage: 'Muted text, placeholders' },
];

function ColorSwatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div
        className="w-10 h-10 rounded-xl shrink-0 shadow-sm"
        style={{ backgroundColor: hex }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-black text-gray-900">{name}</p>
        <p className="text-[10px] font-bold text-gray-500">{hex} · {usage}</p>
      </div>
    </div>
  );
}

// ─── Component Preview ────────────────────────────────────────────────────────

function StatCardPreview() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-0.5">
      {[
        { icon: TrendingUp,   label: 'Thu nhập',   value: '25.000.000₫', bg: '#ecfdf5', border: '#a7f3d0', color: '#059669' },
        { icon: TrendingDown, label: 'Chi tiêu',   value: '12.700.000₫', bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
        { icon: Wallet,       label: 'Ví của tôi', value: '25.250.000₫', bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb' },
      ].map(({ icon: Icon, label, value, bg, border, color }) => (
        <div
          key={label}
          className="flex-1 min-w-[130px] p-4 rounded-2xl border"
          style={{ backgroundColor: bg, borderColor: border }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl bg-white/70 flex items-center justify-center">
              <Icon size={13} style={{ color }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>{label}</p>
          </div>
          <p className="text-[17px] font-black leading-none" style={{ color }}>{value}</p>
          <p className="text-[10px] font-bold text-gray-500 mt-1.5">Tháng 4/2026</p>
        </div>
      ))}
    </div>
  );
}

function BadgePreview() {
  const badges = [
    { label: 'Thu nhập',      bg: '#d1fae5', color: '#065f46' },
    { label: 'Chi tiêu',      bg: '#fee2e2', color: '#991b1b' },
    { label: 'Đang chạy',     bg: '#eff6ff', color: '#2563eb' },
    { label: 'Gần hết',       bg: '#fef3c7', color: '#b45309' },
    { label: 'Vượt ngân sách', bg: '#fee2e2', color: '#dc2626' },
    { label: 'Hoàn thành',    bg: '#d1fae5', color: '#059669' },
    { label: 'Tạm dừng',      bg: '#f3f4f6', color: '#6b7280' },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span
          key={b.label}
          className="text-[11px] font-black px-2.5 py-1 rounded-full"
          style={{ backgroundColor: b.bg, color: b.color }}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

function ButtonPreview() {
  return (
    <div className="flex flex-wrap gap-3">
      <button className="px-4 py-2.5 rounded-xl text-[12px] font-black text-white active:scale-95 transition-all"
        style={{ backgroundColor: '#4361ee', boxShadow: '0 4px 12px #4361ee40' }}>
        Primary
      </button>
      <button className="px-4 py-2.5 rounded-xl text-[12px] font-black text-white active:scale-95 transition-all"
        style={{ backgroundColor: '#059669', boxShadow: '0 4px 12px #05966940' }}>
        Thu nhập
      </button>
      <button className="px-4 py-2.5 rounded-xl text-[12px] font-black text-white active:scale-95 transition-all"
        style={{ backgroundColor: '#dc2626', boxShadow: '0 4px 12px #dc262640' }}>
        Chi tiêu
      </button>
      <button className="px-4 py-2.5 rounded-xl text-[12px] font-black bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition-all">
        Ghost
      </button>
      <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-black bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 active:scale-95 transition-all">
        <Plus size={13} /> Tạo mới
      </button>
    </div>
  );
}

// ─── Steps (How to add UI) ────────────────────────────────────────────────────

const STEPS = [
  {
    step: '01',
    title: 'Tạo file component',
    desc: 'Tạo file .tsx mới trong thư mục module tương ứng',
    detail: 'src/app/_components/{module}/TênComponent.tsx\nModule: dashboard, budgets, wallet, quick-add, layout',
    color: '#4361ee',
  },
  {
    step: '02',
    title: 'Dùng mock data',
    desc: 'Import từ @/app/data/mockData.ts',
    detail: 'import { mockBudgets, mockWallets, formatVND } from \'@/app/data/mockData\';',
    color: '#059669',
  },
  {
    step: '03',
    title: 'Không dùng motion/react',
    desc: 'Dùng CSS transitions thuần, không import từ motion/react',
    detail: 'className="transition-all duration-200"\nstyle={{ transition: \'transform 0.2s\' }}\n// KHÔNG: import { motion } from \'motion/react\'',
    color: '#dc2626',
  },
  {
    step: '04',
    title: 'Dùng useNavigate cho routing',
    desc: 'Import từ react-router, không dùng next/link hoặc next/navigation',
    detail: 'import { useNavigate } from \'react-router\';\nconst navigate = useNavigate();\nnavigate(\'/transactions\');',
    color: '#7c3aed',
  },
  {
    step: '05',
    title: 'Import vào Dashboard page',
    desc: 'Thêm vào src/app/(dashboard)/page.tsx hoặc trang tương ứng',
    detail: 'import { TênComponent } from \'@/app/_components/module/TênComponent\';\n// Thêm vào JSX:\n<TênComponent />',
    color: '#d97706',
  },
  {
    step: '06',
    title: 'Thêm route mới (nếu cần)',
    desc: 'Cập nhật src/app/routes.tsx',
    detail: 'import NewPage from \'./(dashboard)/new-page/page\';\n// Thêm vào children:\n{ path: \'new-page\', Component: NewPage }',
    color: '#059669',
  },
];

const FOLDER_STRUCTURE = `src/app/
├── (auth)/                  # Login, Register pages
├── (dashboard)/             # Dashboard layout + pages
│   ├── layout.tsx           # Sidebar + Header wrapper
│   ├── page.tsx             # ← Dashboard chính
│   ├── transactions/        # /transactions route
│   ├── budgets/             # /budgets + /budgets/:id
│   ├── goals/               # /goals
│   ├── bills/               # /bills
│   ├── analytics/           # /analytics
│   └── settings/            # /settings
├── _components/             # Shared components
│   ├── dashboard/           # OverviewSummaryCard, RecentTransactionsCard...
│   ├── budgets/             # BudgetGrid, BudgetCard, BudgetFormModal
│   ├── wallet/              # MultiWalletStrip, WalletCard, WalletSyncModal
│   ├── quick-add/           # SimpleQuickInput
│   ├── layout/              # Sidebar, Header
│   └── wallet/              # Components ví
├── data/
│   └── mockData.ts          # ← Tất cả mock data + types
└── routes.tsx               # ← Router config`;

const COMPONENT_TEMPLATE = `'use client';

/**
 * TênComponent — Mô tả ngắn gọn
 * No motion/react — pure CSS transitions.
 */

import { useState } from 'react';
import { SomeIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockData, formatVND } from '@/app/data/mockData';

// ─── Sub-components ────────────────────────────────────────

function SubComponent({ prop }: { prop: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {/* Content */}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────

export function TênComponent() {
  const navigate = useNavigate();
  const [state, setState] = useState(false);

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <SomeIcon size={14} className="text-blue-600" />
          </div>
          <h2 className="text-[14px] font-black text-gray-900">Tiêu đề</h2>
        </div>
        <button
          onClick={() => navigate('/route')}
          className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Tất cả →
        </button>
      </div>

      {/* Content */}
      <SubComponent prop="value" />
    </section>
  );
}`;

const STATS_TEMPLATE = `// Pattern: Stat cell (card nhỏ với màu nền)
function StatCell({ icon, label, value, sublabel, colorText, colorBg, colorBorder }) {
  return (
    <div
      className="flex-1 min-w-[130px] p-4 rounded-2xl border"
      style={{ backgroundColor: colorBg, borderColor: colorBorder }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-xl bg-white/70 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: colorText }}>
          {label}
        </p>
      </div>
      <p className="text-[18px] font-black leading-none" style={{ color: colorText }}>{value}</p>
      <p className="text-[10px] font-bold text-gray-500 mt-1.5">{sublabel}</p>
    </div>
  );
}`;

const PROGRESS_TEMPLATE = `// Pattern: Progress bar với màu động
const barColor = percent >= 100 ? '#ef4444' : percent >= 80 ? '#f59e0b' : '#4361ee';

<div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
  <div
    className="h-full rounded-full transition-all duration-700"
    style={{ width: \`\${Math.min(percent, 100)}%\`, backgroundColor: barColor }}
  />
</div>`;

// ─── Page Component ────────────────────────────────────────────────────────────

export default function DevGuidePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'patterns' | 'howto'>('overview');

  const tabs = [
    { key: 'overview'    as const, label: 'Tổng quan',       icon: Layout },
    { key: 'components'  as const, label: 'Components',      icon: Component },
    { key: 'patterns'    as const, label: 'Code Patterns',   icon: Code2 },
    { key: 'howto'       as const, label: 'Cách Add UI',     icon: Plus },
  ];

  return (
    <div className="p-4 md:p-6 pb-24 max-w-[960px] mx-auto space-y-6">

      {/* Page header */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #4361ee 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Code2 size={20} className="text-blue-300" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-white">UI Style Guide</h1>
            <p className="text-[11px] font-bold text-blue-300">Finance Tracker V3 · Design System</p>
          </div>
        </div>
        <p className="text-[12px] font-bold text-blue-200 mt-2">
          Tổng hợp quy tắc, pattern, color token và cách thêm UI component mới vào dự án.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-black transition-all shrink-0 active:scale-95"
            style={
              activeTab === key
                ? { backgroundColor: '#4361ee', color: '#fff', boxShadow: '0 2px 8px #4361ee40' }
                : { backgroundColor: 'transparent', color: '#6b7280' }
            }
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Tổng quan ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">

          {/* Tech stack */}
          <div>
            <SectionTitle icon={Layout} title="Tech Stack" subtitle="Công nghệ sử dụng trong dự án" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'React 18',     desc: 'UI framework',              emoji: '⚛️' },
                { name: 'TypeScript',   desc: 'Type safety',               emoji: '🔷' },
                { name: 'Tailwind v4',  desc: 'CSS utility classes',       emoji: '🎨' },
                { name: 'react-router', desc: 'Client routing (không next/link)', emoji: '🔀' },
                { name: 'Lucide React', desc: 'Icon library',              emoji: '🔲' },
                { name: 'Recharts',     desc: 'Charts & graphs',           emoji: '📊' },
                { name: 'Sonner',       desc: 'Toast notifications',       emoji: '🔔' },
                { name: 'Hono.js',      desc: 'Backend API (Monorepo)',     emoji: '🔥' },
                { name: 'Mock Data',    desc: 'src/app/data/mockData.ts',  emoji: '🗄️' },
              ].map(({ name, desc, emoji }) => (
                <div key={name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 flex items-center gap-3">
                  <span className="text-[20px]">{emoji}</span>
                  <div>
                    <p className="text-[12px] font-black text-gray-900">{name}</p>
                    <p className="text-[10px] font-bold text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* Folder structure */}
          <div>
            <SectionTitle icon={Layers} title="Cấu trúc thư mục" subtitle="Module-based architecture" />
            <CodeBlock code={FOLDER_STRUCTURE} language="folder" />
          </div>

          <Divider />

          {/* Color tokens */}
          <div>
            <SectionTitle icon={Palette} title="Color Tokens" subtitle="Bảng màu chủ đạo của dự án" />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-2">
                {COLOR_TOKENS.map((c) => <ColorSwatch key={c.hex} {...c} />)}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─── Tab: Components ─── */}
      {activeTab === 'components' && (
        <div className="space-y-8">

          {/* Stat cards */}
          <div>
            <SectionTitle icon={BarChart3} title="Stat Cards" subtitle="Card nhỏ hiển thị số liệu tổng quan" />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
              <StatCardPreview />
            </div>
          </div>

          <Divider />

          {/* Badges */}
          <div>
            <SectionTitle icon={Info} title="Status Badges" subtitle="Nhãn trạng thái — text-[9-11px] font-black px-1.5-2.5 py-0.5 rounded-full" />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
              <BadgePreview />
            </div>
          </div>

          <Divider />

          {/* Buttons */}
          <div>
            <SectionTitle icon={Component} title="Buttons" subtitle="Các kiểu button — rounded-xl, font-black, active:scale-95, transition-all" />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
              <ButtonPreview />
            </div>
          </div>

          <Divider />

          {/* Card patterns */}
          <div>
            <SectionTitle icon={Layout} title="Card Patterns" subtitle="Quy tắc thiết kế card" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: 'Card cơ bản',           style: 'bg-white rounded-2xl border border-gray-100 shadow-sm',                desc: 'Dùng cho hầu hết card' },
                { title: 'Card gradient (banner)', style: 'rounded-2xl (gradient nền)',                                          desc: 'Dùng cho hero/summary section' },
                { title: 'Card dashed (CTA)',       style: 'rounded-2xl border-2 border-dashed border-gray-200',                  desc: 'Dùng cho "Thêm mới" button' },
                { title: 'Card màu nền',            style: 'rounded-2xl border (background màu nhạt)',                           desc: 'Dùng cho stat cells' },
              ].map(({ title, style, desc }) => (
                <div key={title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <p className="text-[12px] font-black text-gray-900 mb-1">{title}</p>
                  <p className="text-[10px] font-black text-blue-600 mb-1.5">{style}</p>
                  <p className="text-[10px] font-bold text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ─── Tab: Code Patterns ─── */}
      {activeTab === 'patterns' && (
        <div className="space-y-8">

          {/* Component template */}
          <div>
            <SectionTitle icon={Code2} title="Component Template" subtitle="Boilerplate chuẩn cho mọi component mới" />
            <CodeBlock code={COMPONENT_TEMPLATE} />
          </div>

          <Divider />

          {/* Stat cell pattern */}
          <div>
            <SectionTitle icon={BarChart3} title="Stat Cell Pattern" subtitle="Card nhỏ hiển thị số liệu với màu nền" />
            <CodeBlock code={STATS_TEMPLATE} />
          </div>

          <Divider />

          {/* Progress bar */}
          <div>
            <SectionTitle icon={Target} title="Progress Bar Pattern" subtitle="Progress bar với màu động theo ngưỡng" />
            <CodeBlock code={PROGRESS_TEMPLATE} />
          </div>

          <Divider />

          {/* Rules */}
          <div>
            <SectionTitle icon={Info} title="Quy tắc bắt buộc" subtitle="Những điều KHÔNG được làm" />
            <div className="space-y-2">
              {[
                { ok: false, text: "import { motion } from 'motion/react' — Dùng CSS transitions thuần" },
                { ok: false, text: "import Link from 'next/link' — Dùng useNavigate từ react-router" },
                { ok: false, text: "import { useRouter } from 'next/navigation' — Dùng useNavigate từ react-router" },
                { ok: true,  text: "className=\"transition-all duration-200\" — CSS transition ok" },
                { ok: true,  text: "import { useNavigate } from 'react-router' — Routing đúng cách" },
                { ok: true,  text: "import from '@/app/data/mockData' — Dùng alias @/ đúng cách" },
                { ok: true,  text: "font-black text-[Xpx] — Text sizing dùng px, không dùng Tailwind text-xl" },
              ].map(({ ok, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: ok ? '#ecfdf5' : '#fef2f2' }}
                >
                  <span className="text-[14px] mt-0.5">{ok ? '✅' : '❌'}</span>
                  <p className="text-[12px] font-bold" style={{ color: ok ? '#065f46' : '#991b1b' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ─── Tab: Cách Add UI ─── */}
      {activeTab === 'howto' && (
        <div className="space-y-5">

          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
            <p className="text-[12px] font-black text-blue-700">
              📋 Hướng dẫn từng bước để thêm UI component mới vào Finance Tracker V3
            </p>
          </div>

          {STEPS.map(({ step, title, desc, detail, color }) => (
            <div key={step} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color + '18' }}
                >
                  <span className="text-[14px] font-black" style={{ color }}>{step}</span>
                </div>
                <div>
                  <p className="text-[14px] font-black text-gray-900">{title}</p>
                  <p className="text-[11px] font-bold text-gray-500">{desc}</p>
                </div>
              </div>
              {/* Code */}
              <div className="p-4 bg-gray-50">
                <pre className="text-[11px] font-bold text-gray-700 leading-relaxed whitespace-pre-wrap">{detail}</pre>
              </div>
            </div>
          ))}

          <Divider />

          {/* Checklist */}
          <div>
            <SectionTitle icon={Check} title="Checklist trước khi push" subtitle="Kiểm tra trước khi hoàn thành component" />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {[
                'Không import từ motion/react',
                'Không import từ next/link hoặc next/navigation',
                'Dùng useNavigate từ react-router để navigate',
                'Dùng @/ alias thay vì relative path dài',
                'Font size dùng text-[Xpx], không dùng text-xl/2xl/...',
                'Mỗi list item có key prop duy nhất',
                'Responsive: hoạt động tốt ở cả mobile lẫn desktop',
                'Mock data từ mockData.ts, không hardcode trong component',
                'CSS transition: duration-200 hoặc duration-700 cho progress bar',
                'Button có active:scale-95 transition-all',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-5 h-5 rounded-md bg-blue-50 border-2 border-blue-200 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-blue-600" />
                  </div>
                  <p className="text-[12px] font-bold text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* Quick reference */}
          <div>
            <SectionTitle icon={ChevronRight} title="Quick Reference" subtitle="Import hay dùng" />
            <CodeBlock
              code={`// ── Navigation ──
import { useNavigate } from 'react-router';
const navigate = useNavigate();
navigate('/transactions'); // route tuyệt đối

// ── Mock Data ──
import {
  mockTransactions, mockWallets, mockBudgets, mockGoals,
  formatVND, getTotalWalletBalance,
} from '@/app/data/mockData';

// ── Icons (lucide-react) ──
import { TrendingUp, TrendingDown, Wallet, Target, Receipt } from 'lucide-react';

// ── Toast ──
import { toast } from 'sonner';
toast.success('✅ Thành công!');
toast.error('❌ Có lỗi xảy ra');

// ── formatVND ──
formatVND(25_000_000) // → "25.000.000₫"`}
            />
          </div>

        </div>
      )}

    </div>
  );
}
