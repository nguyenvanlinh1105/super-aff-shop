"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Wallet, Clock, CheckCircle2, Building2, Edit2, AlertCircle, X, Loader2, BellRing, Link as LinkIcon, Landmark, CreditCard, UserCheck, ShieldCheck, Sparkles, Check, ChevronDown } from "lucide-react";
import { FloatingElement } from "@/components/ui/FloatingElement";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { PeriodSelect } from "@/components/ui/PeriodSelect";
import { formatCurrency } from "@/lib/format";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import {
  IconPaidSuccessBadge,
  IconAccumulatedBag,
  IconPendingHourglass,
  IconReadyToWithdraw,
} from "@/components/icons/FinanceBadgeIcons";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/Toast";
import { PaymentPinModal } from "@/components/customer/PaymentPinModal";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export const VIETNAM_BANKS = [
  "Vietcombank (Ngân hàng TMCP Ngoại thương VN)",
  "VietinBank (Ngân hàng TMCP Công thương VN)",
  "BIDV (Ngân hàng TMCP Đầu tư và Phát triển VN)",
  "Agribank (Ngân hàng NN&PTNT VN)",
  "Techcombank (Ngân hàng TMCP Kỹ thương VN)",
  "MB (Ngân hàng TMCP Quân đội)",
  "ACB (Ngân hàng TMCP Á Châu)",
  "VPBank (Ngân hàng TMCP VN Thịnh Vượng)",
  "TPBank (Ngân hàng TMCP Tiên Phong)",
  "Sacombank (Ngân hàng TMCP Sài Gòn Thương Tín)",
  "HDBank (Ngân hàng TMCP Phát triển TPHCM)",
  "VIB (Ngân hàng TMCP Quốc tế VN)",
  "SHB (Ngân hàng TMCP Sài Gòn - Hà Nội)",
  "SeABank (Ngân hàng TMCP Đông Nam Á)",
  "MSB (Ngân hàng TMCP Hàng Hải VN)",
  "LPBank (Ngân hàng TMCP Lộc Phát VN)",
  "OCB (Ngân hàng TMCP Phương Đông)",
  "Nam A Bank (Ngân hàng TMCP Nam Á)",
  "Eximbank (Ngân hàng TMCP Xuất Nhập khẩu VN)",
  "VietABank (Ngân hàng TMCP Việt Á)",
  "NCB (Ngân hàng TMCP Quốc Dân)",
  "Bac A Bank (Ngân hàng TMCP Bắc Á)",
  "PVcomBank (Ngân hàng TMCP Đại Chúng VN)",
  "Saigonbank (Ngân hàng TMCP Sài Gòn Công Thương)",
  "KienlongBank (Ngân hàng TMCP Kiên Long)",
  "VietBank (Ngân hàng TMCP Việt Nam Thương Tín)",
  "BaoVietBank (Ngân hàng TMCP Bảo Việt)",
  "PGBank (Ngân hàng TMCP Thịnh Vượng và Phát triển)",
  "ABBank (Ngân hàng TMCP An Bình)",
  "SCB (Ngân hàng TMCP Sài Gòn)",
  "BVBank (Ngân hàng TMCP Bản Việt)",
  "GPBank (Ngân hàng TM TNHH MTV Dầu Khí Toàn Cầu)",
  "MBV (Ngân hàng TM TNHH MTV Đại Dương)",
  "CBBank (Ngân hàng TM TNHH MTV Xây dựng VN)",
  "VBSP (Ngân hàng Chính sách Xã hội)",
  "Co-opBank (Ngân hàng Hợp tác xã VN)",
  "HSBC Việt Nam",
  "Standard Chartered Việt Nam",
  "Shinhan Bank Việt Nam",
  "Woori Bank Việt Nam",
  "Public Bank Việt Nam (PBVN)",
  "CIMB Việt Nam",
  "UOB Việt Nam",
  "Hong Leong Bank Việt Nam",
  "Indovina Bank",
  "ANZ Việt Nam",
  "Cake by VPBank",
  "Ubank by VPBank",
  "Liobank by OCB",
  "Timo",
  "Khác...",
];

export const BANK_ALIASES: Record<string, string[]> = {
  "Vietcombank (Ngân hàng TMCP Ngoại thương VN)": ["vcb", "vietcombank", "ngoai thuong", "ngoại thương"],
  "Techcombank (Ngân hàng TMCP Kỹ thương VN)": ["tcb", "techcombank", "ky thuong", "kỹ thương", "tech"],
  "MB (Ngân hàng TMCP Quân đội)": ["mb", "mbbank", "quan doi", "quân đội", "mb bank"],
  "VietinBank (Ngân hàng TMCP Công thương VN)": ["vtb", "vietinbank", "cong thuong", "công thương", "vietin"],
  "BIDV (Ngân hàng TMCP Đầu tư và Phát triển VN)": ["bidv", "dau tu", "đầu tư", "phat trien"],
  "Agribank (Ngân hàng NN&PTNT VN)": ["agribank", "nong nghiep", "nông nghiệp", "agri"],
  "VPBank (Ngân hàng TMCP VN Thịnh Vượng)": ["vpb", "vpbank", "thinh vuong", "thịnh vượng", "vp"],
  "TPBank (Ngân hàng TMCP Tiên Phong)": ["tpb", "tpbank", "tien phong", "tiên phong", "tp"],
  "ACB (Ngân hàng TMCP Á Châu)": ["acb", "a chau", "á châu"],
  "Sacombank (Ngân hàng TMCP Sài Gòn Thương Tín)": ["sacombank", "sai gon thuong tin", "sài gòn thương tín", "stb"],
  "HDBank (Ngân hàng TMCP Phát triển TPHCM)": ["hdbank", "phat trien", "hdb"],
  "VIB (Ngân hàng TMCP Quốc tế VN)": ["vib", "quoc te", "quốc tế"],
  "SHB (Ngân hàng TMCP Sài Gòn - Hà Nội)": ["shb", "sai gon ha noi"],
  "SeABank (Ngân hàng TMCP Đông Nam Á)": ["seabank", "dong nam a", "sea"],
  "MSB (Ngân hàng TMCP Hàng Hải VN)": ["msb", "hang hai", "maritime"],
  "LPBank (Ngân hàng TMCP Lộc Phát VN)": ["lpbank", "loc phat", "lienviet", "lien viet", "bưu điện"],
  "OCB (Ngân hàng TMCP Phương Đông)": ["ocb", "phuong dong"],
  "Eximbank (Ngân hàng TMCP Xuất Nhập khẩu VN)": ["eximbank", "xuat nhap khau", "exim"],
  "Cake by VPBank": ["cake", "cake vpbank"],
  "Timo": ["timo", "timo bank"],
  "Liobank by OCB": ["liobank", "lio"],
};

type PaymentInfo = {
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
};

type PendingRequest = {
  id: string;
  amount: number;
  createdAt: string;
} | null;

type Props = {
  stats: {
    available: number;
    pending: number;
    paid: number;
  };
  history: any[];
  totalPages: number;
  currentPage: number;
  paymentInfo: PaymentInfo;
  pendingRequest: PendingRequest;
  hasPaymentPin: boolean;
};

const MIN_WITHDRAW_AMOUNT = 10000;

export function CustomerWalletClient({
  stats,
  history,
  totalPages,
  currentPage,
  paymentInfo: initialPaymentInfo,
  pendingRequest: initialPendingRequest,
  hasPaymentPin,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest>(initialPendingRequest);

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(initialPaymentInfo);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const [formBankName, setFormBankName] = useState(initialPaymentInfo.bankName || "");
  const [formBankAccountNumber, setFormBankAccountNumber] = useState(initialPaymentInfo.bankAccountNumber || "");
  const [formBankAccountName, setFormBankAccountName] = useState(initialPaymentInfo.bankAccountName || "");
  const [bankSearch, setBankSearch] = useState(initialPaymentInfo.bankName || "");
  const [showBankOptions, setShowBankOptions] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
        setShowBankOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredBanks = useMemo(() => {
    const query = bankSearch.trim().toLowerCase();
    // Nếu rỗng hoặc trùng khớp tên ngân hàng đã chọn -> Hiển thị toàn bộ 50+ ngân hàng!
    if (!query || query === formBankName.trim().toLowerCase()) {
      return VIETNAM_BANKS;
    }

    return VIETNAM_BANKS.filter((bank) => {
      const lower = bank.toLowerCase();
      if (lower.includes(query)) return true;

      const aliases = BANK_ALIASES[bank];
      if (aliases && aliases.some((a) => a.includes(query) || query.includes(a))) {
        return true;
      }

      return false;
    });
  }, [bankSearch, formBankName]);

  const currentPeriod = searchParams.get("period") || "all";

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", e.target.value);
    params.delete("page"); // Reset về trang 1
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasBankInfo = !!(paymentInfo.bankName && paymentInfo.bankAccountNumber && paymentInfo.bankAccountName);
  const canRequest = stats.available >= MIN_WITHDRAW_AMOUNT && hasBankInfo && !pendingRequest;

  // Bước 1: Bấm nút rút tiền -> mở PIN modal
  const handleWithdrawClick = () => {
    setIsPinModalOpen(true);
  };

  // Bước 2: PIN đã xác nhận -> gọi API rút tiền kèm PIN
  const handlePinVerified = async (pin: string) => {
    setIsPinModalOpen(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/withdraw-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.pinError) {
          // PIN error — reopen modal
          toast.error(data.error ?? "Mã PIN không chính xác, vui lòng thử lại.", "Lỗi mã PIN");
          setIsPinModalOpen(true);
          return;
        }
        toast.error(data.error ?? "Không thể gửi yêu cầu rút tiền, vui lòng thử lại sau.", "Lỗi rút tiền");
        return;
      }
      setPendingRequest(data.request);
      toast.success("Yêu cầu rút tiền của bạn đã được gửi và đang chờ xử lý! 🎀", "Rút tiền thành công");
      // Trigger confetti on success
      if (typeof window !== "undefined") {
        import("canvas-confetti").then((mod) => {
          mod.default({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#FF6D9E", "#FF3B7B", "#10B981", "#fff"] });
        }).catch(() => {});
      }
      router.refresh();
    } catch {
      toast.error("Đã có lỗi hệ thống xảy ra, vui lòng thử lại sau.", "Lỗi hệ thống");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePaymentInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: formBankName,
          bankAccountNumber: formBankAccountNumber,
          bankAccountName: formBankAccountName,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Lưu thông tin thất bại");
      }
      const { customer } = await res.json();
      setPaymentInfo(customer);
      setIsModalOpen(false);
      toast.success("Cập nhật thông tin tài khoản ngân hàng thành công! 🏦", "Cập nhật thành công");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Đã có lỗi xảy ra khi lưu thông tin.", "Lỗi lưu thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = () => {
    setFormBankName(paymentInfo.bankName || "");
    setFormBankAccountNumber(paymentInfo.bankAccountNumber || "");
    setFormBankAccountName(paymentInfo.bankAccountName || "");
    setBankSearch(paymentInfo.bankName || "");
    setShowBankOptions(false);
    setIsModalOpen(true);
  };

  const selectBank = (bank: string) => {
    setFormBankName(bank);
    setBankSearch(bank);
    setShowBankOptions(false);
  };

  const renderAccountInfoBox = () => {
    if (paymentInfo.bankName && paymentInfo.bankAccountNumber) {
      return (
        <div className="rounded-2xl bg-white p-3.5 shadow-2xs border border-primary-100/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 font-bold border border-primary-100/80 shadow-2xs">
              <Building2 size={19} />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-extrabold text-neutral-900 truncate">
                {paymentInfo.bankName}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-semibold text-neutral-600">
                <span className="tracking-wider font-mono font-bold text-neutral-800">{paymentInfo.bankAccountNumber}</span>
                <span>•</span>
                <span className="uppercase text-neutral-700 truncate">{paymentInfo.bankAccountName}</span>
              </div>
            </div>
          </div>
          <span className="shrink-0 text-emerald-600 bg-emerald-50 p-1.5 rounded-xl border border-emerald-100" title="Tài khoản đã xác nhận">
            <ShieldCheck size={16} />
          </span>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={openModal}
        className="w-full flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-2xs border border-dashed border-primary-200 hover:border-primary-400 hover:bg-primary-50/30 transition-all text-left cursor-pointer group"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 group-hover:scale-105 transition-transform">
          <AlertCircle size={18} strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[13px] font-bold text-neutral-900 group-hover:text-primary-600">Chưa liên kết tài khoản ngân hàng</div>
          <div className="text-[11.5px] font-medium text-neutral-500">Bấm để cập nhật thông tin nhận tiền</div>
        </div>
      </button>
    );
  };

  return (
    <>
      <div className="flex w-full flex-col gap-6 fade-in pb-12">
        {/* HEADER BANNER */}
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-white">
          <img src="/welcome-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <FloatingElement duration={4}>
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border-2 border-white overflow-hidden p-1">
                  <img src="/meowback_lucky_cat_logo.png" alt="Wallet" className="w-full h-full object-contain rounded-2xl" />
                </div>
              </FloatingElement>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-100/90 text-primary-700 text-[11px] font-bold mb-1.5 border border-primary-200/60 shadow-2xs">
                  <IconBow className="w-3.5 h-3.5 text-accent-bow" />
                  <span>Ví điện tử MeowBack</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight text-neutral-900 tracking-tight">
                  Ví Tiền & Rút Thưởng 🎀
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                  Quản lý số dư tích luỹ, theo dõi tiến độ đối soát và tạo lệnh rút tiền nhanh về tài khoản ngân hàng.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 3 THẺ THỐNG KÊ (Đồng bộ, cân đối & hài hoà) ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Khả dụng */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-primary-50/25 to-white p-5 sm:p-6 shadow-cute border border-primary-200/80 hover:border-primary-400 hover:shadow-cute-lg transition-all duration-300 flex flex-col justify-between gap-3">
            <div className="absolute -right-3 -bottom-3 opacity-[0.08] pointer-events-none group-hover:scale-110 transition-transform">
              <IconReadyToWithdraw size={88} />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50/80 border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform p-1">
                  <IconReadyToWithdraw size={36} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Số dư</span>
                  <div className="text-[13px] font-extrabold text-neutral-800">Khả dụng</div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10.5px] font-black uppercase text-emerald-700 tracking-wider">
                Sẵn sàng
              </span>
            </div>
            <div className="relative z-10 pt-2 border-t border-primary-100/60">
              <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Có thể rút ngay</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums leading-tight mt-0.5">
                {formatCurrency(stats.available)}
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Rút về ngân hàng bất kỳ lúc nào</span>
            </div>
          </div>

          {/* Card 2: Chờ duyệt */}
          <div className="group relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/80 hover:border-amber-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3">
            <div className="absolute -right-3 -bottom-3 opacity-[0.08] pointer-events-none group-hover:scale-110 transition-transform">
              <IconPendingHourglass size={88} />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50/80 border border-amber-100 shadow-2xs group-hover:scale-105 transition-transform p-1">
                  <IconPendingHourglass size={36} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Tiền thưởng</span>
                  <div className="text-[13px] font-extrabold text-neutral-800">Chờ duyệt</div>
                </div>
              </div>
              <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[10.5px] font-black uppercase text-amber-700 tracking-wider">
                Đối soát
              </span>
            </div>
            <div className="relative z-10 pt-2 border-t border-neutral-100">
              <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Trong 15 ngày</div>
              <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums leading-tight mt-0.5">
                {formatCurrency(stats.pending)}
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>Chờ sàn xác nhận đơn hoàn tất</span>
            </div>
          </div>

          {/* Card 3: Đã nhận (Xanh lá ngọc với tiền & đồng xu & checkmark) */}
          <div className="group relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/80 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3">
            <div className="absolute -right-3 -bottom-3 opacity-[0.09] pointer-events-none group-hover:scale-110 transition-transform">
              <IconPaidSuccessBadge size={88} />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50/80 border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform p-1">
                  <IconPaidSuccessBadge size={38} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Tích luỹ</span>
                  <div className="text-[13px] font-extrabold text-neutral-800">Đã nhận</div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10.5px] font-black uppercase text-emerald-700 tracking-wider">
                Thành công
              </span>
            </div>
            <div className="relative z-10 pt-2 border-t border-neutral-100">
              <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Đã chuyển về ví</div>
              <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums leading-tight mt-0.5">
                {formatCurrency(stats.paid)}
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Tổng tiền đã rút thành công</span>
            </div>
          </div>
        </div>

        {/* ═══ 2 CỘT CHÍNH: RÚT TIỀN (TRÁI) & LỊCH SỬ (PHẢI) ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          {/* CỘT TRÁI: YÊU CẦU RÚT TIỀN */}
          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-primary-100/70 pb-3.5">
              <div className="flex items-center gap-2">
                <IconBow className="w-5 h-5 text-accent-bow" />
                <h2 className="text-[16px] font-extrabold text-neutral-900">Yêu cầu rút tiền</h2>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-100">
                Miễn phí
              </span>
            </div>

            {/* Số dư khả dụng card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary-50/70 via-rose-50/40 to-white p-4 border border-primary-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-neutral-500 uppercase tracking-wider">Số dư rút được</span>
                <span className="text-[11px] font-extrabold text-primary-600">
                  Tối thiểu {Math.round(MIN_WITHDRAW_AMOUNT / 1000)}k
                </span>
              </div>
              <div className="mt-1.5 text-2xl sm:text-3xl font-black text-primary-600 tabular-nums">
                {formatCurrency(stats.available)}
              </div>
              {stats.available < MIN_WITHDRAW_AMOUNT && (
                <p className="mt-1.5 text-[11px] font-semibold text-neutral-500">
                  Cần tối thiểu {formatCurrency(MIN_WITHDRAW_AMOUNT)} để gửi yêu cầu rút tiền
                </p>
              )}
            </div>

            {/* Tài khoản nhận tiền */}
            <div className="rounded-2xl bg-neutral-50/80 p-4 border border-neutral-200/80 hover:border-primary-300 transition-all">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Landmark size={14} className="text-primary-500" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Tài khoản nhận tiền</span>
                </div>
                <button
                  type="button"
                  onClick={openModal}
                  className="flex items-center gap-1 text-[12px] font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
                >
                  <Edit2 size={12} strokeWidth={2.5} />
                  <span>{hasBankInfo ? "Thay đổi" : "Thêm mới"}</span>
                </button>
              </div>

              {renderAccountInfoBox()}
            </div>

            {/* Withdraw Action or Pending Status */}
            {pendingRequest ? (
              <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 border border-amber-200/80 shadow-2xs">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-black text-base mt-0.5">
                  ⏳
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-extrabold text-amber-900 flex items-center gap-1.5">
                    <span>Đã gửi yêu cầu rút tiền 🎀</span>
                  </div>
                  <p className="text-[12px] text-amber-800 font-medium mt-1 leading-relaxed">
                    Bạn đã yêu cầu rút <strong className="font-extrabold text-amber-950">{formatCurrency(pendingRequest.amount)}</strong>. MeowBack Admin sẽ duyệt và chuyển khoản sớm nhất!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleWithdrawClick}
                  disabled={!canRequest || submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 via-rose-500 to-pink-500 hover:from-primary-600 hover:to-rose-600 text-[14.5px] font-extrabold text-white shadow-cute hover:shadow-cute-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-none disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Wallet size={17} strokeWidth={2.5} />
                      <span>Rút {formatCurrency(stats.available)} về Ví 🎀</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] font-medium text-neutral-400">
                  ⚡ Chuyển khoản 24/7 • Không mất phí giao dịch
                </p>
              </div>
            )}
            {!hasBankInfo && !pendingRequest && (
              <p className="text-[11px] font-semibold text-neutral-500 text-center">
                Vui lòng cập nhật thông tin ngân hàng trước khi gửi yêu cầu.
              </p>
            )}
          </div>

          {/* CỘT PHẢI: LỊCH SỬ RÚT TIỀN */}
          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80 flex flex-col gap-4">
            {/* Header: Title on top, Filters on second line to avoid any clipping */}
            <div className="flex flex-col gap-3 border-b border-primary-100/70 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[16px] font-extrabold text-neutral-900 tracking-tight">Lịch sử rút tiền</h2>
                  <span className="text-[12px] font-bold text-primary-600 bg-primary-50 border border-primary-100 px-2.5 py-0.5 rounded-full">
                    {history.length} giao dịch
                  </span>
                </div>
              </div>

              {/* Filters: PeriodSelect & Search in a responsive grid that never overflows */}
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2.5 w-full">
                <PeriodSelect className="w-full" />
                <ServerSearchInput placeholder="Tìm mã phiếu rút..." className="w-full" />
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-primary-100/70">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-primary-50/60 border-b border-primary-100">
                    <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Thời gian</th>
                    <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Số tiền</th>
                    <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Trạng thái</th>
                    <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Mã phiếu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center text-center px-4">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 p-1 border border-neutral-200/80 shadow-2xs flex items-center justify-center overflow-hidden shrink-0 mb-2">
                            <img src="/logo-200.png" alt="MeowBack Mascot" className="w-full h-full object-contain rounded-lg" />
                          </div>
                          <span className="text-[13px] font-bold text-neutral-800">Ví chưa có giao dịch rút nào</span>
                          <p className="mt-1 text-[12px] text-neutral-500 max-w-xs font-medium">
                            Khi tích luỹ đủ số dư tối thiểu từ tiền hoàn, bạn có thể tạo lệnh rút về ngân hàng.
                          </p>
                          <Link
                            href="/app/refunds"
                            className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 px-4 py-2 text-[12.5px] font-bold text-white shadow-cute hover:shadow-cute-lg transition-all active:scale-95 cursor-pointer"
                          >
                            <Sparkles size={14} />
                            <span>Tạo link hoàn tiền ngay</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    history.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-primary-50/30 transition-colors">
                        <td className="py-3.5 px-4 text-[12.5px] font-medium text-neutral-600 whitespace-nowrap">{tx.time}</td>
                        <td className="py-3.5 px-4 text-[13.5px] font-black text-neutral-900 tabular-nums whitespace-nowrap">{tx.amount}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                            tx.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          }`}>
                            {tx.status === 'paid' ? 'Đã nhận 🎀' : tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[12px] font-mono text-neutral-500 whitespace-nowrap">{tx.code}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden flex flex-col gap-2.5">
              {history.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center p-1 mb-2.5">
                    <img src="/meowback_lucky_cat_logo.png" alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[13.5px] font-bold text-neutral-800">Chưa có giao dịch rút nào 🎀</span>
                  <Link
                    href="/app/refunds"
                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 px-4 py-2 text-[12px] font-bold text-white shadow-cute"
                  >
                    <Sparkles size={13} />
                    <span>Tạo link hoàn tiền</span>
                  </Link>
                </div>
              ) : (
                history.map((tx, idx) => (
                  <div key={idx} className="rounded-2xl border border-primary-100 bg-white p-3.5 shadow-2xs flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] text-neutral-500">{tx.time}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${
                        tx.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                      }`}>
                        {tx.status === 'paid' ? 'Đã nhận 🎀' : tx.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-primary-50">
                      <span className="text-[14.5px] font-black text-neutral-900 tabular-nums">{tx.amount}</span>
                      <span className="text-[11px] font-mono text-neutral-400">{tx.code}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {history.length > 0 && (
              <div className="border-t border-primary-100/80 pt-3">
                <Pagination totalPages={totalPages} currentPage={currentPage} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: CHỈNH SỬA THÔNG TIN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full sm:max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-primary-100 max-h-[92vh] sm:max-h-[85vh] flex flex-col z-10 transition-transform">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-pink-500 to-primary-600 p-5 text-white">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-inner">
                    <Landmark size={22} strokeWidth={2.25} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-extrabold text-white tracking-tight flex items-center gap-1.5">
                      Thông tin thanh toán
                      <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                    </h3>
                    <p className="text-[11px] font-medium text-white/85">Cập nhật tài khoản để nhận tiền hoàn về Ví</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors border border-white/10"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePaymentInfo} noValidate className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* Ngân hàng */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-[12px] font-bold text-neutral-800">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-primary-500" />
                    Ngân hàng nhận tiền
                  </span>
                  {formBankName && (
                    <span className="text-[10px] font-extrabold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                      Đã chọn
                    </span>
                  )}
                </label>
                <div ref={bankDropdownRef} className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Landmark size={18} />
                  </div>
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => {
                      setBankSearch(e.target.value);
                      setShowBankOptions(true);
                    }}
                    onClick={() => setShowBankOptions(true)}
                    onFocus={(e) => {
                      setShowBankOptions(true);
                      e.target.select();
                    }}
                    placeholder="Bấm để chọn hoặc gõ tìm kiếm trong 50+ ngân hàng..."
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-16 text-[14px] font-bold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer"
                  />

                  {/* Nút xoá tìm kiếm & Mũi tên toggle */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {bankSearch.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBankSearch("");
                          setFormBankName("");
                          setShowBankOptions(true);
                        }}
                        title="Xoá tìm kiếm để xem tất cả 50+ ngân hàng"
                        className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/70 transition-colors cursor-pointer"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBankOptions((prev) => !prev);
                      }}
                      className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          showBankOptions ? "rotate-180 text-primary-500" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Dropdown danh sách ngân hàng */}
                  {showBankOptions && (
                    <div className="absolute z-30 mt-1.5 max-h-[260px] w-full overflow-y-auto rounded-2xl border border-primary-200/90 bg-white p-2 shadow-2xl animate-in fade-in duration-150 [scrollbar-width:thin]">
                      {/* Tiêu đề trạng thái kết quả */}
                      <div className="px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1 flex items-center justify-between">
                        <span>
                          {bankSearch.trim() && bankSearch.trim().toLowerCase() !== formBankName.trim().toLowerCase()
                            ? `Tìm thấy ${filteredBanks.length} ngân hàng`
                            : `Tất cả ngân hàng Việt Nam (${filteredBanks.length})`}
                        </span>
                        {bankSearch && bankSearch !== formBankName && (
                          <span className="text-[10px] text-primary-600 font-bold lowercase">
                            &quot;{bankSearch}&quot;
                          </span>
                        )}
                      </div>

                      {filteredBanks.length === 0 ? (
                        <div className="px-4 py-5 text-center flex flex-col items-center gap-1.5">
                          <span className="text-[13px] font-bold text-neutral-700">
                            Không tìm thấy ngân hàng &quot;{bankSearch}&quot;
                          </span>
                          <p className="text-[11px] text-neutral-400">
                            Bạn có thể bấm nút X để xem tất cả hoặc chọn &quot;Khác...&quot;
                          </p>
                        </div>
                      ) : (
                        filteredBanks.map((b) => {
                          const isSelected = b === formBankName;
                          return (
                            <button
                              key={b}
                              type="button"
                              onClick={() => selectBank(b)}
                              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left text-[13px] font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-primary-50 text-primary-600 border border-primary-200/80 shadow-2xs"
                                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-black ${
                                    isSelected
                                      ? "bg-primary-500 text-white shadow-2xs"
                                      : "bg-neutral-100 text-neutral-600"
                                  }`}
                                >
                                  🏦
                                </div>
                                <span className="truncate">{b}</span>
                              </div>
                              {isSelected && (
                                <Check size={16} strokeWidth={2.5} className="text-primary-600 shrink-0" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Số tài khoản */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[12px] font-bold text-neutral-800">
                    <CreditCard size={14} className="text-primary-500" />
                    Số tài khoản ngân hàng
                  </label>
                  {formBankAccountNumber.length > 0 && (
                    <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                      {formBankAccountNumber.length} số
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <CreditCard size={18} />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formBankAccountNumber}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, "");
                      setFormBankAccountNumber(clean);
                    }}
                    placeholder="Nhập chữ số (VD: 1028263044)"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-4 text-[15px] font-mono tracking-wider font-extrabold text-neutral-900 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
                {formBankAccountNumber.length > 0 && formBankAccountNumber.length < 6 && (
                  <p className="mt-1 text-[11px] font-medium text-amber-600 flex items-center gap-1">
                    ⚠️ Số tài khoản ngân hàng thường từ 6 đến 20 chữ số
                  </p>
                )}
              </div>

              {/* Tên chủ tài khoản */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[12px] font-bold text-neutral-800">
                  <UserCheck size={14} className="text-primary-500" />
                  Tên chủ tài khoản
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <UserCheck size={18} />
                  </div>
                  <input
                    type="text"
                    value={formBankAccountName}
                    onChange={(e) => setFormBankAccountName(e.target.value)}
                    placeholder="VD: NGUYEN VAN A"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-4 text-[14px] font-extrabold uppercase tracking-wide text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 font-medium">Vui lòng viết chính xác họ tên đứng tên tài khoản ngân hàng.</p>
              </div>

              {/* Security Shield Note */}
              <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/80 p-3.5 border border-emerald-200/70 text-emerald-900">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                <div className="text-[11px] font-medium leading-relaxed">
                  <strong className="font-extrabold text-emerald-950 block mb-0.5">Bảo mật thông tin 100% 🔒</strong>
                  Thông tin ngân hàng của bạn được mã hoá an toàn và chỉ sử dụng cho mục đích chuyển tiền hoàn cashback khi bạn rút tiền.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-12 flex-1 rounded-full bg-neutral-100 text-[14px] font-bold text-neutral-600 transition-all hover:bg-neutral-200 active:scale-[0.98]"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 via-pink-500 to-primary-600 text-[14px] font-extrabold text-white shadow-cute hover:shadow-cute-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : "Lưu thông tin 🎀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PaymentPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        hasPin={hasPaymentPin}
        onPinVerified={handlePinVerified}
      />
    </>
  );
}

