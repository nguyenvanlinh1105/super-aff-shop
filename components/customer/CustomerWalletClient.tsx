"use client";

import { useState } from "react";
import { Wallet, Clock, CheckCircle2, Building2, Edit2, AlertCircle, X, Loader2, BellRing } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { useModal } from "@/components/ui/ModalProvider";

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
};

const MIN_WITHDRAW_AMOUNT = 10000;

export function CustomerWalletClient({
  stats,
  history,
  totalPages,
  currentPage,
  paymentInfo: initialPaymentInfo,
  pendingRequest: initialPendingRequest,
}: Props) {
  const router = useRouter();
  const modal = useModal();
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest>(initialPendingRequest);

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(initialPaymentInfo);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formBankName, setFormBankName] = useState(initialPaymentInfo.bankName || "");
  const [formBankAccountNumber, setFormBankAccountNumber] = useState(initialPaymentInfo.bankAccountNumber || "");
  const [formBankAccountName, setFormBankAccountName] = useState(initialPaymentInfo.bankAccountName || "");
  const [bankSearch, setBankSearch] = useState(initialPaymentInfo.bankName || "");
  const [showBankOptions, setShowBankOptions] = useState(false);
  const filteredBanks = VIETNAM_BANKS.filter((b) => b.toLowerCase().includes(bankSearch.trim().toLowerCase()));

  const hasBankInfo = !!(paymentInfo.bankName && paymentInfo.bankAccountNumber && paymentInfo.bankAccountName);
  const canRequest = stats.available >= MIN_WITHDRAW_AMOUNT && hasBankInfo && !pendingRequest;

  const handleSubmitRequest = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/withdraw-requests", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        modal.alert({ title: "Lỗi rút tiền", message: data.error ?? "Không thể gửi yêu cầu, vui lòng thử lại", iconType: "danger" });
        return;
      }
      setPendingRequest(data.request);
      modal.alert({ title: "Thành công", message: "Yêu cầu rút tiền của bạn đã được gửi và đang chờ xử lý.", iconType: "success" });
      router.refresh();
    } catch {
      modal.alert({ title: "Lỗi hệ thống", message: "Đã có lỗi xảy ra, vui lòng thử lại", iconType: "danger" });
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
      modal.alert({ title: "Thành công", message: "Cập nhật thông tin ngân hàng thành công", iconType: "success" });
      router.refresh();
    } catch (err: any) {
      modal.alert({ title: "Lỗi lưu thông tin", message: err.message ?? "Đã có lỗi xảy ra khi lưu thông tin.", iconType: "danger" });
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
        <div className="rounded-2xl bg-white p-3 shadow-sm border border-primary-100">
          <div className="text-[13px] font-bold text-neutral-900">{paymentInfo.bankName}</div>
          <div className="text-[12px] font-semibold text-neutral-500 uppercase">
            {paymentInfo.bankAccountNumber} - {paymentInfo.bankAccountName}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm border border-primary-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-500">
          <AlertCircle size={16} strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[13px] font-bold text-neutral-900">Chưa có thông tin</div>
          <div className="text-[11px] font-medium text-neutral-500">Vui lòng cập nhật</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 fade-in pb-12">
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0] mb-2">
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-primary-200/40 to-pink-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 right-40 h-48 w-48 rounded-full bg-gradient-to-tr from-primary-100/30 to-pink-100/30 blur-xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border border-white/40 overflow-hidden p-1">
                <img src="/meow-back-payments.png" alt="Wallet" className="w-full h-full object-contain rounded-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                  Ví Hoàn Tiền MeowBack 🎀
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Available Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 p-6 shadow-cute hover:shadow-cute-lg transition-all duration-200 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-white/90">
                <Wallet size={16} strokeWidth={2.5} />
                <span className="text-[13px] font-bold">Khả dụng</span>
              </div>
              <div className="mt-3 text-[32px] font-extrabold text-white tabular-nums tracking-tight">
                {formatCurrency(stats.available)}
              </div>
            </div>
          </div>

          {/* Pending Card */}
          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80 hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2 text-amber-600">
              <Clock size={16} strokeWidth={2.5} />
              <span className="text-[13px] font-bold">Chờ duyệt</span>
            </div>
            <div className="mt-3 text-[24px] font-extrabold text-neutral-900 tabular-nums tracking-tight">
              {formatCurrency(stats.pending)}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-neutral-500">Đang chờ admin duyệt đối soát</div>
          </div>

          {/* Paid Card */}
          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80 hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2 text-[#2D8A56]">
              <CheckCircle2 size={16} strokeWidth={2.5} />
              <span className="text-[13px] font-bold">Đã nhận</span>
            </div>
            <div className="mt-3 text-[24px] font-extrabold text-neutral-900 tabular-nums tracking-tight">
              {formatCurrency(stats.paid)}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-neutral-500">Tổng đã rút thành công</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-[1fr_2fr] items-start">
          {/* LEFT COLUMN: PAYMENT REQUEST */}
          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80">
            <h2 className="text-[16px] font-extrabold text-neutral-900 mb-4 flex items-center gap-2">
              <IconBow className="w-5 h-5 text-accent-bow" />
              Yêu cầu rút tiền
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-neutral-700">Số dư khả dụng</label>
                <div className="flex h-12 w-full items-center rounded-2xl bg-primary-50 px-4 text-[15px] font-extrabold text-neutral-900 border border-primary-100">
                  {formatCurrency(stats.available)}
                </div>
                {stats.available < MIN_WITHDRAW_AMOUNT && (
                  <p className="mt-1 text-[11px] font-semibold text-neutral-500">
                    Cần tối thiểu {formatCurrency(MIN_WITHDRAW_AMOUNT)} để gửi yêu cầu rút tiền
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-primary-50/60 p-4 border border-primary-100">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                    Tài khoản nhận tiền
                  </span>
                  <button
                    type="button"
                    onClick={openModal}
                    className="flex items-center gap-1 text-[12px] font-bold text-primary-500 hover:text-primary-600"
                  >
                    <Edit2 size={12} strokeWidth={2.5} />
                    Chỉnh sửa
                  </button>
                </div>

                {renderAccountInfoBox()}
              </div>

              {/* error message was here */}

              {pendingRequest ? (
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200">
                  <BellRing size={18} className="mt-0.5 shrink-0 text-amber-600" strokeWidth={2.25} />
                  <div>
                    <div className="text-[13px] font-bold text-amber-800">Đã gửi yêu cầu rút 🎀</div>
                    <div className="text-[12px] text-amber-700 mt-0.5">
                      Bạn đã yêu cầu rút {formatCurrency(pendingRequest.amount)}. MeowBack Admin sẽ xử lý sớm nhất.
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={!canRequest || submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-cute hover:shadow-cute-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-none disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    `Rút ${formatCurrency(stats.available)} về Ví 🎀`
                  )}
                </button>
              )}
              {!hasBankInfo && !pendingRequest && (
                <p className="text-[11px] font-semibold text-neutral-500 -mt-2">
                  Cập nhật thông tin ngân hàng trước khi gửi yêu cầu.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: TRANSACTION HISTORY */}
          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80 overflow-hidden">
            <div className="mb-4 flex items-center justify-between border-b border-primary-100 pb-3">
              <h2 className="text-[16px] font-extrabold text-neutral-900">Lịch sử rút tiền</h2>
              <span className="text-[13px] font-bold text-neutral-500">{history.length} giao dịch</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block responsive-table overflow-x-auto -mx-6">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-primary-100 bg-primary-50/50">
                    <th className="py-2.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Thời gian</th>
                    <th className="py-2.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Số tiền</th>
                    <th className="py-2.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Trạng thái</th>
                    <th className="py-2.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Mã phiếu</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <span className="text-[14px] font-bold text-neutral-400">Chưa có giao dịch nào</span>
                      </td>
                    </tr>
                  ) : (
                    history.map((tx, idx) => (
                      <tr key={idx} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/40">
                        <td className="py-3.5 px-4 text-[13px] font-medium text-neutral-700">{tx.time}</td>
                        <td className="py-3.5 px-4 text-[13px] font-extrabold text-neutral-900">{tx.amount}</td>
                        <td className="py-3.5 px-4 text-[13px]">
                          <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-extrabold ${
                            tx.status === 'paid' ? 'bg-[#E6F8EE] text-[#2D8A56]' : 'bg-primary-100 text-primary-600'
                          }`}>
                            {tx.status === 'paid' ? 'Đã nhận 🎀' : tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[13px] font-mono text-neutral-500">{tx.code}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden flex flex-col gap-3">
              {history.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="text-[14px] font-bold text-neutral-400">Chưa có giao dịch nào</span>
                </div>
              ) : (
                history.map((tx, idx) => (
                  <div key={idx} className="rounded-2xl border border-primary-100 p-4 hover:bg-primary-50/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-extrabold text-neutral-900">{tx.amount}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                        tx.status === 'paid' ? 'bg-[#E6F8EE] text-[#2D8A56]' : 'bg-primary-100 text-primary-600'
                      }`}>
                        {tx.status === 'paid' ? 'Đã nhận 🎀' : tx.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-neutral-500">{tx.time}</span>
                      <span className="text-[11px] font-mono text-neutral-400">{tx.code}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </div>
        </div>
      </div>

      {/* MODAL: CHỈNH SỬA THÔNG TIN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full sm:max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-cute-lg fade-in border border-primary-100 max-h-[90vh] sm:max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-primary-100 p-5 bg-gradient-to-r from-primary-100/60 to-primary-50">
              <h3 className="text-[18px] font-extrabold text-neutral-900">Thông tin thanh toán 🏦</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-white hover:text-neutral-900"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSavePaymentInfo} noValidate className="p-5 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 flex items-center gap-1.5 text-[14px] font-extrabold text-neutral-900">
                    <Building2 size={16} className="text-primary-500" />
                    Chuyển khoản Ngân hàng
                  </h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <label className="mb-1 block text-[12px] font-bold text-neutral-700">Ngân hàng</label>
                      <input
                        type="text"
                        value={bankSearch}
                        onChange={(e) => {
                          setBankSearch(e.target.value);
                          setFormBankName("");
                          setShowBankOptions(true);
                        }}
                        onFocus={() => setShowBankOptions(true)}
                        onBlur={() => setTimeout(() => setShowBankOptions(false), 150)}
                        placeholder="Gõ để tìm ngân hàng..."
                        className="h-11 w-full rounded-2xl border border-primary-200 bg-white px-4 text-[14px] font-medium text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                      {showBankOptions && (
                        <div className="absolute z-10 mt-1 max-h-[220px] w-full overflow-y-auto rounded-2xl border border-primary-200 bg-white shadow-cute">
                          {filteredBanks.length === 0 ? (
                            <div className="px-4 py-3 text-[13px] text-neutral-500">Không tìm thấy ngân hàng phù hợp</div>
                          ) : (
                            filteredBanks.map((b) => (
                              <button
                                key={b}
                                type="button"
                                onMouseDown={() => selectBank(b)}
                                className={`block w-full px-4 py-2.5 text-left text-[13px] font-bold transition-colors hover:bg-primary-50 ${
                                  b === formBankName ? "bg-primary-100 text-primary-600" : "text-neutral-700"
                                }`}
                              >
                                {b}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-bold text-neutral-700">Số tài khoản</label>
                      <input
                        type="text"
                        value={formBankAccountNumber}
                        onChange={(e) => setFormBankAccountNumber(e.target.value)}
                        placeholder="VD: 1903..."
                        className="h-11 w-full rounded-2xl border border-primary-200 px-4 text-[14px] font-bold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-bold text-neutral-700">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        value={formBankAccountName}
                        onChange={(e) => setFormBankAccountName(e.target.value)}
                        placeholder="VD: NGUYEN VAN A"
                        className="h-11 w-full rounded-2xl border border-primary-200 px-4 text-[14px] font-bold uppercase focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 flex-1 rounded-full bg-primary-100 text-[14px] font-bold text-primary-600 transition-colors hover:bg-primary-200"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[14px] font-bold text-white shadow-cute transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : "Lưu thay đổi 🎀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

