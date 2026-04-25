/**
 * S2S Hero Section — Antigravity V1.2 (Light Navy)
 * Màu nhạt, hòa hợp với background light gray/blue của app.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ChevronDown, Info, TrendingDown, Flame } from "lucide-react";
import {
  formatVND,
  mockS2SData,
  mockS2SByPeriod,
  type S2SPeriod,
  type S2SStatus,
} from "../data/mockData";

// ─── SVG Ring ────────────────────────────────────────────────────────────────
function S2SRing({
  percent,
  size = 108,
  status,
}: {
  percent: number;
  size?: number;
  status: S2SStatus;
}) {
  const sw = 9;
  const r = (size - sw * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;

  const ringColor =
    status === "danger" ? "#ef4444" : status === "warning" ? "#f59e0b" : "#10b981";

  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(67,97,238,0.1)" strokeWidth={sw} />
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="text-[20px] font-black leading-none"
          style={{ color: ringColor }}
        >
          {percent}%
        </motion.span>
        <span className="text-[8px] font-semibold mt-0.5 text-blue-500/70">đã dùng</span>
      </div>
    </div>
  );
}

// ─── Formula Pill ─────────────────────────────────────────────────────────────
function Pill({ label, sub, accent }: { label: string; sub: string; accent?: boolean }) {
  return (
    <div
      className="flex flex-col items-center px-2.5 py-1.5 rounded-lg"
      style={{
        backgroundColor: accent ? "rgba(16,185,129,0.1)" : "rgba(67,97,238,0.08)",
        border: `1px solid ${accent ? "rgba(16,185,129,0.25)" : "rgba(67,97,238,0.15)"}`,
        minWidth: 58,
      }}
    >
      <span
        className="text-[10px] font-bold"
        style={{ color: accent ? "#059669" : "#4361ee" }}
      >
        {label}
      </span>
      <span className="text-[8px] font-semibold mt-0.5 text-blue-500/60">{sub}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface S2SHeroSectionProps {
  data?: typeof mockS2SData;
}

export function S2SHeroSection({ data = mockS2SData }: S2SHeroSectionProps) {
  const [period, setPeriod] = useState<S2SPeriod>("month");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const periodData = mockS2SByPeriod[period];
  const { spent, remaining, percent, status } = periodData;

  const ringColor =
    status === "danger" ? "#ef4444" : status === "warning" ? "#f59e0b" : "#10b981";

  const statusConfig = {
    safe:    { emoji: "✅", text: "Trong tầm kiểm soát", cls: "text-emerald-700", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
    warning: { emoji: "⚠️", text: "Cần chú ý — >50% đã dùng", cls: "text-amber-700",   bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
    danger:  { emoji: "🚨", text: "Sắp vượt ngân sách!",      cls: "text-red-700",     bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
  }[status];

  const periodLabel = period === "today" ? "Hôm nay" : period === "week" ? "Tuần này" : "Tháng này";

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f8ff 100%)",
        border: "1.5px solid rgba(67,97,238,0.12)",
        boxShadow: "0 2px 20px rgba(67,97,238,0.06)",
      }}
    >
      {/* Subtle top highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(67,97,238,0.25), transparent)" }}
      />

      {/* Soft radial glow behind ring */}
      <div
        className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none hidden sm:block"
        style={{ backgroundColor: ringColor }}
      />

      <div className="relative z-10 px-5 py-4 lg:px-7 lg:py-5">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(67,97,238,0.08)",
                border: "1px solid rgba(67,97,238,0.15)",
              }}
            >
              <ShieldCheck size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-blue-600/70">
                Khoảng Chi Tiêu An Toàn · S2S
              </p>
              <p className="text-[11px] font-medium text-blue-500/50">
                {data.period} · Lương ngày {data.incomeDate} hàng tháng
              </p>
            </div>
          </div>

          {/* Period switcher */}
          <div
            className="flex items-center gap-0.5 p-1 rounded-xl flex-shrink-0"
            style={{
              background: "rgba(67,97,238,0.06)",
              border: "1px solid rgba(67,97,238,0.12)",
            }}
          >
            {(["today", "week", "month"] as S2SPeriod[]).map((p) => (
              <motion.button
                key={p}
                onClick={() => setPeriod(p)}
                whileTap={{ scale: 0.93 }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                style={{
                  background: period === p ? "rgba(67,97,238,0.15)" : "transparent",
                  color: period === p ? "#4361ee" : "rgba(67,97,238,0.4)",
                  border: period === p ? "1px solid rgba(67,97,238,0.25)" : "1px solid transparent",
                }}
              >
                {p === "today" ? "Hôm nay" : p === "week" ? "Tuần" : "Tháng"}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Main body ── */}
        <div className="flex items-center gap-5 lg:gap-8">
          {/* Left: Numbers */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium mb-1 text-blue-600/60">
              Còn lại chi tiêu tự do ({periodLabel})
            </p>

            {/* Big number + status badge */}
            <div className="flex items-end gap-3 mb-2.5 flex-wrap">
              <motion.h2
                key={`${period}-remaining`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="text-[34px] lg:text-[40px] font-black tracking-tight leading-none text-gray-900"
              >
                {formatVND(remaining)}
              </motion.h2>

              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-1 flex-shrink-0"
                style={{ background: statusConfig.bg, border: `1px solid ${statusConfig.border}` }}
              >
                <span className={`text-[10px] font-bold ${statusConfig.cls}`}>
                  {statusConfig.emoji} {statusConfig.text}
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Flame size={11} style={{ color: ringColor }} />
                <span className="text-[11px] font-bold" style={{ color: ringColor }}>
                  {formatVND(spent)}
                </span>
                <span className="text-[10px] text-blue-600/50">đã chi</span>
              </div>
              <div className="w-px h-3.5 bg-blue-200/50" />
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-800">
                  {formatVND(period === "month" ? data.s2sBudget : mockS2SByPeriod[period].budget)}
                </span>
                <span className="text-[10px] text-blue-600/50">budget</span>
              </div>
              {period === "month" && (
                <>
                  <div className="w-px h-3.5 bg-blue-200/50" />
                  <div className="flex items-center gap-1">
                    <TrendingDown size={10} className="text-blue-500/60" />
                    <span className="text-[10px] text-blue-600/50">
                      {formatVND(data.dailyActualBurn)}/ngày
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Formula strip */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Pill label={formatVND(data.monthlyIncome)} sub="Thu nhập" />
              <span className="text-[12px] font-bold text-blue-400/60">−</span>
              <Pill label={formatVND(data.fixedExpenses.total)} sub="Chi cố định" />
              <span className="text-[12px] font-bold text-blue-400/60">−</span>
              <Pill label={formatVND(data.savingsCommitment.total)} sub="Tiết kiệm" />
              <span className="text-[12px] font-bold text-blue-400/60">−</span>
              <Pill label={formatVND(data.emergencyBuffer)} sub="Buffer" />
              <span className="text-[12px] font-bold text-blue-400/60">=</span>
              <Pill label={formatVND(data.s2sBudget)} sub="Budget S2S" accent />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-blue-500/70 hover:text-blue-600 transition-colors"
                style={{
                  background: "rgba(67,97,238,0.06)",
                  border: "1px solid rgba(67,97,238,0.12)",
                }}
              >
                <Info size={10} />
                <span className="text-[9px] font-bold">Chi tiết</span>
                <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }}>
                  <ChevronDown size={9} />
                </motion.div>
              </motion.button>
            </div>

            {/* Expanded breakdown */}
            <AnimatePresence>
              {showBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: "rgba(67,97,238,0.05)",
                      border: "1px solid rgba(67,97,238,0.1)",
                    }}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] font-bold mb-1.5 uppercase tracking-wider text-blue-600/50">
                          Chi Phí Cố Định
                        </p>
                        {data.fixedExpenses.breakdown.map((item) => (
                          <div key={item.name} className="flex items-center justify-between py-0.5">
                            <span className="text-[10px] text-gray-700">{item.icon} {item.name}</span>
                            <span className="text-[10px] font-bold text-gray-800">{formatVND(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold mb-1.5 uppercase tracking-wider text-blue-600/50">
                          Cam Kết Tiết Kiệm
                        </p>
                        {data.savingsCommitment.breakdown.map((item) => (
                          <div key={item.name} className="flex items-center justify-between py-0.5">
                            <span className="text-[10px] text-gray-700">
                              {item.icon} {item.name}
                              {item.completed && <span className="ml-1 text-[8px] text-emerald-500">✓</span>}
                            </span>
                            <span className="text-[10px] font-bold" style={{ color: item.completed ? "#059669" : "#6b7280" }}>
                              {item.completed ? "✓ Done" : formatVND(item.amount)}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between py-0.5 mt-1 border-t border-blue-200/40">
                          <span className="text-[10px] text-gray-700">🛡️ Emergency Buffer</span>
                          <span className="text-[10px] font-bold text-gray-800">{formatVND(data.emergencyBuffer)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Ring */}
          <div className="flex-shrink-0 hidden sm:flex flex-col items-center gap-1.5">
            <S2SRing percent={percent} status={status} size={108} />
          </div>
        </div>
      </div>
    </div>
  );
}
