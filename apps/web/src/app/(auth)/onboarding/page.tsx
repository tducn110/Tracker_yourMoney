import { OnboardingWizard } from "@/components/onboarding/wizard";

export const metadata = {
  title: "Thiết lập tài khoản | Finance Tracker",
  description: "Hoàn tất thiết lập tài khoản để bắt đầu quản lý tài chính",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_30%),#f8fafc] px-4 py-10">
      <OnboardingWizard />
    </div>
  );
}
