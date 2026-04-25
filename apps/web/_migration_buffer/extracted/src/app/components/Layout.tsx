import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  LayoutDashboard,
  ListOrdered,
  Receipt,
  Target,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
  Smile,
  BarChart3,
  Plus,
} from "lucide-react";
import { mockUser, getGreeting } from "../data/mockData";
import { QuickAddModal } from "./QuickAddModal";
import { motion } from "motion/react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Tổng Quan", end: true },
  { path: "/transactions", icon: ListOrdered, label: "Giao Dịch" },
  { path: "/goals", icon: Target, label: "Mục Tiêu" },
  { path: "/bills", icon: Receipt, label: "Hóa Đơn" },
  { path: "/analytics", icon: BarChart3, label: "Phân Tích" },
  { path: "/settings", icon: Settings, label: "Cài Đặt" },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 font-sans relative overflow-hidden">
      {/* Animated background mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-gradient-to-tl from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 ease-in-out shadow-[0_8px_30px_rgba(0,0,0,0.04)]
          ${sidebarOpen ? "w-[260px]" : "w-[80px]"}
          hidden md:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 h-[80px] relative">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30"
          >
            <Sparkles size={20} className="text-white" />
          </motion.div>
          <div
            className={`flex flex-col transition-all duration-300 overflow-hidden ${
              sidebarOpen ? "w-full opacity-100" : "w-0 opacity-0"
            }`}
          >
            <span className="font-bold text-[16px] text-gray-900 whitespace-nowrap tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">S2S Finance</span>
            <p className="text-[11px] text-gray-500 font-semibold whitespace-nowrap tracking-wide">Safe-to-Spend</p>
          </div>
        </div>

        {/* Toggle Button (Absolute) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3.5 top-8 bg-white border border-gray-200 shadow-lg shadow-gray-200/50 p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all z-10"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180"}`} />
        </motion.button>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-blue-50/80 text-blue-600 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && sidebarOpen && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                  )}
                  <item.icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`flex-shrink-0 ${sidebarOpen ? "ml-1" : "mx-auto"}`}
                  />
                  {sidebarOpen && <span className="text-[14px]">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 mt-auto">
          <div className={`p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/60 border border-gray-200/50 flex items-center gap-3 shadow-sm ${!sidebarOpen && "justify-center"}`}>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border border-blue-300/50 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
            >
              {mockUser.avatar}
            </motion.div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">{mockUser.full_name}</p>
                <p className="text-[11px] font-medium text-gray-500 truncate">@{mockUser.username}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium ${!sidebarOpen && "justify-center"}`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-[13px]">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col bg-white border-r border-gray-100 shadow-2xl transition-transform duration-300 ease-in-out
          w-[280px] md:hidden
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-5 py-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-bold text-[16px] text-gray-900">S2S Finance</span>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-full hover:bg-gray-50">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
                  isActive ? "bg-blue-50/80 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <item.icon size={20} strokeWidth={2} />
              <span className="text-[15px]">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${sidebarOpen ? "md:ml-[260px]" : "md:ml-[80px]"}`}>
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-2xl border-b border-gray-200/40 px-6 lg:px-10 h-[80px] flex items-center gap-6 shadow-sm">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100/80 md:hidden transition-colors"
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[20px] font-bold text-gray-900 tracking-tight flex items-center gap-2"
            >
              {getGreeting()}, {mockUser.full_name.split(" ")[mockUser.full_name.split(" ").length - 1]} 👋
            </motion.h1>
            <p className="text-[13px] font-medium text-gray-500 hidden sm:block mt-0.5">
              Hôm nay là {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl px-4 py-2.5 w-[240px] focus-within:w-[300px] focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all shadow-sm hover:shadow-md">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="bg-transparent outline-none text-[14px] w-full text-gray-700 placeholder:text-gray-400 font-medium"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 ring-2 ring-white shadow-sm"></span>
          </motion.button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setQuickAddOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl text-white shadow-[0_8px_30px_rgba(59,130,246,0.4),0_2px_10px_rgba(59,130,246,0.2)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.5),0_8px_20px_rgba(59,130,246,0.3)] transition-all duration-300 z-40 flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
}