'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

export default function LoginPage() {
  const { 
    user,
    loginWithGoogle, 
    loginWithFacebook, 
    loginWithGithub, 
    loginWithApple, 
    loading: authLoading 
  } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (provider: string, loginFn: () => Promise<void>) => {
    setLoading(provider);
    try {
      await loginFn();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex relative bg-slate-50 overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Ambient background blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none" />

      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md bg-white/60 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
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

          <div className="space-y-3">
            <button
              onClick={() => handleLogin('google', loginWithGoogle)}
              disabled={!!loading || authLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
              <span className="font-semibold text-[15px]">
                {loading === 'google' ? 'Đang kết nối...' : 'Tiếp tục với Google'}
              </span>
            </button>

            <button
              onClick={() => handleLogin('facebook', loginWithFacebook)}
              disabled={!!loading || authLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl transition-all hover:opacity-90 hover:shadow-md hover:shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed group"
              style={{ background: '#1877F2', color: '#FFFFFF' }}
            >
              {loading === 'facebook' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              )}
              <span className="font-semibold text-[15px]">
                {loading === 'facebook' ? 'Đang kết nối...' : 'Tiếp tục với Facebook'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleLogin('github', loginWithGithub)}
                disabled={!!loading || authLoading}
                className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all hover:opacity-90 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed group"
                style={{ background: '#24292F', color: '#FFFFFF' }}
              >
                {loading === 'github' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                )}
                <span className="font-semibold text-[14px]">GitHub</span>
              </button>

              <button
                onClick={() => handleLogin('apple', loginWithApple)}
                disabled={!!loading || authLoading}
                className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all hover:opacity-90 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed group"
                style={{ background: '#000000', color: '#FFFFFF' }}
              >
                {loading === 'apple' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M17.05 20.28c-.96.95-2.44 2.08-4.4 2.08-2.25 0-3.11-1.39-5.22-1.39-2.14 0-3.22 1.35-5.18 1.35-1.74 0-3.32-1.35-4.24-2.5-2.02-2.52-2.6-6.52-1.44-8.82 1.15-2.29 3.48-3.72 5.56-3.72 1.58 0 2.97.94 4.02.94.98 0 2.06-.94 3.9-.94 1.83 0 3.32.78 4.28 2.08-2.31 1.34-1.92 4.74.4 5.92-.8 2.3-2.14 4.05-3.48 5.43v-.43zm-4.32-15.65c.98-1.22 1.35-2.88 1.05-4.52-1.48.06-2.92.93-3.78 2.05-1.02 1.25-1.44 2.96-1.14 4.54 1.58.12 3.01-.85 3.87-2.07z"/></svg>
                )}
                <span className="font-semibold text-[14px]">Apple</span>
              </button>
            </div>

            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Security First</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>
            
            <p className="text-[13px] text-center leading-relaxed text-slate-500">
              Bằng cách đăng nhập, bạn đồng ý với <a href="#" className="underline hover:text-blue-600 transition-colors">Điều khoản dịch vụ</a> và <a href="#" className="underline hover:text-blue-600 transition-colors">Chính sách bảo mật</a> của chúng tôi.
            </p>
          </div>

          {/* Feature hint */}
          <div className="mt-8 p-4 rounded-2xl border border-blue-100 bg-blue-50/50">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">🛡️</div>
              <div>
                <h4 className="text-[14px] font-bold text-blue-900 mb-0.5">Xác thực bảo mật</h4>
                <p className="text-[12px] text-blue-700/80">Chúng tôi sử dụng Firebase Auth để đảm bảo tài khoản của bạn luôn được bảo vệ.</p>
              </div>
            </div>
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