import { OnboardingWizard } from "@/components/onboarding/wizard";

export const metadata = {
  title: "Thiết lập tài khoản | Finance Tracker",
  description: "Hoàn tất thiết lập tài khoản để bắt đầu quản lý tài chính",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <OnboardingWizard />
    </div>
  );
}
