"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { FloatingElement } from "@/components/ui/FloatingElement";

type Friend = {
  id: string;
  fullName: string;
  customerCode: string;
  joinedAt: string;
  bonusOrderCount: number;
  totalEarned: number;
};

type FriendOrderTimelineEntry = {
  id: string;
  friendName: string;
  friendCode: string;
  orderExternalId: string;
  itemName: string | null;
  shopName: string | null;
  orderStatus: string;
  createdAt: string;
  bonusState: "received" | "clawed_back" | "not_eligible" | "pending_eligible" | "pending_capped";
  bonusAmount: number;
};

interface Props {
  customerCode: string;
  totalFriends: number;
  totalCommission: number;
  referralRate: number;
  maxReferralOrders: number;
  referralValidityMonths: number;
  isPartner: boolean;
  friends: Friend[];
  friendOrderTimeline: FriendOrderTimelineEntry[];
}

const ORDER_STATUS_LABEL: Record<string, { text: string; className: string }> = {
  approved: { text: "Đã hoàn tất", className: "bg-green-50 text-green-600" },
  pending: { text: "Chờ xác nhận", className: "bg-amber-50 text-amber-600" },
  processing: { text: "Đang đối soát", className: "bg-blue-50 text-blue-600" },
  clawback: { text: "Đã thu hồi", className: "bg-red-50 text-red-500" },
};

const BONUS_STATE_LABEL: Record<FriendOrderTimelineEntry["bonusState"], { text: string; className: string }> = {
  received: { text: "Đã nhận 🎀", className: "text-green-600 font-extrabold" },
  clawed_back: { text: "Đã thu hồi", className: "text-red-500" },
  not_eligible: { text: "Không đủ điều kiện", className: "text-neutral-400" },
  pending_eligible: { text: "Dự kiến", className: "text-primary-500 font-bold" },
  pending_capped: { text: "Đã đạt giới hạn", className: "text-neutral-400" },
};

export function ReferralClient({ customerCode, totalFriends, totalCommission, referralRate, maxReferralOrders, referralValidityMonths, isPartner, friends, friendOrderTimeline }: Props) {
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    setReferralLink(`${window.location.origin}/register?ref=${customerCode}`);
  }, [customerCode]);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success("Đã copy link giới thiệu! Hãy gửi cho bạn bè của bạn 🎀", "Đã sao chép");
  };

  return (
    <div className="flex w-full flex-col gap-6 fade-in pb-12">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-white">
        <img src="/welcome-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <FloatingElement duration={4}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border border-white/40 overflow-hidden p-1">
                <img src="/meow-back-community.png" alt="Referral" className="w-full h-full object-contain rounded-2xl" />
              </div>
            </FloatingElement>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Mời bạn bè 🎀
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                Chia sẻ niềm vui mua sắm và nhận hoa hồng thụ động trọn đời từ các đơn hàng của người được mời.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Link Section */}
          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-100/60 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 text-accent-bow flex items-center justify-center text-xl shadow-sm">
                  🎁
                </div>
                <h2 className="text-[16px] font-extrabold text-neutral-900">Link giới thiệu của bạn</h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <input 
                  type="text" 
                  value={referralLink} 
                  readOnly 
                  className="flex-1 h-12 rounded-2xl bg-primary-50/50 px-4 text-[14px] font-bold text-neutral-900 border border-primary-200 focus:outline-none"
                />
                <Button onClick={handleCopy} className="h-12 px-6 shrink-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 font-bold">
                  Sao chép 🎀
                </Button>
              </div>
              
              <p className="text-[13px] text-neutral-500 font-medium flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-600">i</span>
                Gửi link này cho bạn bè. Khi bạn bè đăng ký tài khoản MeowBack, bạn sẽ nhận được hoa hồng.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white p-5 shadow-cute border border-primary-100/80 flex flex-col justify-between h-[130px]">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                  <Users size={20} strokeWidth={2} />
                </div>
                <span className="text-[12px] font-extrabold text-neutral-500 uppercase tracking-wider">Bạn bè</span>
              </div>
              <div className="text-[32px] font-extrabold text-neutral-900">{totalFriends}</div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-cute border border-primary-100/80 flex flex-col justify-between h-[130px]">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F8EE] text-[#2D8A56]">
                  <TrendingUp size={20} strokeWidth={2} />
                </div>
                <span className="text-[12px] font-extrabold text-neutral-500 uppercase tracking-wider">Hoa hồng</span>
              </div>
              <div className="text-[32px] font-extrabold text-[#2D8A56]">{formatCurrency(totalCommission)}</div>
            </div>
          </div>
          
          {/* Friends List */}
          {friends.length > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[16px] font-extrabold text-neutral-900">Danh sách bạn bè đã mời</h2>
                <span className="rounded-full bg-primary-100 px-3 py-0.5 text-[11px] font-bold text-primary-600">{friends.length}</span>
              </div>
              <div className="mb-4 flex items-start gap-2 rounded-2xl bg-primary-50 p-3 border border-primary-100">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-200 text-[10px] font-bold text-primary-700">i</span>
                <p className="text-[12px] text-neutral-700 font-medium leading-relaxed">
                  Số đơn và hoa hồng chỉ cập nhật khi đơn của bạn bè đã <strong>"Đã hoàn tất"</strong>. Đơn đang <strong>"Chờ xác nhận"</strong> là bình thường — hoa hồng đang được xử lý.
                </p>
              </div>
              <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto">
                {friends.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 rounded-2xl bg-primary-50/40 p-3.5 border border-primary-100"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 text-[14px] font-black">
                      {f.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-bold text-neutral-900">
                        {f.fullName} <span className="font-mono text-[11px] font-medium text-neutral-400">({f.customerCode})</span>
                      </div>
                      <div className="truncate text-[12px] font-medium text-neutral-500">
                        Tham gia {formatDate(f.joinedAt)}
                        {!isPartner && ` · ${f.bonusOrderCount}/${maxReferralOrders} đơn đã nhận 🎀`}
                        {isPartner && f.bonusOrderCount > 0 && ` · ${f.bonusOrderCount} đơn đã tạo hoa hồng`}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={`text-[14px] font-extrabold ${f.totalEarned > 0 ? "text-[#2D8A56]" : "text-neutral-300"}`}>
                        {f.totalEarned > 0 ? `+${formatCurrency(f.totalEarned)}` : "Chưa có"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Table */}
          {friendOrderTimeline.length === 0 ? (
            <div className="rounded-3xl bg-primary-50/30 p-8 border border-primary-100 flex flex-col items-center justify-center h-[200px] text-center">
              <div className="text-4xl mb-2">🐾</div>
              {totalFriends === 0 ? (
                <>
                  <h3 className="text-[15px] font-extrabold text-neutral-800">Chưa có ai đăng ký</h3>
                  <p className="text-[13px] font-medium text-neutral-500 mt-1">Gửi link cho bạn bè ngay để nhận nơ hoa hồng 🎀!</p>
                </>
              ) : (
                <>
                  <h3 className="text-[15px] font-extrabold text-neutral-800">Bạn đã mời được {totalFriends} người bạn</h3>
                  <p className="text-[13px] font-medium text-neutral-500 mt-1 max-w-[320px]">
                    Chưa thấy đơn nào của bạn bè. Ngay khi họ mua hàng qua MeowBack, đơn sẽ tự động hiển thị tại đây!
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80">
              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-[16px] font-extrabold text-neutral-900">Đơn hàng của bạn bè</h2>
                <span className="text-[11px] font-medium text-neutral-500">
                  Số tiền ở đơn chưa xong là <strong>dự kiến</strong>
                </span>
              </div>
              {/* Desktop Table */}
              <div className="hidden md:block max-h-[420px] overflow-auto -mx-6 px-6">
                <table className="w-full min-w-[600px] text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-primary-100 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                      <th className="pb-2.5 pr-4">Bạn bè</th>
                      <th className="pb-2.5 pr-4">Tên đơn</th>
                      <th className="pb-2.5 pr-4">Ngày</th>
                      <th className="pb-2.5 pr-4">Trạng thái</th>
                      <th className="pb-2.5 pl-4 text-right">Hoa hồng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {friendOrderTimeline.map((entry) => {
                      const orderStatus = ORDER_STATUS_LABEL[entry.orderStatus] ?? { text: entry.orderStatus, className: "bg-neutral-100 text-neutral-500" };
                      const bonus = BONUS_STATE_LABEL[entry.bonusState];
                      const showAmount = entry.bonusState === "received" || entry.bonusState === "clawed_back" || entry.bonusState === "pending_eligible";
                      return (
                        <tr key={entry.id} className="border-b border-primary-50 last:border-0">
                          <td className="py-3 pr-4 align-top">
                            <div className="font-bold text-neutral-900">{entry.friendName}</div>
                            {entry.friendCode && (
                              <div className="font-mono text-[11px] text-neutral-400">{entry.friendCode}</div>
                            )}
                          </td>
                          <td className="py-3 pr-4 align-top max-w-[200px]">
                            <div className="truncate font-bold text-neutral-900" title={entry.itemName ?? undefined}>
                              {entry.itemName ?? `Đơn ${entry.orderExternalId}`}
                            </div>
                            <div className="truncate text-[11px] text-neutral-500 font-medium">
                              {entry.shopName}
                              {entry.shopName ? " · " : ""}
                              <span className="font-mono">{entry.orderExternalId}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 align-top text-neutral-500 font-medium whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                          <td className="py-3 pr-4 align-top">
                            <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold ${orderStatus.className}`}>
                              {orderStatus.text}
                            </span>
                          </td>
                          <td className="py-3 pl-4 align-top text-right whitespace-nowrap">
                            {showAmount && (
                              <div className={`font-extrabold ${entry.bonusState === "clawed_back" ? "text-negative line-through" : entry.bonusState === "received" ? "text-[#2D8A56]" : "text-primary-500"}`}>
                                {entry.bonusState === "pending_eligible" ? "~" : "+"}
                                {formatCurrency(entry.bonusAmount)}
                              </div>
                            )}
                            <div className={`text-[10px] font-bold ${bonus.className}`}>{bonus.text}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden flex flex-col gap-3 max-h-[420px] overflow-y-auto">
                {friendOrderTimeline.map((entry) => {
                  const orderStatus = ORDER_STATUS_LABEL[entry.orderStatus] ?? { text: entry.orderStatus, className: "bg-neutral-100 text-neutral-500" };
                  const bonus = BONUS_STATE_LABEL[entry.bonusState];
                  const showAmount = entry.bonusState === "received" || entry.bonusState === "clawed_back" || entry.bonusState === "pending_eligible";
                  return (
                    <div key={entry.id} className="rounded-2xl border border-primary-100 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-[13px] font-bold text-neutral-900">{entry.friendName}</div>
                          {entry.friendCode && <div className="font-mono text-[10px] text-neutral-400">{entry.friendCode}</div>}
                        </div>
                        <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold ${orderStatus.className}`}>
                          {orderStatus.text}
                        </span>
                      </div>
                      <div className="text-[13px] font-bold text-neutral-900 truncate" title={entry.itemName ?? undefined}>
                        {entry.itemName ?? `Đơn ${entry.orderExternalId}`}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-medium truncate mt-0.5">
                        {entry.shopName}{entry.shopName ? " · " : ""}<span className="font-mono">{entry.orderExternalId}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary-50">
                        <span className="text-[12px] font-medium text-neutral-500">{formatDate(entry.createdAt)}</span>
                        <div className="text-right">
                          {showAmount && (
                            <div className={`text-[13px] font-extrabold ${entry.bonusState === "clawed_back" ? "text-negative line-through" : entry.bonusState === "received" ? "text-[#2D8A56]" : "text-primary-500"}`}>
                              {entry.bonusState === "pending_eligible" ? "~" : "+"}{formatCurrency(entry.bonusAmount)}
                            </div>
                          )}
                          <div className={`text-[10px] font-bold ${bonus.className}`}>{bonus.text}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          {/* Rewards Box */}
          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-100/40 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <IconBow className="w-6 h-6 text-accent-bow" />
                <h2 className="text-[18px] font-extrabold text-neutral-900">Phần thưởng của bạn 🎀</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="text-primary-500 shrink-0 mt-0.5" size={20} />
                  <div className="w-full">
                    <h3 className="text-[14px] font-bold text-neutral-900">Nhận thêm {referralRate * 100}% hoa hồng</h3>
                    <p className="text-[13px] text-neutral-600 font-medium mt-0.5">Bạn nhận thêm {referralRate * 100}% trên số tiền hoàn mà bạn bè nhận được ở mỗi đơn hàng thành công.</p>
                  </div>
                </div>

                {isPartner ? (
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-[#2D8A56] shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="text-[14px] font-bold text-neutral-900">🤝 Đối tác — không giới hạn</h3>
                      <p className="text-[13px] text-neutral-600 font-medium mt-0.5">
                        Nhận hoa hồng trên <strong>tất cả</strong> đơn hàng của bạn bè, không giới hạn số đơn.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3">
                      <CheckCircle2 className="text-primary-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h3 className="text-[14px] font-bold text-neutral-900">Áp dụng cho {maxReferralOrders} đơn đầu tiên</h3>
                        <p className="text-[13px] text-neutral-600 font-medium mt-0.5">{maxReferralOrders} đơn hàng đầu tiên tính riêng cho từng người bạn được mời.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle2 className="text-primary-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h3 className="text-[14px] font-bold text-neutral-900">Thời hạn {referralValidityMonths} tháng</h3>
                        <p className="text-[13px] text-neutral-600 font-medium mt-0.5">Đơn phát sinh trong {referralValidityMonths} tháng kể từ lúc bạn bè đăng ký.</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <CheckCircle2 className="text-primary-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-[14px] font-bold text-neutral-900">Bạn bè giữ 100% tiền hoàn</h3>
                    <p className="text-[13px] text-neutral-600 font-medium mt-0.5">Người được mời vẫn nhận đủ 100% tiền hoàn của họ — 5% này MeowBack thưởng thêm cho bạn.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-primary-50/50 p-4 border border-primary-100">
                <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Điều kiện nhận nơ thưởng 🎀</h4>
                <ul className="list-disc list-inside text-[13px] font-medium text-neutral-600 space-y-1">
                  <li>Chỉ áp dụng khi bạn bè đăng ký qua link mời.</li>
                  <li>Đơn hàng phải ở trạng thái "Đã hoàn tất".</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* How it works */}
          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80">
            <h2 className="text-[16px] font-extrabold text-neutral-900 mb-4">Cách thức hoạt động 🐾</h2>
            <div className="relative border-l-2 border-primary-200 ml-3 pl-4 space-y-4 py-1">
              <div className="relative">
                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-primary-100"></div>
                <h3 className="text-[14px] font-bold text-neutral-900">1. Lấy link mời MeowBack</h3>
                <p className="text-[13px] font-medium text-neutral-500 mt-0.5">Copy link giới thiệu cá nhân ở phía trên.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-primary-100"></div>
                <h3 className="text-[14px] font-bold text-neutral-900">2. Gửi cho bạn bè</h3>
                <p className="text-[13px] font-medium text-neutral-500 mt-0.5">Chia sẻ link qua Zalo, Facebook hoặc Threads.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary-400 ring-4 ring-primary-100"></div>
                <h3 className="text-[14px] font-bold text-neutral-900">3. Nhận quà thụ động 🎀</h3>
                <p className="text-[13px] font-medium text-neutral-500 mt-0.5">Tự động nhận hoa hồng mỗi khi bạn bè mua sắm thành công.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

