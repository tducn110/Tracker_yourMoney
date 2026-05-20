'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

export default function LoginPage() {
  const { loginWithGoogle, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState<string | null>(null);
  // NOT async — Safari consumes user activation on the first await, which
  // blocks window.open() inside signInWithPopup. Calling loginFn() synchronously
  // preserves the activation context so the popup can open.
  const handleLogin = (provider: string, loginFn: () => Promise<void>) => {
    setLoading(provider);
    loginFn()
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(null);
      });
  };

  return (
    <div className="min-h-screen flex relative bg-slate-50 overflow-hidden">
      {/* Ambient background blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none" />

      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md bg-white/60 backdrop-blur-xl p-10 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20" style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[20px] text-slate-800 tracking-tight">Finance Tracker</h1>
              <p className="text-[12px] text-slate-500 font-medium">Budget-First Tracker</p>
            </div>
          </div>

          <h2 className="text-[28px] font-extrabold mb-2 text-slate-800 tracking-tight">Chào mừng bạn! 👋</h2>
          <p className="mb-8 text-[15px] text-slate-500">Đăng nhập để quản lý tài chính của bạn một cách thông minh.</p>

          <div className="space-y-4">
            <button
              onClick={() => handleLogin('google', loginWithGoogle)}
              disabled={!!loading || authLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:shadow-lg hover:border-blue-200 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
              )}
              <span className="font-semibold text-[16px]">
                {loading === 'google' ? 'Đang kết nối...' : 'Tiếp tục với Google'}
              </span>
            </button>

            <p className="text-[13px] text-center leading-relaxed text-slate-400 mt-6">
              Bằng cách đăng nhập, bạn đồng ý với <a href="#" className="underline hover:text-blue-600 transition-colors">Điều khoản dịch vụ</a> và <a href="#" className="underline hover:text-blue-600 transition-colors">Chính sách bảo mật</a> của chúng tôi.
            </p>
          </div>
        </div>
      </div>

      {/* Right - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
        {/* Animated decorative circles */}
        <div className="absolute top-[20%] right-[10%] w-64 h-64 rounded-full border border-white/20 animate-[spin_20s_linear_infinite]" />
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 rounded-full border border-white/10 animate-[spin_30s_linear_infinite_reverse]" />
        
        <div className="text-white text-center max-w-md relative z-10">
          <div className="text-8xl mb-8 drop-shadow-2xl">💰</div>
          <h2 className="text-[40px] font-extrabold mb-4 tracking-tight leading-tight">Kiểm soát<br />tài chính của bạn</h2>
          <p className="text-[16px] opacity-90 leading-relaxed font-medium">
            Finance Tracker giúp bạn theo dõi thu chi, quản lý mục tiêu tiết kiệm và kiểm soát hóa đơn hàng tháng một cách thông minh.
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { icon: '📊', label: 'Phân tích', sub: 'Chi tiết & Trực quan' },
              { icon: '🎯', label: 'Mục tiêu', sub: 'Tiết kiệm hiệu quả' },
              { icon: '🔔', label: 'Nhắc nhở', sub: 'Không trễ hóa đơn' },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors text-left">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-[14px] font-bold text-white mb-0.5">{item.label}</p>
                <p className="text-[11px] text-white/70">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
