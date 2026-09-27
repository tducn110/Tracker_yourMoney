'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Eye, EyeOff, Mail, Lock, User, AtSign } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import { isFirebaseAvailable } from '../../../_lib/firebase';

type Tab = 'login' | 'register';

const firebaseReady = isFirebaseAvailable();

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<Tab>('login');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');

  const handleTabSwitch = (next: Tab) => {
    setTab(next);
    setError('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      setError(e?.message || 'Đăng nhập Google thất bại');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');

    if (!loginEmail.trim() || !loginPassword) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithEmail(loginEmail.trim(), loginPassword);
    } catch (e: any) {
      setError(e?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');

    if (!regFullName.trim()) { setError('Vui lòng nhập họ tên.'); return; }
    if (!regUsername.trim()) { setError('Vui lòng nhập tên người dùng.'); return; }
    if (!/^[a-z0-9_]+$/.test(regUsername)) { setError('Tên người dùng chỉ dùng chữ thường, số, gạch dưới.'); return; }
    if (regUsername.length < 3) { setError('Tên người dùng tối thiểu 3 ký tự.'); return; }
    if (!regEmail.trim()) { setError('Vui lòng nhập email.'); return; }
    if (regPassword.length < 8) { setError('Mật khẩu tối thiểu 8 ký tự.'); return; }
    if (regPassword !== regConfirm) { setError('Mật khẩu xác nhận không khớp.'); return; }

    setSubmitting(true);
    try {
      await registerWithEmail(regEmail.trim(), regPassword, regFullName.trim(), regUsername.trim());
    } catch (e: any) {
      setError(e?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || authLoading;

  return (
    <div className="min-h-screen flex relative bg-slate-50 overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none" />

      {/* ── Left: Form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-7">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
            >
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[20px] text-slate-800 tracking-tight">Finance Tracker</h1>
              <p className="text-[12px] text-slate-500 font-medium">Budget-First Tracker</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-7 gap-1">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTabSwitch(t)}
                disabled={busy}
                className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition-all ${
                  tab === t
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium">
              {error}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={busy}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={busy}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              {firebaseReady && (
                <>
                  {/* Divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[12px] text-slate-400 font-medium">hoặc</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={busy || googleLoading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-[15px] font-semibold transition-all hover:bg-slate-50 hover:shadow-md hover:border-blue-200 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {googleLoading ? (
                      <Loader2 size={18} className="animate-spin text-slate-400" />
                    ) : (
                      <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5 group-hover:scale-110 transition-transform"
                      />
                    )}
                    {googleLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}
                  </button>
                </>
              )}

              <p className="text-center text-[13px] text-slate-400 mt-2">
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => handleTabSwitch('register')} className="text-blue-600 font-semibold hover:underline">
                  Đăng ký ngay
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              {/* Full name */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Họ và tên</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    disabled={busy}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">
                  Tên người dùng <span className="text-slate-400 font-normal">(chữ thường, số, _)</span>
                </label>
                <div className="relative">
                  <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="nguyen_van_a"
                    required
                    disabled={busy}
                    minLength={3}
                    maxLength={50}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={busy}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">
                  Mật khẩu <span className="text-slate-400 font-normal">(tối thiểu 8 ký tự)</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={busy}
                    minLength={8}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={busy}
                    className={`w-full pl-10 pr-11 py-3 rounded-xl border text-slate-800 text-[14px] placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60 ${
                      regConfirm && regPassword !== regConfirm
                        ? 'border-red-300 bg-red-50/40'
                        : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {regConfirm && regPassword !== regConfirm && (
                  <p className="mt-1 text-[12px] text-red-500">Mật khẩu không khớp</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {submitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </button>

              {firebaseReady && (
                <>
                  {/* Divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[12px] text-slate-400 font-medium">hoặc</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={busy || googleLoading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-[15px] font-semibold transition-all hover:bg-slate-50 hover:shadow-md hover:border-blue-200 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {googleLoading ? (
                      <Loader2 size={18} className="animate-spin text-slate-400" />
                    ) : (
                      <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5 group-hover:scale-110 transition-transform"
                      />
                    )}
                    {googleLoading ? 'Đang kết nối...' : 'Đăng ký với Google'}
                  </button>
                </>
              )}

              <p className="text-center text-[13px] text-slate-400 mt-2">
                Đã có tài khoản?{' '}
                <button type="button" onClick={() => handleTabSwitch('login')} className="text-blue-600 font-semibold hover:underline">
                  Đăng nhập
                </button>
              </p>
            </form>
          )}

          {/* ToS */}
          <p className="text-[12px] text-center leading-relaxed text-slate-400 mt-6">
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <a href="#" className="underline hover:text-blue-600 transition-colors">Điều khoản dịch vụ</a>
            {' '}và{' '}
            <a href="#" className="underline hover:text-blue-600 transition-colors">Chính sách bảo mật</a>.
          </p>
        </div>
      </div>

      {/* ── Right: Illustration panel (desktop only) ── */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
      >
        <div className="absolute top-[20%] right-[10%] w-64 h-64 rounded-full border border-white/20 animate-[spin_20s_linear_infinite]" />
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 rounded-full border border-white/10 animate-[spin_30s_linear_infinite_reverse]" />

        <div className="text-white text-center max-w-md relative z-10">
          <div className="text-8xl mb-8 drop-shadow-2xl">💰</div>
          <h2 className="text-[40px] font-extrabold mb-4 tracking-tight leading-tight">
            Kiểm soát<br />tài chính của bạn
          </h2>
          <p className="text-[16px] opacity-90 leading-relaxed font-medium">
            Finance Tracker giúp bạn theo dõi thu chi, quản lý mục tiêu tiết kiệm và kiểm soát hóa đơn hàng tháng một cách thông minh.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { icon: '📊', label: 'Phân tích', sub: 'Chi tiết & Trực quan' },
              { icon: '🎯', label: 'Mục tiêu', sub: 'Tiết kiệm hiệu quả' },
              { icon: '🔔', label: 'Nhắc nhở', sub: 'Không trễ hóa đơn' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
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
