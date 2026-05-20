"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  FolderPlus,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  WalletCards,
} from "lucide-react";
import {
  userAPI,
  type CompleteOnboardingRequest,
  type OnboardingStatus,
  type Wallet,
} from "@finance/api-client";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListSkeleton, Spinner } from "@/components/ui/loading";

type StepId = 1 | 2 | 3 | 4;
type CategoryDraft = NonNullable<CompleteOnboardingRequest["categories"]>[number] & { localId: string };
type SampleTransactionDraft = NonNullable<CompleteOnboardingRequest["sampleTransactions"]>[number] & { localId: string };

const STORAGE_KEY_PREFIX = "finance:onboarding-draft";

const WALLET_PRESETS: Array<{
  name: string;
  type: Wallet["type"];
  balance: string;
}> = [
  { name: "Ví Tiền Mặt", type: "cash", balance: "2000000" },
  { name: "Tài Khoản Ngân Hàng", type: "bank", balance: "10000000" },
  { name: "Ví Điện Tử", type: "e_wallet", balance: "1000000" },
];

const DEFAULT_CATEGORIES: CategoryDraft[] = [
  { localId: "cat-income", name: "Thu Nhập", icon: "💰", color: "#10B981", type: "income", sortOrder: 1 },
  { localId: "cat-food", name: "Ăn Uống", icon: "🍜", color: "#F59E0B", type: "expense", sortOrder: 2 },
  { localId: "cat-transport", name: "Di Chuyển", icon: "🚗", color: "#EAB308", type: "expense", sortOrder: 3 },
  { localId: "cat-shopping", name: "Mua Sắm", icon: "🛍️", color: "#EC4899", type: "expense", sortOrder: 4 },
  { localId: "cat-home", name: "Nhà Ở", icon: "🏠", color: "#8B5CF6", type: "expense", sortOrder: 5 },
  { localId: "cat-bills", name: "Hóa Đơn", icon: "📄", color: "#6B7280", type: "expense", sortOrder: 6 },
];

const DEFAULT_SAMPLE_TRANSACTIONS: SampleTransactionDraft[] = [
  {
    localId: "sample-income",
    categoryName: "Thu Nhập",
    amount: "12000000",
    type: "income",
    note: "Thu nhập khởi tạo",
  },
  {
    localId: "sample-food",
    categoryName: "Ăn Uống",
    amount: "180000",
    type: "expense",
    note: "Bữa ăn đầu tiên",
  },
];

const STEPS: Array<{ id: StepId; title: string; icon: typeof Sparkles }> = [
  { id: 1, title: "Chào mừng", icon: Sparkles },
  { id: 2, title: "Danh mục", icon: FolderPlus },
  { id: 3, title: "Giao dịch mẫu", icon: CircleDollarSign },
  { id: 4, title: "Hoàn tất", icon: CheckCircle2 },
];

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeCategories(categories: CategoryDraft[]) {
  return categories.map((category, index) => ({
    ...category,
    name: category.name.trim(),
    icon: category.icon || "📦",
    color: category.color || "#6B7280",
    sortOrder: category.sortOrder ?? index + 1,
  }));
}

function StepHeader({
  step,
  maxCompletedStep,
  title,
  subtitle,
  onGoToStep,
}: {
  step: StepId;
  maxCompletedStep: StepId;
  title: string;
  subtitle: string;
  onGoToStep: (step: StepId) => void;
}) {
  const progress = (step / STEPS.length) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm font-medium text-slate-500">
        <span>Bước {step}/4</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-linear-to-r from-sky-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((item) => {
          const Icon = item.icon;
          const active = item.id === step;
          const completed = item.id < step;
          const canNavigate = item.id <= maxCompletedStep;

          return (
            <button
              key={item.id}
              type="button"
              disabled={!canNavigate}
              onClick={() => onGoToStep(item.id)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : completed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.title}</span>
            </button>
          );
        })}
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-normal text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const { user, loading: authLoading, markOnboarded } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [step, setStep] = useState<StepId>(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState<StepId>(1);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [walletName, setWalletName] = useState(WALLET_PRESETS[0].name);
  const [walletType, setWalletType] = useState<Wallet["type"]>(WALLET_PRESETS[0].type);
  const [walletBalance, setWalletBalance] = useState(WALLET_PRESETS[0].balance);
  const [categories, setCategories] = useState<CategoryDraft[]>(DEFAULT_CATEGORIES);
  const [sampleTransactions, setSampleTransactions] = useState<SampleTransactionDraft[]>(DEFAULT_SAMPLE_TRANSACTIONS);
  const [editingCategory, setEditingCategory] = useState<CategoryDraft | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<"income" | "expense">("expense");
  const [categoryIcon, setCategoryIcon] = useState("📦");
  const [categoryColor, setCategoryColor] = useState("#6B7280");
  const [sampleCategoryName, setSampleCategoryName] = useState(DEFAULT_SAMPLE_TRANSACTIONS[1].categoryName);
  const [sampleAmount, setSampleAmount] = useState("180000");
  const [sampleNote, setSampleNote] = useState("");
  const [sampleDate, setSampleDate] = useState(new Date().toISOString().slice(0, 10));

  const storageKey = user ? `${STORAGE_KEY_PREFIX}:${user.id}` : null;
  const hasWallet = Boolean(status?.walletSummary);
  const validCategories = useMemo(() => normalizeCategories(categories).filter((category) => category.name), [categories]);

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

        if (response.walletSummary) {
          setWalletName(response.walletSummary.name);
          setWalletType(response.walletSummary.type);
          setWalletBalance(response.walletSummary.balance);
        }
      } catch (error: any) {
        toast.error(error?.message || "Không thể tải trạng thái onboarding");
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

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as {
        step?: StepId;
        maxCompletedStep?: StepId;
        fullName?: string;
        walletName?: string;
        walletType?: Wallet["type"];
        walletBalance?: string;
        categories?: CategoryDraft[];
        sampleTransactions?: SampleTransactionDraft[];
      };

      if (parsed.step) setStep(parsed.step);
      if (parsed.maxCompletedStep) setMaxCompletedStep(parsed.maxCompletedStep);
      if (parsed.fullName !== undefined) setFullName(parsed.fullName);
      if (parsed.walletName) setWalletName(parsed.walletName);
      if (parsed.walletType) setWalletType(parsed.walletType);
      if (parsed.walletBalance !== undefined) setWalletBalance(parsed.walletBalance);
      if (Array.isArray(parsed.categories) && parsed.categories.length > 0) setCategories(parsed.categories);
      if (Array.isArray(parsed.sampleTransactions)) setSampleTransactions(parsed.sampleTransactions);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        step,
        maxCompletedStep,
        fullName,
        walletName,
        walletType,
        walletBalance,
        categories,
        sampleTransactions,
      }),
    );
  }, [categories, fullName, maxCompletedStep, sampleTransactions, step, storageKey, walletBalance, walletName, walletType]);

  const goNext = (nextStep: StepId) => {
    setMaxCompletedStep((current) => (Math.max(current, nextStep) as StepId));
    setStep(nextStep);
  };

  const goToStep = (targetStep: StepId) => {
    if (targetStep <= maxCompletedStep) setStep(targetStep);
  };

  const validateWelcome = () => {
    if (!fullName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return false;
    }

    if (!hasWallet && !walletName.trim()) {
      toast.error("Vui lòng nhập tên ví");
      return false;
    }

    return true;
  };

  const validateCategories = () => {
    if (validCategories.length === 0) {
      toast.error("Vui lòng tạo ít nhất một danh mục");
      return false;
    }

    if (!validCategories.some((category) => category.type === "expense")) {
      toast.error("Vui lòng có ít nhất một danh mục chi tiêu");
      return false;
    }

    return true;
  };

  const addOrUpdateCategory = () => {
    const name = categoryName.trim();
    if (!name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    const duplicate = categories.some(
      (category) => category.localId !== editingCategory?.localId && category.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      toast.error("Danh mục đã tồn tại trong onboarding");
      return;
    }

    const nextCategory: CategoryDraft = {
      localId: editingCategory?.localId || createId("cat"),
      name,
      type: categoryType,
      icon: categoryIcon || "📦",
      color: categoryColor || "#6B7280",
      sortOrder: editingCategory?.sortOrder ?? categories.length + 1,
    };

    setCategories((current) =>
      editingCategory
        ? current.map((category) => (category.localId === editingCategory.localId ? nextCategory : category))
        : [...current, nextCategory],
    );
    setEditingCategory(null);
    setCategoryName("");
    setCategoryType("expense");
    setCategoryIcon("📦");
    setCategoryColor("#6B7280");
  };

  const startEditCategory = (category: CategoryDraft) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryType(category.type);
    setCategoryIcon(category.icon || "📦");
    setCategoryColor(category.color || "#6B7280");
  };

  const removeCategory = (localId: string) => {
    const target = categories.find((category) => category.localId === localId);
    setCategories((current) => current.filter((category) => category.localId !== localId));
    if (target) {
      setSampleTransactions((current) => current.filter((sample) => sample.categoryName !== target.name));
    }
  };

  const useSampleCategories = () => {
    setCategories(DEFAULT_CATEGORIES);
    setSampleTransactions(DEFAULT_SAMPLE_TRANSACTIONS);
    toast.success("Đã nạp danh mục và giao dịch mẫu");
  };

  const addSampleTransaction = () => {
    if (!sampleCategoryName) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    if (!sampleAmount || Number(sampleAmount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    const category = validCategories.find((item) => item.name === sampleCategoryName);
    setSampleTransactions((current) => [
      ...current,
      {
        localId: createId("sample"),
        categoryName: sampleCategoryName,
        amount: sampleAmount,
        type: category?.type || "expense",
        note: sampleNote.trim() || undefined,
        displayDate: sampleDate,
      },
    ]);
    setSampleNote("");
    setSampleAmount("");
  };

  const handleComplete = async () => {
    if (!validateWelcome() || !validateCategories()) return;

    setSubmitting(true);
    try {
      await userAPI.updateProfile({ fullName: fullName.trim() });
      const result = await userAPI.completeOnboarding({
        seedSamplePack: false,
        wallet: hasWallet
          ? undefined
          : {
              name: walletName.trim(),
              type: walletType,
              initialBalance: walletBalance || "0",
            },
        categories: validCategories.map(({ localId: _localId, ...category }) => category),
        sampleTransactions: sampleTransactions.map(({ localId: _localId, ...transaction }) => transaction),
      });

      if (result.hasOnboarded) {
        if (storageKey && typeof window !== "undefined") {
          window.localStorage.removeItem(storageKey);
        }
        markOnboarded();
        toast.success("Đã hoàn tất thiết lập tài khoản");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Không thể hoàn tất onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingStatus || !user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
        <div className="w-full space-y-4">
          <div className="flex items-center justify-center gap-3 rounded-full bg-white/80 px-5 py-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải onboarding...
          </div>
          <ListSkeleton rows={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-500/25">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-sky-600">Thiết lập lần đầu</p>
          <h2 className="text-xl font-bold text-slate-900">Hoàn tất tài khoản của bạn</h2>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white/90 shadow-xl shadow-slate-200/70">
        <CardContent className="space-y-8 p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <StepHeader
                step={1}
                maxCompletedStep={maxCompletedStep}
                title="Chào mừng"
                subtitle="Xác nhận tên hiển thị và ví đầu tiên để app có dữ liệu nền tảng."
                onGoToStep={goToStep}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ví mặc định</Label>
                  {hasWallet ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      {status?.walletSummary?.name} - {Number(status?.walletSummary?.balance || 0).toLocaleString("vi-VN")} VND
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Input value={walletName} onChange={(event) => setWalletName(event.target.value)} />
                      <CurrencyInput value={walletBalance} onValueChange={setWalletBalance} suffix="VND" />
                    </div>
                  )}
                </div>
              </div>

              {!hasWallet ? (
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
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        walletType === preset.type && walletName === preset.name
                          ? "border-sky-300 bg-sky-50 text-sky-800"
                          : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <WalletCards className="mb-2 h-4 w-4" />
                      <p className="font-semibold">{preset.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {Number(preset.balance).toLocaleString("vi-VN")} VND
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="flex justify-end">
                <Button onClick={() => validateWelcome() && goNext(2)}>
                  Tiếp tục
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <StepHeader
                step={2}
                maxCompletedStep={maxCompletedStep}
                title="Thiết lập danh mục"
                subtitle="Tạo các nhóm thu nhập và chi tiêu sẽ dùng trong app."
                onGoToStep={goToStep}
              />

              <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="space-y-3">
                  {validCategories.map((category) => (
                    <div key={category.localId} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">{category.name}</p>
                        <p className="text-xs text-slate-500">{category.type === "income" ? "Thu nhập" : "Chi tiêu"}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => startEditCategory(category)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCategory(category.localId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-slate-900">
                      {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
                    </h3>
                    <Button type="button" variant="outline" size="sm" onClick={useSampleCategories}>
                      Dữ liệu mẫu
                    </Button>
                  </div>
                  <Input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Tên danh mục" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={categoryIcon} onChange={(event) => setCategoryIcon(event.target.value)} placeholder="Icon" />
                    <Input value={categoryColor} onChange={(event) => setCategoryColor(event.target.value)} placeholder="#6B7280" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={categoryType === "expense" ? "default" : "outline"}
                      onClick={() => setCategoryType("expense")}
                    >
                      Chi tiêu
                    </Button>
                    <Button
                      type="button"
                      variant={categoryType === "income" ? "default" : "outline"}
                      onClick={() => setCategoryType("income")}
                    >
                      Thu nhập
                    </Button>
                  </div>
                  <Button type="button" className="w-full" onClick={addOrUpdateCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    {editingCategory ? "Cập nhật" : "Thêm danh mục"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
                <Button onClick={() => validateCategories() && goNext(3)}>
                  Tiếp tục
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <StepHeader
                step={3}
                maxCompletedStep={maxCompletedStep}
                title="Tạo giao dịch mẫu"
                subtitle="Thêm vài dòng minh họa để dashboard có nội dung ngay sau onboarding."
                onGoToStep={goToStep}
              />

              <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="space-y-3">
                  {sampleTransactions.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                      Chưa có giao dịch mẫu.
                    </div>
                  ) : (
                    sampleTransactions.map((sample) => (
                      <div key={sample.localId} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                        <div className={`rounded-lg px-3 py-1 text-xs font-bold ${sample.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {sample.type === "income" ? "Thu" : "Chi"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">{sample.categoryName}</p>
                          <p className="text-xs text-slate-500">{sample.note || "Không có ghi chú"}</p>
                        </div>
                        <p className="font-bold text-slate-900">{Number(sample.amount).toLocaleString("vi-VN")} VND</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSampleTransactions((current) => current.filter((item) => item.localId !== sample.localId))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                  <h3 className="text-base font-bold text-slate-900">Thêm giao dịch mẫu</h3>
                  <select
                    value={sampleCategoryName}
                    onChange={(event) => setSampleCategoryName(event.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {validCategories.map((category) => (
                      <option key={category.localId} value={category.name}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  <CurrencyInput value={sampleAmount} onValueChange={setSampleAmount} suffix="VND" placeholder="Số tiền" />
                  <Input value={sampleNote} onChange={(event) => setSampleNote(event.target.value)} placeholder="Ghi chú" />
                  <Input type="date" value={sampleDate} onChange={(event) => setSampleDate(event.target.value)} />
                  <Button type="button" className="w-full" onClick={addSampleTransaction}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm giao dịch
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
                <Button onClick={() => goNext(4)}>
                  Tiếp tục
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <StepHeader
                step={4}
                maxCompletedStep={maxCompletedStep}
                title="Hoàn tất"
                subtitle="Kiểm tra lại dữ liệu và ghi vào tài khoản của bạn."
                onGoToStep={goToStep}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Tên hiển thị</p>
                  <p className="mt-1 font-bold text-slate-900">{fullName || "Chưa nhập"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Danh mục</p>
                  <p className="mt-1 font-bold text-slate-900">{validCategories.length}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Giao dịch mẫu</p>
                  <p className="mt-1 font-bold text-slate-900">{sampleTransactions.length}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)} disabled={submitting}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
                <Button onClick={handleComplete} disabled={submitting}>
                  {submitting ? <Spinner className="mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Hoàn tất
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
