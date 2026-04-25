import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", full_name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[18px]" style={{ color: "#1E293B" }}>S2S Finance</h1>
            <p className="text-[12px]" style={{ color: "#64748B" }}>Safe-to-Spend Tracker</p>
          </div>
        </div>

        <h2 className="text-[24px] font-bold mb-1" style={{ color: "#1E293B" }}>Tạo tài khoản mới 🚀</h2>
        <p className="mb-6 text-[14px]" style={{ color: "#64748B" }}>Bắt đầu hành trình quản lý tài chính thông minh</p>

        <form onSubmit={handleRegister} className="space-y-4">
          {[
            { key: "full_name", label: "Họ và tên", placeholder: "Nguyễn Văn A", type: "text" },
            { key: "username", label: "Tên đăng nhập", placeholder: "nguyenvana", type: "text" },
            { key: "email", label: "Email", placeholder: "email@example.com", type: "email" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-[14px] font-medium mb-1.5" style={{ color: "#374151" }}>
                {field.label}
              </label>
              <input
                type={field.type}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-colors text-[15px]"
                style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#1E293B" }}
                onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>
          ))}

          <div>
            <label className="block text-[14px] font-medium mb-1.5" style={{ color: "#374151" }}>
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Tối thiểu 8 ký tự..."
                className="w-full px-4 py-3 rounded-xl border outline-none transition-colors text-[15px] pr-12"
                style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#1E293B" }}
                onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: "#64748B" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-[15px] transition-all hover:shadow-lg disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng Ký"}
          </button>
        </form>

        <p className="text-center mt-5 text-[14px]" style={{ color: "#64748B" }}>
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-semibold" style={{ color: "#3B82F6" }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
