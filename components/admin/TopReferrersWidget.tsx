"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Gift,
  Building2,
  Megaphone,
  ArrowUpRight,
} from "lucide-react";

export interface ReferrerItem {
  id: string;
  name: string;
  code: string;
  phone: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  momoNumber: string | null;
  momoName: string | null;
  countThisMonth: number;
  totalReferrals: number;
}

interface TopReferrersWidgetProps {
  currentMonth: number;
  currentYear: number;
  monthTopList: ReferrerItem[];
  allTimeTopList: ReferrerItem[];
  totalReferralsThisMonth: number;
}

export function TopReferrersWidget({
  currentMonth,
  currentYear,
  monthTopList,
  allTimeTopList,
  totalReferralsThisMonth,
}: TopReferrersWidgetProps) {
  const [tab, setTab] = useState<"month" | "allTime">("month");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeList = tab === "month" ? monthTopList : allTimeTopList;
  const maxCount = activeList[0]?.countThisMonth || activeList[0]?.totalReferrals || 1;

  const copyBank = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-neutral-200/70 flex flex-col gap-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Trophy size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                Top 10 Người Mời Nhiều Nhất
              </h2>
              <span className="rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 text-[11px] font-black text-rose-600">
                Thưởng +50.000đ Ví 🎁
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Bảng xếp hạng đua top giới thiệu thành viên mới • Cập nhật tự động thời gian thực
            </p>
          </div>
        </div>

        {/* Tab switcher + Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex p-1 rounded-2xl bg-neutral-100/80 border border-neutral-200/60">
            <button
              type="button"
              onClick={() => setTab("month")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                tab === "month"
                  ? "bg-white text-rose-600 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              🔥 Tháng {currentMonth}/{currentYear} ({totalReferralsThisMonth})
            </button>
            <button
              type="button"
              onClick={() => setTab("allTime")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                tab === "allTime"
                  ? "bg-white text-rose-600 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              ⭐ Toàn thời gian
            </button>
          </div>

          <Link
            href="/admin/community"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black border border-rose-200/80 transition-all shrink-0"
          >
            <Megaphone size={14} />
            <span>Phát thông báo đua top</span>
          </Link>
        </div>
      </div>

      {/* ─── NỘI DUNG BẢNG XẾP HẠNG ─── */}
      {activeList.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-neutral-50/70 border border-dashed border-neutral-200 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Gift size={24} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-neutral-800">
              Chưa có dữ liệu giới thiệu {tab === "month" ? `trong Tháng ${currentMonth}/${currentYear}` : ""}
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Chưa có thành viên nào mời bạn bè trong khoảng thời gian này. Bạn có thể phát thông báo broadcast để kích hoạt phong trào đua top!
            </p>
          </div>
          <Link
            href="/admin/community"
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-black shadow-cute hover:shadow-cute-lg transition-all"
          >
            <Sparkles size={14} />
            <span>Gửi thông báo Đua Top (+50k) ngay</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-neutral-600 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5 text-center w-16">Hạng</th>
                <th className="py-3 px-4">Thành viên</th>
                <th className="py-3 px-4 text-center">
                  {tab === "month" ? `Lượt mời T${currentMonth}` : "Tổng lượt mời"}
                </th>
                <th className="py-3 px-4">Thông tin nhận thưởng (TK Ngân hàng / MoMo)</th>
                <th className="py-3 px-4 text-center">Giải thưởng dự kiến</th>
                <th className="py-3 px-3.5 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {activeList.map((item, idx) => {
                const count = tab === "month" ? item.countThisMonth : item.totalReferrals;
                const pct = Math.max(Math.round((count / maxCount) * 100), 10);

                // Huân chương cho Top 3
                const rankBadge =
                  idx === 0 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 text-amber-950 font-black text-sm shadow-xs border border-white">
                      🥇
                    </span>
                  ) : idx === 1 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 font-black text-sm shadow-xs border border-white">
                      🥈
                    </span>
                  ) : idx === 2 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-black text-sm shadow-xs border border-white">
                      🥉
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-neutral-100 text-neutral-600 font-bold text-xs">
                      #{idx + 1}
                    </span>
                  );

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-neutral-50/80 transition-colors ${
                      idx === 0 ? "bg-amber-50/30" : idx === 1 ? "bg-slate-50/30" : idx === 2 ? "bg-orange-50/20" : ""
                    }`}
                  >
                    {/* Hạng */}
                    <td className="py-3.5 px-3.5 text-center">{rankBadge}</td>

                    {/* Thông tin thành viên */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-rose-200/80 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          <img src="/icon-512.png" alt="MeowBack" className="w-full h-full object-contain rounded-lg" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/customers/${item.id}`}
                            className="text-xs font-black text-neutral-900 hover:text-rose-600 flex items-center gap-1 group"
                          >
                            <span className="truncate">{item.name}</span>
                            <ArrowUpRight
                              size={12}
                              className="text-neutral-400 group-hover:text-rose-600 transition-colors shrink-0"
                            />
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500 font-medium">
                            <span className="font-mono font-bold text-neutral-600">{item.code}</span>
                            {item.phone && <span>• {item.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Số lượt mời */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-rose-600 tabular-nums">
                          {count.toLocaleString()} bạn
                        </span>
                        {tab === "month" && (
                          <span className="text-[10px] text-neutral-400 font-medium">
                            Tổng tích luỹ: {item.totalReferrals}
                          </span>
                        )}
                        <div className="w-24 h-1.5 rounded-full bg-neutral-100 overflow-hidden mt-1">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full ${
                              idx === 0
                                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                : idx === 1
                                ? "bg-gradient-to-r from-slate-400 to-slate-600"
                                : idx === 2
                                ? "bg-gradient-to-r from-amber-500 to-amber-700"
                                : "bg-gradient-to-r from-rose-400 to-pink-500"
                            }`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Ngân hàng / MoMo */}
                    <td className="py-3.5 px-4">
                      {item.bankAccountNumber ? (
                        <div className="flex items-center gap-2">
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-bold text-neutral-800 flex items-center gap-1 truncate">
                              <Building2 size={13} className="text-neutral-400 shrink-0" />
                              <span className="font-black text-neutral-900">{item.bankName || "Ngân hàng"}</span>
                              <span className="text-neutral-500 font-mono">({item.bankAccountNumber})</span>
                            </div>
                            {item.bankAccountName && (
                              <div className="text-[10.5px] text-neutral-500 uppercase font-semibold">
                                {item.bankAccountName}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => copyBank(item.id, item.bankAccountNumber!)}
                            title="Sao chép số tài khoản"
                            className="p-1 rounded-md hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 transition-colors shrink-0"
                          >
                            {copiedId === item.id ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      ) : item.momoNumber ? (
                        <div className="text-[11.5px] font-bold text-pink-700 flex items-center gap-1.5">
                          <span>MoMo:</span>
                          <span className="font-mono">{item.momoNumber}</span>
                          {item.momoName && <span className="text-neutral-500">({item.momoName})</span>}
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400 italic">Chưa thiết lập TK nhận thưởng</span>
                      )}
                    </td>

                    {/* Giải thưởng */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-black text-[11px]">
                        <Gift size={12} className="text-emerald-600" />
                        <span>+50.000đ ví</span>
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-3.5 text-right">
                      <Link
                        href={`/admin/customers/${item.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1 rounded-lg border border-rose-200/60 transition-colors"
                      >
                        <span>Chi tiết</span>
                        <ArrowUpRight size={11} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
