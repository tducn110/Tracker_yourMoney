"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  userAPI,
  walletAPI,
  type OnboardingStatus,
  type Wallet,
} from "@finance/api-client";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WALLET_PRESETS: Array<{
  name: string;
  type: Wallet["type"];
  balance: string;
}> = [
  { name: "Vi Tien Mat", type: "cash", balance: "2000000" },
  { name: "Tai Khoan Ngan Hang", type: "bank", balance: "10000000" },
  { name: "Vi Dien Tu", type: "e_wallet", balance: "1000000" },
];

const STEPS = [
  { id: 1, title: "Thong tin", icon: UserRound },
  { id: 2, title: "Vi dau tien", icon: WalletCards },
  { id: 3, title: "Ngan sach", icon: CircleDollarSign },
  { id: 4, title: "Du lieu mau", icon: Sparkles },
];

function StepHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle: string;
}) {
  const progress = (step / STEPS.length) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm font-medium text-slate-500">
        <span>Buoc {step}/4</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-3">
        {STEPS.map((item) => {
          const Icon = item.icon;
          const active = item.id === step;
          const completed = item.id < step;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                active
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : completed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{item.title}</span>
            </div>
          );
        })}
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const { user, loading: authLoading, markOnboarded } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [step, setStep] = useState(1);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [walletName, setWalletName] = useState("Vi Tien Mat");
  const [walletType, setWalletType] = useState<Wallet["type"]>("cash");
  const [walletBalance, setWalletBalance] = useState("2000000");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [seedSamplePack, setSeedSamplePack] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (user?.hasOnboarded) {
      router.replace("/");
    }
  }, [router, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      if (!user) return;

      try {
        const response = await userAPI.onboardingStatus();
        if (cancelled) return;

        setStatus(response);
        setFullName(response.profile.fullName || "");
        setMonthlyBudget(response.settingsSummary.monthlyBudget || "");

        if (response.walletSummary) {
          setWalletName(response.walletSummary.name);
          setWalletType(response.walletSummary.type);
          setWalletBalance(response.walletSummary.balance);
        }
      } catch (error: any) {
        toast.error(error?.message || "Khong the tai trang thai onboarding");
      } finally {
        if (!cancelled) {
          setLoadingStatus(false);
        }
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleProfileSubmit = async () => {
    if (!fullName.trim()) {
      toast.error("Vui long nhap ho ten");
      return;
    }

    setSubmitting(true);
    try {
      await userAPI.updateProfile({ fullName: fullName.trim() });
      setStep(2);
    } catch (error: any) {
      toast.error(error?.message || "Khong the luu thong tin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWalletSubmit = async () => {
    if (!status?.walletSummary && !walletName.trim()) {
      toast.error("Vui long nhap ten vi");
      return;
    }

    setSubmitting(true);
    try {
      if (!status?.walletSummary) {
        await walletAPI.create({
          name: walletName.trim(),
          type: walletType,
          initialBalance: walletBalance || "0",
          icon: "",
          color: "#0F766E",
          isDefault: true,
        });
      }

      const nextStatus = await userAPI.onboardingStatus();
      setStatus(nextStatus);
      setStep(3);
    } catch (error: any) {
      toast.error(error?.message || "Khong the thiet lap vi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBudgetSubmit = async () => {
    setSubmitting(true);
    try {
      await userAPI.updateSettings({
        monthlyBudget: monthlyBudget || "0",
      });
      setStep(4);
    } catch (error: any) {
      toast.error(error?.message || "Khong the luu ngan sach");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const result = await userAPI.completeOnboarding({ seedSamplePack });
      if (result.hasOnboarded) {
        markOnboarded();
        toast.success(
          result.samplePackSeeded
            ? "Da hoan tat va nap du lieu mau"
            : "Da hoan tat thiet lap tai khoan",
        );
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error?.message || "Khong the hoan tat onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingStatus || !user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
        <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          Dang tai onboarding...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-500/25">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">First-time setup</p>
          <h2 className="text-xl font-bold text-slate-900">Hoan tat tai khoan cua ban</h2>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white/85 shadow-xl shadow-slate-200/70">
        <CardContent className="space-y-8 p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <StepHeader
                step={1}
                title="Xac nhan thong tin ca nhan"
                subtitle="Ten nay se duoc dung tren dashboard va cac thong bao."
              />
              <div className="space-y-2">
                <Label htmlFor="fullName">Ho va ten</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Nhap ho va ten cua ban"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleProfileSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Tiep tuc
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <StepHeader
                step={2}
                title="Thiet lap vi dau tien"
                subtitle="Wizard se dung vi mac dinh nay cho cac giao dich dau tien."
              />

              {status?.walletSummary ? (
                <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-900">Da co vi san sang</p>
                      <p className="text-sm text-emerald-700">
                        {status.walletSummary.name} • {Number(status.walletSummary.balance).toLocaleString("vi-VN")} VND
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-700">
                    Wizard se tiep tuc voi vi hien tai de tranh tao trung du lieu.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {WALLET_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setWalletName(preset.name);
                          setWalletType(preset.type);
                          setWalletBalance(preset.balance);
                        }}
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          walletType === preset.type && walletName === preset.name
                            ? "border-sky-300 bg-sky-50 text-sky-800"
                            : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <p className="font-semibold">{preset.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {Number(preset.balance).toLocaleString("vi-VN")} VND
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="walletName">Ten vi</Label>
                      <Input
                        id="walletName"
                        value={walletName}
                        onChange={(event) => setWalletName(event.target.value)}
                        placeholder="Vi Tien Mat"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="walletBalance">So du ban dau</Label>
                      <Input
                        id="walletBalance"
                        inputMode="numeric"
                        value={walletBalance}
                        onChange={(event) => setWalletBalance(event.target.value)}
                        placeholder="2000000"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Quay lai
                </Button>
                <Button onClick={handleWalletSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Tiep tuc
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <StepHeader
                step={3}
                title="Dat ngan sach thang"
                subtitle="Wizard luu muc nay vao user settings hien tai cua ban."
              />
              <div className="space-y-2">
                <Label htmlFor="monthlyBudget">Ngan sach hang thang</Label>
                <Input
                  id="monthlyBudget"
                  inputMode="numeric"
                  value={monthlyBudget}
                  onChange={(event) => setMonthlyBudget(event.target.value)}
                  placeholder="5000000"
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Quay lai
                </Button>
                <Button onClick={handleBudgetSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Tiep tuc
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <StepHeader
                step={4}
                title="Co nap du lieu mau khong?"
                subtitle="Neu bat, dashboard se co san mot vai giao dich minh hoa tren chinh tai khoan cua ban."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSeedSamplePack(false)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    !seedSamplePack
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <p className="font-semibold">Khong can du lieu mau</p>
                  <p className={`mt-1 text-sm ${!seedSamplePack ? "text-slate-200" : "text-slate-500"}`}>
                    Vao app voi du lieu sach va tu them giao dich sau.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setSeedSamplePack(true)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    seedSamplePack
                      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <p className="font-semibold">Nap sample pack</p>
                  <p className={`mt-1 text-sm ${seedSamplePack ? "text-emerald-700" : "text-slate-500"}`}>
                    Tao hai giao dich mau tren vi mac dinh de dashboard co noi dung ngay.
                  </p>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
                Wizard chi ghi du lieu vao current authenticated user. Khong co demo account, khong co hardcoded user id.
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)} disabled={submitting}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Quay lai
                </Button>
                <Button onClick={handleComplete} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Hoan tat
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
