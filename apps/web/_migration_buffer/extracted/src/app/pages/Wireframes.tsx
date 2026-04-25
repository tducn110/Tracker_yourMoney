  /**
   * S2S Finance — Interactive Wireframe Document
   * CSB25022 Web Basic Final Project — VNUK
   *
   * Truy cập: /wireframes
   * Export: Nhấn nút "In / Export PDF" → Save as PDF (Chrome)
   *
   * 8 màn hình:
   *  1. Login        5. Goals
   *  2. Register     6. Bills
   *  3. Dashboard    7. Analytics
   *  4. Transactions 8. Settings
   */
  
  import { useState } from "react";
  import { Printer, ChevronLeft, ChevronRight, Monitor, ZoomIn, ZoomOut, Home } from "lucide-react";
  import { Link } from "react-router";
  
  // =====================================================================
  // PRIMITIVE WIREFRAME COMPONENTS
  // =====================================================================
  
  /** Dòng text placeholder — đường nằm ngang màu xám */
  function WL({ w = "100%", h = 8, dim = false, className = "" }: { w?: string | number; h?: number; dim?: boolean; className?: string }) {
    return <div style={{ width: w, height: h }} className={`${dim ? "bg-gray-200" : "bg-gray-350"} rounded-sm flex-shrink-0 ${className}`} style2={{ backgroundColor: dim ? "#D1D5DB" : "#9CA3AF" }} />;
  }
  
  /** Box placeholder — container, ảnh, biểu đồ */
  function WBox({
    w, h, label, dashed = false, shade = "light", cross = false, className = "",
  }: {
    w?: string | number; h?: string | number; label?: string;
    dashed?: boolean; shade?: "none" | "light" | "medium" | "dark"; cross?: boolean; className?: string;
  }) {
    const fills: Record<string, string> = { none: "#fff", light: "#F3F4F6", medium: "#E5E7EB", dark: "#9CA3AF" };
    return (
      <div
        style={{
          width: w, height: h,
          backgroundColor: fills[shade],
          backgroundImage: cross
            ? "linear-gradient(45deg,#9CA3AF 1px,transparent 1px),linear-gradient(-45deg,#9CA3AF 1px,transparent 1px)"
            : undefined,
          backgroundSize: cross ? "16px 16px" : undefined,
          border: `2px ${dashed ? "dashed" : "solid"} #9CA3AF`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
        className={`rounded ${className}`}
      >
        {label && (
          <span style={{ fontSize: 9, color: "#6B7280", textAlign: "center", lineHeight: 1.3, padding: "0 4px", fontFamily: "monospace", backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 3 }}>
            {label}
          </span>
        )}
      </div>
    );
  }
  
  /** Button placeholder */
  function WBtn({ label, primary = false, full = false, sm = false, className = "" }: {
    label: string; primary?: boolean; full?: boolean; sm?: boolean; className?: string;
  }) {
    return (
      <div
        className={`${full ? "w-full" : ""} flex items-center justify-center rounded-lg ${className}`}
        style={{
          padding: sm ? "4px 8px" : "6px 12px",
          border: `2px solid ${primary ? "#374151" : "#9CA3AF"}`,
          backgroundColor: primary ? "#374151" : "#fff",
        }}
      >
        <span style={{ fontSize: sm ? 8 : 9, color: primary ? "#F9FAFB" : "#6B7280", fontFamily: "monospace", fontWeight: 600, whiteSpace: "nowrap" }}>
          {label}
        </span>
      </div>
    );
  }
  
  /** Input field placeholder */
  function WInput({ label = "", icon = false, className = "" }: { label?: string; icon?: boolean; className?: string }) {
    return (
      <div className={className}>
        {label && <div style={{ height: 7, width: 48, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 4 }} />}
        <div style={{ border: "2px solid #9CA3AF", borderRadius: 8, padding: "6px 8px", backgroundColor: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
          {icon && <div style={{ width: 12, height: 12, backgroundColor: "#D1D5DB", borderRadius: 3, flexShrink: 0 }} />}
          <div style={{ height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, flex: 1 }} />
        </div>
      </div>
    );
  }
  
  /** Card wrapper */
  function WCard({ children, title, className = "", style = {} }: { children: React.ReactNode; title?: string; className?: string; style?: React.CSSProperties }) {
    return (
      <div style={{ border: "2px solid #D1D5DB", borderRadius: 12, backgroundColor: "#fff", overflow: "hidden", ...style }} className={className}>
        {title && (
          <div style={{ borderBottom: "1px solid #E5E7EB", padding: "8px 12px", backgroundColor: "#F9FAFB" }}>
            <div style={{ height: 8, width: 80, backgroundColor: "#9CA3AF", borderRadius: 3 }} />
          </div>
        )}
        <div style={{ padding: 12 }}>{children}</div>
      </div>
    );
  }
  
  /** Vòng tròn avatar */
  function WAvatar({ size = 28 }: { size?: number }) {
    return <div style={{ width: size, height: size, borderRadius: "50%", backgroundColor: "#9CA3AF", flexShrink: 0 }} />;
  }
  
  /** Icon hình vuông */
  function WIcon({ size = 20, rounded = 6, shade = "medium", className = "" }: { size?: number; rounded?: number; shade?: "light" | "medium" | "dark"; className?: string }) {
    const shades: Record<string, string> = { light: "#D1D5DB", medium: "#9CA3AF", dark: "#6B7280" };
    return <div style={{ width: size, height: size, borderRadius: rounded, backgroundColor: shades[shade], flexShrink: 0 }} className={className} />;
  }
  
  /** Progress bar */
  function WProgress({ pct = 60, className = "" }: { pct?: number; className?: string }) {
    return (
      <div style={{ height: 6, backgroundColor: "#E5E7EB", borderRadius: 999, overflow: "hidden" }} className={className}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#6B7280", borderRadius: 999 }} />
      </div>
    );
  }
  
  /** Badge / tag */
  function WBadge({ label, type = "default" }: { label: string; type?: "default" | "success" | "danger" | "warning" }) {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      default:  { bg: "#F3F4F6", border: "#9CA3AF", text: "#6B7280" },
      success:  { bg: "#ECFDF5", border: "#6EE7B7", text: "#065F46" },
      danger:   { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
      warning:  { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
    };
    const c = colors[type];
    return (
      <div style={{ padding: "2px 7px", border: `1px solid ${c.border}`, borderRadius: 999, backgroundColor: c.bg, display: "inline-flex" }}>
        <span style={{ fontSize: 8, color: c.text, fontFamily: "monospace", fontWeight: 600 }}>{label}</span>
      </div>
    );
  }
  
  /** Annotation số tròn — đặt trực tiếp lên wireframe */
  function WMark({ n, className = "" }: { n: number; className?: string }) {
    return (
      <div
        className={`flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#3B82F6", border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", zIndex: 10 }}
      >
        <span style={{ fontSize: 8, color: "#fff", fontWeight: 700, lineHeight: 1 }}>{n}</span>
      </div>
    );
  }
  
  /** Divider */
  function WDiv({ className = "" }: { className?: string }) {
    return <div style={{ borderTop: "1px solid #E5E7EB", margin: "8px 0" }} className={className} />;
  }
  
  // =====================================================================
  // APP SHELL — Sidebar + Header (dùng chung cho 6 trang authenticated)
  // =====================================================================
  
  const NAV_LABELS = ["Tổng Quan", "Giao Dịch", "Mục Tiêu", "Hóa Đơn", "Phân Tích", "Cài Đặt"];
  
  function AppShell({ children, active = 0 }: { children: React.ReactNode; active?: number }) {
    return (
      <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#F8FAFC", fontFamily: "monospace", overflow: "hidden" }}>
        {/* ── SIDEBAR ── */}
        <div style={{ width: 180, flexShrink: 0, backgroundColor: "#fff", borderRight: "2px solid #D1D5DB", display: "flex", flexDirection: "column" }}>
          {/* Logo */}
          <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 8 }}>
            <WIcon size={30} rounded={10} shade="dark" />
            <div style={{ flex: 1 }}>
              <div style={{ height: 9, width: 72, backgroundColor: "#374151", borderRadius: 3, marginBottom: 4 }} />
              <div style={{ height: 6, width: 50, backgroundColor: "#9CA3AF", borderRadius: 3 }} />
            </div>
            <WMark n={1} />
          </div>
  
          {/* Nav items */}
          <nav style={{ flex: 1, padding: "10px 8px" }}>
            {NAV_LABELS.map((label, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, marginBottom: 2,
                  backgroundColor: i === active ? "#F3F4F6" : "transparent",
                  border: i === active ? "1.5px solid #9CA3AF" : "1.5px solid transparent",
                }}
              >
                <WIcon size={14} rounded={4} shade={i === active ? "dark" : "light"} />
                <div style={{ height: 7, flex: 1, backgroundColor: i === active ? "#374151" : "#D1D5DB", borderRadius: 3 }} />
                {i === 0 && <WMark n={2} />}
              </div>
            ))}
          </nav>
  
          {/* User section */}
          <div style={{ padding: "8px", borderTop: "1px solid #E5E7EB" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <WAvatar size={26} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 7, width: 60, backgroundColor: "#6B7280", borderRadius: 3, marginBottom: 3 }} />
                <div style={{ height: 6, width: 44, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
              </div>
              <WMark n={3} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", marginTop: 2, borderRadius: 6 }}>
              <WIcon size={12} rounded={3} shade="light" />
              <div style={{ height: 6, width: 44, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            </div>
          </div>
        </div>
  
        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ height: 52, backgroundColor: "#fff", borderBottom: "2px solid #D1D5DB", display: "flex", alignItems: "center", padding: "0 16px", gap: 10, flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <div style={{ height: 10, width: 160, backgroundColor: "#374151", borderRadius: 3, marginBottom: 4 }} />
              <div style={{ height: 6, width: 110, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            </div>
            <WMark n={4} />
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", border: "1.5px solid #D1D5DB", borderRadius: 10, width: 120, backgroundColor: "#fff" }}>
              <WIcon size={11} rounded={3} shade="light" />
              <div style={{ height: 6, flex: 1, backgroundColor: "#E5E7EB", borderRadius: 3 }} />
            </div>
            <WMark n={5} />
            {/* Bell */}
            <div style={{ position: "relative" }}>
              <WBox w={28} h={28} shade="none" className="rounded-xl" />
              <div style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, borderRadius: "50%", backgroundColor: "#374151", border: "1.5px solid #fff" }} />
            </div>
            <WMark n={6} />
            <WAvatar size={28} />
          </div>
  
          {/* Page content */}
          <div style={{ flex: 1, overflow: "auto", padding: 12, backgroundColor: "#F8FAFC" }}>
            {children}
          </div>
        </div>
      </div>
    );
  }
  
  // =====================================================================
  // SCREEN 1 — LOGIN
  // =====================================================================
  function ScreenLogin() {
    return (
      <div style={{ width: "100%", height: "100%", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 320, border: "2px solid #D1D5DB", borderRadius: 16, backgroundColor: "#fff", padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#374151", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <WIcon size={26} rounded={6} shade="light" />
            </div>
            <div style={{ height: 12, width: 100, backgroundColor: "#374151", borderRadius: 4, margin: "0 auto 6px" }} />
            <div style={{ height: 8, width: 130, backgroundColor: "#D1D5DB", borderRadius: 3, margin: "0 auto" }} />
            <WMark n={1} className="mx-auto mt-1" />
          </div>
  
          <WDiv />
  
          {/* Heading */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 13, width: 120, backgroundColor: "#374151", borderRadius: 4, marginBottom: 5 }} />
            <div style={{ height: 7, width: 180, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            <WMark n={2} />
          </div>
  
          {/* Email */}
          <div style={{ marginBottom: 10, position: "relative" }}>
            <div style={{ height: 7, width: 48, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 5 }} />
            <WInput icon />
            <div style={{ position: "absolute", top: 0, right: 0 }}><WMark n={3} /></div>
          </div>
  
          {/* Password */}
          <div style={{ marginBottom: 10, position: "relative" }}>
            <div style={{ height: 7, width: 60, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 5 }} />
            <WInput icon />
            <div style={{ position: "absolute", top: 0, right: 0 }}><WMark n={4} /></div>
          </div>
  
          {/* Remember + Forgot */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <WBox w={12} h={12} shade="light" />
              <div style={{ height: 6, width: 60, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            </div>
            <div style={{ height: 6, width: 80, backgroundColor: "#9CA3AF", borderRadius: 3 }} />
            <WMark n={5} />
          </div>
  
          {/* Login button */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <WBtn label="ĐĂNG NHẬP" primary full />
            <div style={{ position: "absolute", top: "50%", right: -20, transform: "translateY(-50%)" }}><WMark n={6} /></div>
          </div>
  
          <WDiv />
  
          {/* Register link */}
          <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <div style={{ height: 7, width: 100, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            <div style={{ height: 7, width: 60, backgroundColor: "#6B7280", borderRadius: 3 }} />
            <WMark n={7} />
          </div>
        </div>
      </div>
    );
  }
  
  // =====================================================================
  // SCREEN 2 — REGISTER
  // =====================================================================
  function ScreenRegister() {
    return (
      <div style={{ width: "100%", height: "100%", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ width: 380, border: "2px solid #D1D5DB", borderRadius: 16, backgroundColor: "#fff", padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <WIcon size={36} rounded={10} shade="dark" />
            <div>
              <div style={{ height: 10, width: 80, backgroundColor: "#374151", borderRadius: 3, marginBottom: 4 }} />
              <div style={{ height: 7, width: 60, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            </div>
            <WMark n={1} />
          </div>
  
          <div style={{ height: 12, width: 140, backgroundColor: "#374151", borderRadius: 4, marginBottom: 4 }} />
          <div style={{ height: 7, width: 220, backgroundColor: "#D1D5DB", borderRadius: 3, marginBottom: 16 }} />
          <WMark n={2} />
  
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ position: "relative" }}>
              <div style={{ height: 6, width: 50, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 4 }} />
              <WInput icon />
              <div style={{ position: "absolute", top: 0, right: 0 }}><WMark n={3} /></div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ height: 6, width: 65, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 4 }} />
              <WInput icon />
              <div style={{ position: "absolute", top: 0, right: 0 }}><WMark n={4} /></div>
            </div>
          </div>
  
          <div style={{ position: "relative", marginBottom: 10 }}>
            <div style={{ height: 6, width: 40, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 4 }} />
            <WInput icon />
            <div style={{ position: "absolute", top: 0, right: 0 }}><WMark n={5} /></div>
          </div>
  
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ position: "relative" }}>
              <div style={{ height: 6, width: 50, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 4 }} />
              <WInput icon />
              <div style={{ position: "absolute", top: 0, right: 0 }}><WMark n={6} /></div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ height: 6, width: 70, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 4 }} />
              <WInput icon />
              <div style={{ position: "absolute", top: 0, right: 0 }}><WMark n={7} /></div>
            </div>
          </div>
  
          {/* Finance config section */}
          <div style={{ border: "1.5px dashed #9CA3AF", borderRadius: 10, padding: 10, marginBottom: 14, backgroundColor: "#F9FAFB" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
              <WIcon size={12} rounded={3} shade="medium" />
              <div style={{ height: 7, width: 110, backgroundColor: "#6B7280", borderRadius: 3 }} />
              <WMark n={8} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ height: 6, width: 60, backgroundColor: "#D1D5DB", borderRadius: 3, marginBottom: 4 }} />
                <WInput />
              </div>
              <div>
                <div style={{ height: 6, width: 50, backgroundColor: "#D1D5DB", borderRadius: 3, marginBottom: 4 }} />
                <WInput />
              </div>
            </div>
          </div>
  
          <div style={{ position: "relative", marginBottom: 12 }}>
            <WBtn label="TẠO TÀI KHOẢN" primary full />
            <div style={{ position: "absolute", top: "50%", right: -20, transform: "translateY(-50%)" }}><WMark n={9} /></div>
          </div>
  
          <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <div style={{ height: 7, width: 90, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            <div style={{ height: 7, width: 55, backgroundColor: "#6B7280", borderRadius: 3 }} />
            <WMark n={10} />
          </div>
        </div>
      </div>
    );
  }
  
  // =====================================================================
  // SCREEN 3 — DASHBOARD
  // =====================================================================
  function ScreenDashboard() {
    return (
      <AppShell active={0}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* ANTIGRAVITY V1.2 — S2S HERO SECTION: ELEMENT DAU TIEN, FULL-WIDTH */}
  
          {/* HANG 1 — HERO S2S: So tien lon nhat trang, chiem toan bo fold dau */}
          {/* Antigravity V1.2: khong co gi chen truoc S2S. Height ~2.5x card phu. */}
          <div style={{
            border: "3px solid #1F2937", borderRadius: 16, padding: "28px 32px",
            backgroundColor: "#374151", position: "relative", minHeight: 210,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ height: 7, width: 130, backgroundColor: "rgba(255,255,255,0.4)", borderRadius: 3, marginBottom: 12 }} />
                <div style={{ height: 48, width: 280, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 8, marginBottom: 14 }} />
                <div style={{ padding: "5px 14px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <div style={{ height: 6, width: 200, backgroundColor: "rgba(255,255,255,0.4)", borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <div style={{ padding: "4px 12px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999 }}>
                  <div style={{ height: 7, width: 80, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 3 }} />
                </div>
                <WIcon size={44} rounded={14} shade="light" />
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 12, marginTop: 16, display: "flex", gap: 8 }}>
              {["Hom nay", "Tuan nay", "Thang nay"].map((t, i) => (
                <div key={t} style={{
                  padding: "3px 10px", borderRadius: 6,
                  border: `1px solid ${i === 2 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.18)"}`,
                  backgroundColor: i === 2 ? "rgba(255,255,255,0.15)" : "transparent",
                }}>
                  <span style={{ fontSize: 8, color: i === 2 ? "#fff" : "rgba(255,255,255,0.45)", fontFamily: "monospace", fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
            <WMark n={7} className="absolute top-2 right-2" />
          </div>
  
          {/* HANG 2 — CHI SO KE TOAN BI HA CAP (DEMOTED) */}
          {/* Khong icon noi bat. Khong badge %. Nen xam nhat. So mo. */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[{ n: 8 }, { n: 9 }, { n: 10 }].map((card) => (
              <div key={card.n} style={{
                border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px",
                backgroundColor: "#F9FAFB", position: "relative",
              }}>
                <div style={{ height: 5, width: 80, backgroundColor: "#C4C9D4", borderRadius: 3, marginBottom: 8 }} />
                <div style={{ height: 12, width: 95, backgroundColor: "#9CA3AF", borderRadius: 4 }} />
                <WMark n={card.n} className="absolute top-2 right-2" />
              </div>
            ))}
          </div>

          {/* HANG 3 — VI TIEN MAT: CO LAP THANH DAI NGANG DOC LAP */}
          {/* Khong nam cung column voi Bills. Dai mong, nam ngang = thu yeu. */}
          <div style={{
            border: "1.5px solid #FDE68A", borderRadius: 10, padding: "9px 16px",
            backgroundColor: "#FFFBEB", display: "flex", alignItems: "center", gap: 14, position: "relative",
          }}>
            <WIcon size={22} rounded={6} shade="medium" />
            <div>
              <div style={{ height: 5, width: 55, backgroundColor: "#D1D5DB", borderRadius: 3, marginBottom: 4 }} />
              <div style={{ height: 11, width: 88, backgroundColor: "#9CA3AF", borderRadius: 4 }} />
            </div>
            <div style={{ flex: 1 }} />
            <WBtn label="QUICK SYNC" sm />
            <WMark n={11} className="absolute top-2 right-2" />
          </div>
  
          {/* HANG 4 — NOI DUNG CHI TIET */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
            {/* LEFT: Transactions & Goals xep doc */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Transactions */}
              <WCard title="Giao Dich Gan Day">
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < 3 ? 8 : 0 }}>
                    <WIcon size={28} rounded={8} shade="light" />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 7, width: "80%", backgroundColor: "#6B7280", borderRadius: 3, marginBottom: 3 }} />
                      <div style={{ height: 6, width: "55%", backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                    </div>
                    <div style={{ height: 8, width: 55, backgroundColor: i % 3 === 0 ? "#6EE7B7" : "#374151", borderRadius: 3 }} />
                  </div>
                ))}
                <WMark n={12} />
              </WCard>
  
              {/* Goals */}
              <WCard title="Mục Tiêu">
                {[{ pct: 34 }, { pct: 60 }, { pct: 100 }].map((g, i) => (
                  <div key={i} style={{ marginBottom: i < 2 ? 10 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <WIcon size={22} rounded={6} shade="light" />
                      <div style={{ height: 7, flex: 1, backgroundColor: "#6B7280", borderRadius: 3 }} />
                      <div style={{ height: 7, width: 24, backgroundColor: "#9CA3AF", borderRadius: 3 }} />
                    </div>
                    <WProgress pct={g.pct} />
                    <div style={{ height: 6, width: "70%", backgroundColor: "#D1D5DB", borderRadius: 3, marginTop: 4, marginLeft: "auto" }} />
                  </div>
                ))}
                <WMark n={13} />
              </WCard>
            </div>
  
            {/* RIGHT: Bills only. Cash Wallet da len hang 3 rieng. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Bills */}
              <WCard title="Hóa Đơn Sắp Tới">
                {[{ type: "danger" }, { type: "success" }, { type: "warning" }].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < 2 ? 8 : 0, padding: "6px 8px", borderRadius: 8, border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                    <WAvatar size={24} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 7, width: "70%", backgroundColor: "#374151", borderRadius: 3, marginBottom: 3 }} />
                      <div style={{ height: 6, width: "50%", backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                    </div>
                    <div>
                      <div style={{ height: 8, width: 40, backgroundColor: "#374151", borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
                <WMark n={14} />
              </WCard>
  
            </div>
          </div>

          {/* HANG 5: BANNER AI CHAT, DON XUONG DAY */}
          <div style={{ border: "1.5px dashed #9CA3AF", borderRadius: 10, padding: "8px 14px", backgroundColor: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
            <WIcon size={18} rounded={5} shade="light" />
            <div style={{ flex: 1 }}>
              <div style={{ height: 7, width: 200, backgroundColor: "#374151", borderRadius: 3, marginBottom: 4 }} />
              <div style={{ height: 6, width: 260, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            </div>
            <WBtn label="NHAP NGAY" primary />
            <WMark n={15} />
          </div>

        </div>
  
        {/* FAB */}
        <div style={{ position: "absolute", bottom: 16, right: 16, width: 40, height: 40, borderRadius: 12, backgroundColor: "#374151", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
          <div style={{ width: 16, height: 16, color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>+</div>
        </div>
      </AppShell>
    );
  }
  
  // =====================================================================
  // SCREEN 4 — TRANSACTIONS
  // =====================================================================
  function ScreenTransactions() {
    return (
      <AppShell active={1}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Header + Filter bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ height: 14, width: 110, backgroundColor: "#374151", borderRadius: 4 }} />
            <div style={{ flex: 1 }} />
            {/* Month picker */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", border: "2px solid #9CA3AF", borderRadius: 8, backgroundColor: "#fff" }}>
              <WIcon size={12} rounded={3} shade="medium" />
              <div style={{ height: 7, width: 50, backgroundColor: "#6B7280", borderRadius: 3 }} />
            </div>
            <WMark n={7} />
            {/* Category filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", border: "2px solid #9CA3AF", borderRadius: 8, backgroundColor: "#fff" }}>
              <div style={{ height: 7, width: 70, backgroundColor: "#6B7280", borderRadius: 3 }} />
              <WIcon size={10} rounded={2} shade="light" />
            </div>
            <WMark n={8} />
            {/* Type filter */}
            <div style={{ display: "flex", gap: 4 }}>
              {["TẤT CẢ", "THU", "CHI"].map((t, i) => (
                <div key={t} style={{ padding: "4px 8px", borderRadius: 6, border: `1.5px solid ${i === 0 ? "#374151" : "#D1D5DB"}`, backgroundColor: i === 0 ? "#374151" : "#fff" }}>
                  <span style={{ fontSize: 8, color: i === 0 ? "#fff" : "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
            <WMark n={9} />
          </div>
  
          {/* Summary chips */}
          <div style={{ display: "flex", gap: 8 }}>
            {[{ label: "Tổng GD", n: 10 }, { label: "Thu", n: 11 }, { label: "Chi", n: 12 }].map((chip) => (
              <div key={chip.n} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1.5px solid #D1D5DB", borderRadius: 8, backgroundColor: "#fff" }}>
                <div style={{ height: 6, width: 35, backgroundColor: "#9CA3AF", borderRadius: 3 }} />
                <div style={{ height: 9, width: 60, backgroundColor: "#374151", borderRadius: 3 }} />
                <WMark n={chip.n} />
              </div>
            ))}
          </div>
  
          {/* Transaction table */}
          <WCard>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 90px 80px 80px 60px", gap: 8, padding: "6px 8px", backgroundColor: "#F9FAFB", borderRadius: 6, marginBottom: 6, borderBottom: "1.5px solid #E5E7EB" }}>
              {["NGÀY", "GHI CHÚ", "DANH MỤC", "SỐ TIỀN", "TRẠNG THÁI", ""].map((h, i) => (
                <div key={i} style={{ height: 7, backgroundColor: "#9CA3AF", borderRadius: 3, width: h ? "100%" : "80%" }} />
              ))}
            </div>
            {/* Rows */}
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr 90px 80px 80px 60px", gap: 8, padding: "7px 8px", borderBottom: i < 7 ? "1px solid #F3F4F6" : undefined, alignItems: "center" }}>
                <div style={{ height: 7, width: "80%", backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <WIcon size={22} rounded={6} shade="light" />
                  <div>
                    <div style={{ height: 7, width: 80, backgroundColor: "#374151", borderRadius: 3, marginBottom: 3 }} />
                    <div style={{ height: 6, width: 55, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                  </div>
                </div>
                <WBadge label="Ăn Uống" />
                <div style={{ height: 9, width: 65, backgroundColor: i % 3 === 0 ? "#6EE7B7" : "#374151", borderRadius: 3 }} />
                <WBadge label={i % 4 === 1 ? "pending" : "paid"} type={i % 4 === 1 ? "warning" : "success"} />
                <div style={{ display: "flex", gap: 4 }}>
                  <WIcon size={18} rounded={4} shade="light" />
                  <WIcon size={18} rounded={4} shade="light" />
                </div>
              </div>
            ))}
            {/* Pagination */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <div style={{ height: 7, width: 80, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
              <div style={{ display: "flex", gap: 4 }}>
                {["←", "1", "2", "3", "→"].map((p, i) => (
                  <div key={i} style={{ width: 26, height: 26, borderRadius: 6, border: `1.5px solid ${i === 1 ? "#374151" : "#D1D5DB"}`, backgroundColor: i === 1 ? "#374151" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 9, color: i === 1 ? "#fff" : "#9CA3AF", fontFamily: "monospace" }}>{p}</span>
                  </div>
                ))}
              </div>
              <WMark n={13} />
            </div>
          </WCard>
        </div>
      </AppShell>
    );
  }
  
  // =====================================================================
  // SCREEN 5 — GOALS
  // =====================================================================
  function ScreenGoals() {
    const goals = [
      { pct: 34, status: "active",    statusType: "default" as const },
      { pct: 60, status: "active",    statusType: "default" as const },
      { pct: 100, status: "completed", statusType: "success" as const },
      { pct: 9,  status: "paused",    statusType: "warning" as const },
    ];
    return (
      <AppShell active={2}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ height: 14, width: 100, backgroundColor: "#374151", borderRadius: 4, marginBottom: 5 }} />
              <div style={{ height: 7, width: 180, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <WMark n={7} />
              <WBtn label="+ THÊM MỤC TIÊU" primary />
            </div>
          </div>
  
          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[{ label: "Tổng mục tiêu", n: 8 }, { label: "Đang hoạt động", n: 9 }, { label: "Tổng cần tiết kiệm", n: 10 }, { label: "Hàng tháng", n: 11 }].map((s) => (
              <div key={s.n} style={{ border: "2px solid #D1D5DB", borderRadius: 10, padding: "10px 12px", backgroundColor: "#fff", position: "relative" }}>
                <div style={{ height: 6, width: "70%", backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 6 }} />
                <div style={{ height: 14, width: "80%", backgroundColor: "#374151", borderRadius: 4 }} />
                <WMark n={s.n} className="absolute top-1.5 right-1.5" />
              </div>
            ))}
          </div>
  
          {/* Goals grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {goals.map((goal, i) => (
              <div key={i} style={{ border: "2px solid #D1D5DB", borderRadius: 12, padding: 14, backgroundColor: "#fff", position: "relative" }}>
                {/* Icon + name + badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <WIcon size={36} rounded={10} shade="medium" />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 9, width: "70%", backgroundColor: "#374151", borderRadius: 3, marginBottom: 4 }} />
                    <div style={{ height: 6, width: "50%", backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                  </div>
                  <WBadge label={goal.status} type={goal.statusType} />
                </div>
  
                {/* Progress */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <div style={{ height: 6, width: 60, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                  <div style={{ height: 9, width: 30, backgroundColor: "#374151", borderRadius: 3 }} />
                </div>
                <WProgress pct={goal.pct} className="mb-2" />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ height: 6, width: 80, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                  <div style={{ height: 6, width: 80, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                </div>
  
                {/* Monthly contribution + deadline */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
                  <div>
                    <div style={{ height: 5, width: 55, backgroundColor: "#D1D5DB", borderRadius: 3, marginBottom: 3 }} />
                    <div style={{ height: 8, width: 70, backgroundColor: "#6B7280", borderRadius: 3 }} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ height: 5, width: 40, backgroundColor: "#D1D5DB", borderRadius: 3, marginBottom: 3 }} />
                    <div style={{ height: 8, width: 55, backgroundColor: "#6B7280", borderRadius: 3 }} />
                  </div>
                </div>
  
                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <WBtn label="CẬP NHẬT" full sm />
                  <WBtn label="SỬA" sm />
                  <WBtn label="XÓA" sm />
                </div>
  
                {i === 0 && <WMark n={12} className="absolute top-2 right-2" />}
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }
  
  // =====================================================================
  // SCREEN 6 — BILLS
  // =====================================================================
  function ScreenBills() {
    const bills = [
      { status: "overdue",  statusType: "danger" as const },
      { status: "pending",  statusType: "warning" as const },
      { status: "paid",     statusType: "success" as const },
      { status: "paid",     statusType: "success" as const },
      { status: "pending",  statusType: "warning" as const },
    ];
    return (
      <AppShell active={3}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ height: 14, width: 90, backgroundColor: "#374151", borderRadius: 4, marginBottom: 5 }} />
              <div style={{ height: 7, width: 200, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            </div>
            <WBtn label="+ THÊM HÓA ĐƠN" primary />
            <WMark n={7} />
          </div>
  
          {/* Month summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[{ label: "Tổng hóa đơn", n: 8 }, { label: "Đã trả", n: 9 }, { label: "Chưa trả", n: 10 }, { label: "Quá hạn", n: 11 }].map((s) => (
              <div key={s.n} style={{ border: "2px solid #D1D5DB", borderRadius: 10, padding: "10px 12px", backgroundColor: "#fff", position: "relative" }}>
                <div style={{ height: 6, width: "70%", backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 6 }} />
                <div style={{ height: 14, width: "80%", backgroundColor: "#374151", borderRadius: 4 }} />
                <WMark n={s.n} className="absolute top-1.5 right-1.5" />
              </div>
            ))}
          </div>
  
          {/* Bills list */}
          <WCard title="Danh sách hóa đơn">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bills.map((bill, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                  <WIcon size={32} rounded={999} shade="medium" />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, width: 100, backgroundColor: "#374151", borderRadius: 3, marginBottom: 4 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ height: 6, width: 55, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                      <WBadge label={bill.status} type={bill.statusType} />
                    </div>
                  </div>
                  {/* Category */}
                  <WBadge label="Nhà Ở" />
                  {/* Amount */}
                  <div style={{ height: 10, width: 70, backgroundColor: "#374151", borderRadius: 3 }} />
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 5 }}>
                    {bill.status !== "paid" && <WBtn label="ĐÃ TRẢ ✓" primary sm />}
                    <WBtn label="SỬA" sm />
                    <WBtn label="XÓA" sm />
                  </div>
                  {i === 0 && <WMark n={12} />}
                </div>
              ))}
            </div>
          </WCard>
  
          {/* Calendar view hint */}
          <div style={{ border: "2px dashed #9CA3AF", borderRadius: 10, padding: 12, backgroundColor: "#F9FAFB", display: "flex", alignItems: "center", gap: 8 }}>
            <WIcon size={20} rounded={6} shade="medium" />
            <div style={{ height: 7, width: 200, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            <WMark n={13} />
          </div>
        </div>
      </AppShell>
    );
  }
  
  // =====================================================================
  // SCREEN 7 — ANALYTICS
  // =====================================================================
  function ScreenAnalytics() {
    return (
      <AppShell active={4}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Header + date range */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ height: 14, width: 100, backgroundColor: "#374151", borderRadius: 4, marginBottom: 5 }} />
              <div style={{ height: 7, width: 160, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["T1","T3","T6","Năm"].map((t, i) => (
                <div key={t} style={{ padding: "4px 10px", borderRadius: 6, border: `1.5px solid ${i === 1 ? "#374151" : "#D1D5DB"}`, backgroundColor: i === 1 ? "#374151" : "#fff" }}>
                  <span style={{ fontSize: 8, color: i === 1 ? "#fff" : "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
            <WMark n={7} />
          </div>
  
          {/* KPI chips */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[{ label: "Thu nhập", n: 8 }, { label: "Chi tiêu", n: 9 }, { label: "Tiết kiệm", n: 10 }, { label: "S2S trung bình", n: 11 }].map((k) => (
              <div key={k.n} style={{ border: "2px solid #D1D5DB", borderRadius: 10, padding: "10px 12px", backgroundColor: "#fff", position: "relative" }}>
                <div style={{ height: 6, width: "60%", backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 6 }} />
                <div style={{ height: 14, width: "75%", backgroundColor: "#374151", borderRadius: 4 }} />
                <WMark n={k.n} className="absolute top-1.5 right-1.5" />
              </div>
            ))}
          </div>
  
          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 10 }}>
            {/* Donut chart */}
            <WCard title="Chi tiêu theo danh mục">
              <div style={{ display: "flex", gap: 10 }}>
                <WBox w={130} h={130} shade="light" cross label="DONUT CHART" className="rounded-full" style={{ borderRadius: "50%" }} />
                <div style={{ flex: 1, paddingLeft: 4 }}>
                  {[{ w: 70 }, { w: 55 }, { w: 65 }, { w: 45 }, { w: 60 }, { w: 40 }].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#9CA3AF", flexShrink: 0 }} />
                      <div style={{ height: 6, width: item.w, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                      <div style={{ height: 7, width: 40, backgroundColor: "#374151", borderRadius: 3, marginLeft: "auto" }} />
                    </div>
                  ))}
                </div>
              </div>
              <WMark n={12} />
            </WCard>
  
            {/* Bar chart */}
            <WCard title="Thu nhập vs Chi tiêu (6 tháng)">
              <div style={{ height: 160 }}>
                <WBox w="100%" h={140} shade="light" cross={false} label="BAR CHART\nThu nhập vs Chi tiêu 6 tháng gần nhất" />
                {/* X axis */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {["T10", "T11", "T12", "T1", "T2", "T3"].map((m) => (
                    <div key={m} style={{ height: 6, width: 20, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                  ))}
                </div>
              </div>
              <WMark n={13} />
            </WCard>
          </div>
  
          {/* Top categories table */}
          <WCard title="Phân tích chi tiết danh mục">
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < 4 ? "1px solid #F3F4F6" : undefined }}>
                <div style={{ width: 20, height: 7, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
                <WIcon size={22} rounded={6} shade="light" />
                <div style={{ height: 7, width: 80, backgroundColor: "#6B7280", borderRadius: 3, flex: 1 }} />
                <WProgress pct={[80, 60, 45, 35, 20][i]} className="w-32" />
                <div style={{ height: 8, width: 65, backgroundColor: "#374151", borderRadius: 3 }} />
                <div style={{ height: 6, width: 30, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
              </div>
            ))}
            <WMark n={14} />
          </WCard>
        </div>
      </AppShell>
    );
  }
  
  // =====================================================================
  // SCREEN 8 — SETTINGS
  // =====================================================================
  function ScreenSettings() {
    return (
      <AppShell active={5}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
          {/* Title */}
          <div>
            <div style={{ height: 14, width: 90, backgroundColor: "#374151", borderRadius: 4, marginBottom: 5 }} />
            <div style={{ height: 7, width: 220, backgroundColor: "#D1D5DB", borderRadius: 3 }} />
          </div>
  
          {/* Profile section */}
          <WCard title="Thông tin cá nhân">
            {/* Avatar row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <WAvatar size={60} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 9, width: 100, backgroundColor: "#374151", borderRadius: 3, marginBottom: 5 }} />
                <div style={{ height: 7, width: 140, backgroundColor: "#D1D5DB", borderRadius: 3, marginBottom: 8 }} />
                <WBtn label="ĐỔI ẢNH ĐẠI DIỆN" sm />
              </div>
              <WMark n={7} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <WInput label="Họ và tên" />
              <WInput label="Tên đăng nhập" />
            </div>
            <WInput label="Email" className="mb-3" />
            <WBtn label="LƯU THÔNG TIN" primary />
            <WMark n={8} />
          </WCard>
  
          {/* Finance settings */}
          <WCard title="Cấu hình tài chính">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ height: 6, width: 70, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 4 }} />
                <WInput />
                <WMark n={9} />
              </div>
              <div>
                <div style={{ height: 6, width: 80, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 4 }} />
                <WInput />
                <WMark n={10} />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ height: 6, width: 100, backgroundColor: "#9CA3AF", borderRadius: 3, marginBottom: 4 }} />
              <WInput />
              <WMark n={11} />
            </div>
            <WBtn label="LƯU CÀI ĐẶT" primary />
          </WCard>
  
          {/* Security */}
          <WCard title="Bảo mật">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <WInput label="Mật khẩu hiện tại" icon />
              <WInput label="Mật khẩu mới" icon />
              <WInput label="Xác nhận mật khẩu mới" icon />
            </div>
            <WBtn label="ĐỔI MẬT KHẨU" primary />
            <WMark n={12} />
          </WCard>
  
          {/* Category manager */}
          <WCard title="Quản lý danh mục">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <WBtn label="+ THÊM DANH MỤC" sm />
              <WMark n={13} />
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 8, border: "1.5px solid #E5E7EB", marginBottom: 6, backgroundColor: "#F9FAFB" }}>
                <WIcon size={26} rounded={8} shade="medium" />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, width: 70, backgroundColor: "#374151", borderRadius: 3, marginBottom: 3 }} />
                  <WBadge label="expense" />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <WBtn label="SỬA" sm />
                  <WBtn label="XÓA" sm />
                </div>
              </div>
            ))}
            <WMark n={14} />
          </WCard>
        </div>
      </AppShell>
    );
  }
  
  // =====================================================================
  // ANNOTATION DATA
  // =====================================================================
  
  const ANNOTATIONS: Record<string, { n: number; text: string }[]> = {
    login: [
      { n: 1, text: "Logo ứng dụng + tên S2S Finance" },
      { n: 2, text: "Tiêu đề 'Đăng nhập vào tài khoản'" },
      { n: 3, text: "Input email — có validation format" },
      { n: 4, text: "Input password — ẩn ký tự, toggle show/hide" },
      { n: 5, text: "Remember me checkbox + Quên mật khẩu?" },
      { n: 6, text: "Nút CTA chính — Đăng Nhập (primary button)" },
      { n: 7, text: "Link chuyển sang trang Đăng Ký" },
    ],
    register: [
      { n: 1, text: "Logo + brand name S2S Finance" },
      { n: 2, text: "Tiêu đề + mô tả ngắn trang đăng ký" },
      { n: 3, text: "Input Họ và tên đầy đủ" },
      { n: 4, text: "Input Tên đăng nhập (username, unique)" },
      { n: 5, text: "Input Email (unique, required)" },
      { n: 6, text: "Input Mật khẩu (min 8 ký tự)" },
      { n: 7, text: "Input Xác nhận mật khẩu (must match)" },
      { n: 8, text: "Section cấu hình tài chính ban đầu (ngân sách, ngày lương)" },
      { n: 9, text: "Nút CTA Tạo Tài Khoản" },
      { n: 10, text: "Link quay về Đăng Nhập" },
    ],
    dashboard: [
      { n: 1,  text: "Logo + ten app — co the thu gon sidebar" },
      { n: 2,  text: "Nav item dang active (active indicator bar)" },
      { n: 3,  text: "User profile mini + nut Dang xuat" },
      { n: 4,  text: "Loi chao dong theo gio (sang/chieu/toi)" },
      { n: 5,  text: "Thanh tim kiem global" },
      { n: 6,  text: "Chuong thong bao + badge so chua doc" },
      { n: 7,  text: "[HERO] Safe-to-Spend (S2S) — so tien co the chi an toan, doi mau khi am. Period tabs: Hom nay / Tuan nay / Thang nay." },
      { n: 8,  text: "[DEMOTED] Card So Du Hien Tai — bi ha cap: khong icon, khong badge, mau mo #9CA3AF" },
      { n: 9,  text: "[DEMOTED] Card Tong Thu Nhap — bi ha cap, chi de tham khao" },
      { n: 10, text: "[DEMOTED] Card Tong Chi Tieu — bi ha cap, khong tranh focal point voi S2S" },
      { n: 11, text: "[ISOLATED] Vi Tien Mat — co lap thanh dai ngang doc lap, mau amber, khong nam cung cot voi Bills" },
      { n: 12, text: "Danh sach giao dich gan nhat (4 muc)" },
      { n: 13, text: "Tien do muc tieu tiet kiem (3 goals)" },
      { n: 14, text: "Hoa don sap den han — tach biet hoan toan khoi Vi Tien Mat" },
      { n: 15, text: "[UTILITY] Banner AI Chat — don xuong cuoi, khong canh tranh fold dau" },
    ],
    transactions: [
      { n: 1, text: "Logo sidebar" },
      { n: 2, text: "Nav active: Giao Dịch" },
      { n: 3, text: "User profile" },
      { n: 4, text: "Greeting header" },
      { n: 5, text: "Tìm kiếm giao dịch" },
      { n: 6, text: "Notification bell" },
      { n: 7, text: "Bộ lọc theo tháng (Month Picker)" },
      { n: 8, text: "Dropdown lọc theo danh mục" },
      { n: 9, text: "Filter tabs: Tất cả / Thu / Chi" },
      { n: 10, text: "Chip tổng số giao dịch" },
      { n: 11, text: "Chip tổng thu nhập kỳ đã chọn" },
      { n: 12, text: "Chip tổng chi tiêu kỳ đã chọn" },
      { n: 13, text: "Phân trang (Previous / Page numbers / Next)" },
    ],
    goals: [
      { n: 1, text: "Logo sidebar" },
      { n: 2, text: "Nav active: Mục Tiêu" },
      { n: 3, text: "User profile" },
      { n: 4, text: "Greeting header" },
      { n: 5, text: "Tìm kiếm" },
      { n: 6, text: "Notification bell" },
      { n: 7, text: "Nút thêm mục tiêu mới" },
      { n: 8, text: "Tổng số mục tiêu" },
      { n: 9, text: "Số mục tiêu đang hoạt động" },
      { n: 10, text: "Tổng số tiền cần tiết kiệm" },
      { n: 11, text: "Tổng đóng góp hàng tháng" },
      { n: 12, text: "Goal card: icon, tên, progress bar, status badge, actions" },
    ],
    bills: [
      { n: 1, text: "Logo sidebar" },
      { n: 2, text: "Nav active: Hóa Đơn" },
      { n: 3, text: "User profile" },
      { n: 4, text: "Greeting header" },
      { n: 5, text: "Tìm kiếm" },
      { n: 6, text: "Notification bell" },
      { n: 7, text: "Nút thêm hóa đơn mới" },
      { n: 8, text: "Tổng hóa đơn tháng này" },
      { n: 9, text: "Số đã thanh toán (paid)" },
      { n: 10, text: "Số chưa thanh toán (pending)" },
      { n: 11, text: "Số quá hạn (overdue — màu đỏ)" },
      { n: 12, text: "Bill item: icon, tên, ngày hạn, status badge, amount, actions" },
      { n: 13, text: "Gợi ý xem lịch hóa đơn theo tháng" },
    ],
    analytics: [
      { n: 1, text: "Logo sidebar" },
      { n: 2, text: "Nav active: Phân Tích" },
      { n: 3, text: "User profile" },
      { n: 4, text: "Greeting header" },
      { n: 5, text: "Tìm kiếm" },
      { n: 6, text: "Notification bell" },
      { n: 7, text: "Bộ lọc thời gian (1T/3T/6T/Năm)" },
      { n: 8, text: "KPI: Tổng thu nhập kỳ được chọn" },
      { n: 9, text: "KPI: Tổng chi tiêu kỳ được chọn" },
      { n: 10, text: "KPI: Tổng tiết kiệm kỳ được chọn" },
      { n: 11, text: "KPI: S2S trung bình kỳ được chọn" },
      { n: 12, text: "Biểu đồ Donut: Chi tiêu theo danh mục + legend" },
      { n: 13, text: "Biểu đồ Bar: Thu nhập vs Chi tiêu 6 tháng" },
      { n: 14, text: "Bảng phân tích chi tiết từng danh mục + % tổng" },
    ],
    settings: [
      { n: 1, text: "Logo sidebar" },
      { n: 2, text: "Nav active: Cài Đặt" },
      { n: 3, text: "User profile" },
      { n: 4, text: "Greeting header" },
      { n: 5, text: "Tìm kiếm" },
      { n: 6, text: "Notification bell" },
      { n: 7, text: "Avatar hiện tại + nút đổi ảnh đại diện" },
      { n: 8, text: "Form thông tin cá nhân + nút Lưu" },
      { n: 9, text: "Input Ngân sách hàng tháng (monthly_budget)" },
      { n: 10, text: "Input Quỹ khẩn cấp (emergency_buffer)" },
      { n: 11, text: "Input Ngày nhận lương (income_date: 1-31)" },
      { n: 12, text: "Form đổi mật khẩu (current → new → confirm)" },
      { n: 13, text: "Nút thêm danh mục mới" },
      { n: 14, text: "Danh sách danh mục + nút Sửa / Xóa" },
    ],
  };
  
  // =====================================================================
  // SCREEN CONFIG
  // =====================================================================
  
  const SCREENS = [
    { id: "login",        label: "1. Login",         Component: ScreenLogin,        annotKey: "login" },
    { id: "register",     label: "2. Register",       Component: ScreenRegister,     annotKey: "register" },
    { id: "dashboard",    label: "3. Dashboard",      Component: ScreenDashboard,    annotKey: "dashboard" },
    { id: "transactions", label: "4. Transactions",   Component: ScreenTransactions, annotKey: "transactions" },
    { id: "goals",        label: "5. Goals",          Component: ScreenGoals,        annotKey: "goals" },
    { id: "bills",        label: "6. Bills",          Component: ScreenBills,        annotKey: "bills" },
    { id: "analytics",    label: "7. Analytics",      Component: ScreenAnalytics,    annotKey: "analytics" },
    { id: "settings",     label: "8. Settings",       Component: ScreenSettings,     annotKey: "settings" },
  ];
  
  // =====================================================================
  // MAIN WIREFRAME VIEWER
  // =====================================================================
  
  export default function Wireframes() {
    const [current, setCurrent] = useState(0);
    const [scale, setScale] = useState(85);
  
    const Screen = SCREENS[current].Component;
    const annotations = ANNOTATIONS[SCREENS[current].annotKey] || [];
    const canGoPrev = current > 0;
    const canGoNext = current < SCREENS.length - 1;
  
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#1E293B", display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>
  
        {/* ── TOP BAR ── */}
        <div style={{ backgroundColor: "#0F172A", borderBottom: "1px solid #334155", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
          {/* Back to app */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, backgroundColor: "#1E293B", border: "1px solid #334155", textDecoration: "none" }}>
            <Home size={14} color="#94A3B8" />
            <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>App</span>
          </Link>
  
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Monitor size={16} color="#60A5FA" />
            <span style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 700 }}>S2S Finance — Wireframe Document</span>
            <span style={{ fontSize: 10, color: "#64748B", backgroundColor: "#1E293B", padding: "2px 7px", borderRadius: 999, border: "1px solid #334155" }}>CSB25022 VNUK</span>
          </div>
  
          <div style={{ flex: 1 }} />
  
          {/* Zoom controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: "2px 4px" }}>
            <button onClick={() => setScale(s => Math.max(50, s - 10))} style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ZoomOut size={14} color="#94A3B8" />
            </button>
            <span style={{ fontSize: 11, color: "#E2E8F0", fontWeight: 600, width: 36, textAlign: "center" }}>{scale}%</span>
            <button onClick={() => setScale(s => Math.min(120, s + 10))} style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ZoomIn size={14} color="#94A3B8" />
            </button>
          </div>
  
          {/* Print button */}
          <button
            onClick={() => window.print()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, backgroundColor: "#3B82F6", border: "none", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700 }}
          >
            <Printer size={14} />
            In / Export PDF
          </button>
        </div>
  
        {/* ── SCREEN TABS ── */}
        <div style={{ backgroundColor: "#0F172A", borderBottom: "1px solid #334155", padding: "0 16px", display: "flex", gap: 2, overflowX: "auto" }}>
          {SCREENS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              style={{
                padding: "10px 14px",
                fontSize: 11,
                fontWeight: i === current ? 700 : 500,
                color: i === current ? "#60A5FA" : "#64748B",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: i === current ? "2px solid #3B82F6" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
  
        {/* ── MAIN CONTENT AREA ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
  
          {/* Wireframe canvas */}
          <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 24 }}>
            <div style={{ width: "100%", maxWidth: 1100 }}>
              {/* Frame label */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 18, color: "#E2E8F0", fontWeight: 700 }}>{SCREENS[current].label}</span>
                  <span style={{ fontSize: 11, color: "#475569", marginLeft: 10 }}>S2S Finance / {SCREENS[current].id}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => canGoPrev && setCurrent(c => c - 1)}
                    disabled={!canGoPrev}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, backgroundColor: canGoPrev ? "#1E293B" : "transparent", border: `1px solid ${canGoPrev ? "#334155" : "#1E293B"}`, color: canGoPrev ? "#94A3B8" : "#334155", cursor: canGoPrev ? "pointer" : "not-allowed", fontSize: 11, fontWeight: 600 }}
                  >
                    <ChevronLeft size={13} /> Trước
                  </button>
                  <span style={{ fontSize: 11, color: "#475569" }}>{current + 1} / {SCREENS.length}</span>
                  <button
                    onClick={() => canGoNext && setCurrent(c => c + 1)}
                    disabled={!canGoNext}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, backgroundColor: canGoNext ? "#1E293B" : "transparent", border: `1px solid ${canGoNext ? "#334155" : "#1E293B"}`, color: canGoNext ? "#94A3B8" : "#334155", cursor: canGoNext ? "pointer" : "not-allowed", fontSize: 11, fontWeight: 600 }}
                  >
                    Sau <ChevronRight size={13} />
                  </button>
                </div>
              </div>
  
              {/* The wireframe frame */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  border: "2px solid #334155",
                  borderRadius: 12,
                  overflow: "hidden",
                  backgroundColor: "#F8FAFC",
                  position: "relative",
                  transform: `scale(${scale / 100})`,
                  transformOrigin: "top left",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                }}
              >
                <Screen />
              </div>
  
              {/* Frame spec bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, padding: "8px 12px", backgroundColor: "#0F172A", borderRadius: 8, border: "1px solid #1E293B" }}>
                <span style={{ fontSize: 10, color: "#475569" }}>📐 Frame: 1280 × 720px (16:9)</span>
                <span style={{ fontSize: 10, color: "#475569" }}>🖥 Desktop viewport</span>
                <span style={{ fontSize: 10, color: "#475569" }}>⬛ Lo-fi wireframe style</span>
                <span style={{ fontSize: 10, color: "#475569", marginLeft: "auto" }}>
                  🔵 Annotation markers = numbered elements below
                </span>
              </div>
            </div>
          </div>
  
          {/* ── RIGHT PANEL: Annotations ── */}
          <div style={{ width: 260, flexShrink: 0, backgroundColor: "#0F172A", borderLeft: "1px solid #334155", padding: 16, overflow: "auto" }}>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "#E2E8F0", fontWeight: 700 }}>Annotation</span>
              <div style={{ height: 1, backgroundColor: "#1E293B", marginTop: 8 }} />
            </div>
  
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {annotations.map((ann) => (
                <div key={ann.n} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>{ann.n}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.5 }}>{ann.text}</span>
                </div>
              ))}
            </div>
  
            {/* Page info */}
            <div style={{ marginTop: 20, padding: 12, backgroundColor: "#1E293B", borderRadius: 8, border: "1px solid #334155" }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, fontWeight: 700 }}>THÔNG TIN MÀN HÌNH</div>
              <div style={{ fontSize: 10, color: "#64748B", lineHeight: 1.8 }}>
                <div>Screen ID: <span style={{ color: "#94A3B8" }}>{SCREENS[current].id}</span></div>
                <div>Vị trí: <span style={{ color: "#94A3B8" }}>{current + 1}/{SCREENS.length}</span></div>
                <div>Annotations: <span style={{ color: "#94A3B8" }}>{annotations.length} mục</span></div>
              </div>
            </div>
  
            {/* All screens mini-nav */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, fontWeight: 700 }}>TẤT CẢ MÀN HÌNH</div>
              {SCREENS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrent(i)}
                  style={{
                    width: "100%", textAlign: "left", padding: "6px 8px", borderRadius: 6, border: "none",
                    backgroundColor: i === current ? "#1E3A5F" : "transparent",
                    color: i === current ? "#60A5FA" : "#475569",
                    fontSize: 11, fontWeight: i === current ? 700 : 400,
                    cursor: "pointer", marginBottom: 2, display: "block",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
  
        {/* ── PRINT STYLES ── */}
        <style>{`
          @media print {
            body { background: white !important; }
            @page { size: A4 landscape; margin: 10mm; }
          }
        `}</style>
      </div>
    );
  }
