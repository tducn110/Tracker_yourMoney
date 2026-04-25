'use client';

import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff, Sparkles, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Column: Branding & Info */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-[24px] tracking-tight">S2S Finance</h1>
              <p className="text-[12px] font-bold text-blue-200 uppercase tracking-widest">Behavioral Finance V3</p>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-[48px] font-black leading-tight max-w-md">
              Làm chủ tài chính, <br/>
              <span className="text-blue-300">An tâm chi tiêu.</span>
            </h2>
            <p className="text-[18px] text-blue-100/80 max-w-sm leading-relaxed font-medium">
              Tham gia cùng hàng ngàn người đang sử dụng triết lý "Khoảng Chi Tiêu An Toàn" để tối ưu hóa dòng tiền mỗi ngày.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <ShieldCheck className="text-blue-300 mb-3" size={24} />
            <h3 className="font-bold text-[15px] mb-1">Bảo mật tuyệt đối</h3>
            <p className="text-[12px] text-blue-100/60">Dữ liệu của bạn được mã hóa và bảo vệ an toàn.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <Sparkles className="text-blue-300 mb-3" size={24} />
            <h3 className="font-bold text-[15px] mb-1">AI Thông minh</h3>
            <p className="text-[12px] text-blue-100/60">Tự động phân loại chi tiêu chỉ với một câu chat.</p>
          </div>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-[32px] font-black text-slate-900 tracking-tight">Tạo tài khoản mới</h2>
            <p className="text-slate-500 font-medium mt-2">Bắt đầu hành trình quản lý tài chính thông minh ngay hôm nay.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 ml-1">Họ và tên</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-white font-medium text-[15px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-white font-medium text-[15px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 ml-1">Mật khẩu</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-slate-100 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-white font-medium text-[15px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-1">
              <input type="checkbox" required className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                Tôi đồng ý với <a href="#" className="text-blue-600 font-bold hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-blue-600 font-bold hover:underline">Chính sách bảo mật</a> của S2S Finance.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-[16px] shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-[15px] font-medium text-slate-500">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-600 font-black hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}