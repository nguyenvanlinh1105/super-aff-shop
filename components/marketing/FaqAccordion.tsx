"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Search,
  X,
  HelpCircle,
  Sparkles,
  MessageCircleQuestion,
  ThumbsUp,
  Zap,
  Wallet,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

export type FaqItem = { question: string; answer: string; group?: string };

const GROUP_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  "VỀ CÁCH HOẠT ĐỘNG": {
    icon: Zap,
    color: "from-amber-400 to-orange-500",
    label: "Cách hoạt động",
  },
  "VỀ HOÀN TIỀN & RÚT TIỀN": {
    icon: Wallet,
    color: "from-primary-400 via-[#FF3B7B] to-primary-600",
    label: "Hoàn & Rút tiền",
  },
  "VỀ SHOPEE": {
    icon: ShoppingBag,
    color: "from-sky-400 to-blue-600",
    label: "Shopee",
  },
  "VỀ BẢO MẬT & TÀI KHOẢN": {
    icon: ShieldCheck,
    color: "from-emerald-400 to-teal-600",
    label: "Bảo mật & Ví",
  },
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  // All distinct groups
  const allGroups = useMemo(() => {
    const list: string[] = [];
    for (const item of items) {
      const g = item.group ?? "KHÁC";
      if (!list.includes(g)) list.push(g);
    }
    return list;
  }, [items]);

  // Filter items by search query & selected group tab
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesGroup =
        selectedGroup === "ALL" || (item.group ?? "KHÁC") === selectedGroup;
      const matchesQuery =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [items, selectedGroup, query]);

  // Group filtered items for rendering
  const groupedData = useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    for (const item of filteredItems) {
      const g = item.group ?? "KHÁC";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return Array.from(map.entries()).map(([group, groupItems]) => ({
      group,
      groupItems,
    }));
  }, [filteredItems]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
      {/* ── MOBILE HEADER CONTROLS (Chỉ hiện trên Mobile < lg: Tối ưu gọn gàng) ── */}
      <div className="lg:hidden flex flex-col gap-3">
        {/* Search Bar Mobile */}
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) setSelectedGroup("ALL");
            }}
            placeholder="Tìm kiếm câu hỏi (rút tiền, hoàn tiền...)"
            className="w-full rounded-2xl border border-primary-200/90 bg-white py-2.5 pl-10 pr-9 text-xs sm:text-[13px] font-bold text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 shadow-2xs"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Mobile Horizontal Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          <button
            type="button"
            onClick={() => setSelectedGroup("ALL")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
              selectedGroup === "ALL"
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-cute"
                : "bg-white text-neutral-700 border border-primary-100/90 hover:bg-neutral-50 shadow-2xs"
            }`}
          >
            <Sparkles size={13} />
            <span>Tất cả</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                selectedGroup === "ALL" ? "bg-white/25 text-white" : "bg-primary-100 text-primary-700"
              }`}
            >
              {items.length}
            </span>
          </button>

          {allGroups.map((g) => {
            const conf = GROUP_CONFIG[g] || {
              icon: MessageCircleQuestion,
              color: "from-primary-400 to-primary-500",
              label: g,
            };
            const IconComp = conf.icon;
            const count = items.filter((i) => (i.group ?? "KHÁC") === g).length;
            const isSelected = selectedGroup === g;

            return (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGroup(g)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-cute"
                    : "bg-white text-neutral-700 border border-primary-100/90 hover:bg-neutral-50 shadow-2xs"
                }`}
              >
                <IconComp size={13} />
                <span>{conf.label || g}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? "bg-white/25 text-white" : "bg-primary-100 text-primary-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── LEFT SIDEBAR TRÊN PC (hidden lg:block: Giữ nguyên 100% như cũ) ── */}
      <div className="hidden lg:block lg:col-span-4 space-y-6 lg:sticky lg:top-24">
        {/* Search Bar */}
        <div className="relative bg-white rounded-3xl p-4 border-2 border-primary-100 shadow-cute">
          <label className="text-[12px] font-black uppercase tracking-wider text-primary-600 mb-2 block">
            🔍 Tìm kiếm câu hỏi
          </label>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) setSelectedGroup("ALL");
              }}
              placeholder="Nhập từ khóa (rút tiền, shopee...)"
              className="w-full rounded-2xl border-2 border-primary-200 bg-primary-50/40 py-3 pl-10 pr-9 text-[13.5px] font-bold text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="bg-white rounded-3xl p-5 border-2 border-primary-100 shadow-cute space-y-2">
          <span className="text-[12px] font-black uppercase tracking-wider text-neutral-500 mb-3 block">
            Danh Mục Chủ Đề
          </span>

          {/* All Tab */}
          <button
            onClick={() => setSelectedGroup("ALL")}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-black text-[14px] transition-all duration-200 text-left ${
              selectedGroup === "ALL"
                ? "bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 text-white shadow-cute scale-[1.02]"
                : "bg-neutral-50 text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} />
              <span>Tất cả câu hỏi</span>
            </div>
            <span
              className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                selectedGroup === "ALL"
                  ? "bg-white/30 text-white"
                  : "bg-primary-100 text-primary-700"
              }`}
            >
              {items.length}
            </span>
          </button>

          {/* Group Specific Tabs */}
          {allGroups.map((g) => {
            const conf = GROUP_CONFIG[g] || {
              icon: MessageCircleQuestion,
              color: "from-primary-400 to-primary-500",
              label: g,
            };
            const IconComp = conf.icon;
            const count = items.filter((i) => (i.group ?? "KHÁC") === g).length;
            const isSelected = selectedGroup === g;

            return (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-black text-[14px] transition-all duration-200 text-left ${
                  isSelected
                    ? "bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 text-white shadow-cute scale-[1.02]"
                    : "bg-neutral-50 text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComp size={18} />
                  <span>{conf.label || g}</span>
                </div>
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/30 text-white"
                      : "bg-primary-100 text-primary-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT CONTENT PANEL (8/12 width) ── */}
      <div className="lg:col-span-8 space-y-6 sm:space-y-8">
        {filteredItems.length === 0 ? (
          <div className="py-12 sm:py-16 text-center bg-white rounded-2xl sm:rounded-3xl border-2 border-primary-100 shadow-cute p-6 sm:p-8">
            <HelpCircle size={40} className="sm:w-12 sm:h-12 mx-auto text-primary-400 mb-3" />
            <h3 className="text-[16px] sm:text-[18px] font-black text-neutral-950 mb-1">
              Không tìm thấy câu hỏi phù hợp
            </h3>
            <p className="text-[13px] sm:text-[14px] text-neutral-600 font-medium">
              Không tìm thấy câu hỏi chứa từ khóa "{query}". Thử chọn danh mục khác ở trên.
            </p>
          </div>
        ) : (
          groupedData.map(({ group, groupItems }) => {
            const conf = GROUP_CONFIG[group] || {
              icon: MessageCircleQuestion,
              color: "from-primary-400 to-primary-500",
              label: group,
            };
            const GroupIcon = conf.icon;

            return (
              <div key={group} className="space-y-3 sm:space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-2.5 sm:gap-3 bg-gradient-to-r from-primary-100/90 via-primary-50 to-white px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-primary-200/80 shadow-sm">
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br ${conf.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                    <GroupIcon size={16} className="sm:w-5 sm:h-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-[13.5px] sm:text-[16px] font-black text-neutral-950 uppercase tracking-wide">
                      {group}
                    </h3>
                    <span className="text-[11px] sm:text-[11.5px] font-bold text-neutral-500">
                      {groupItems.length} câu hỏi giải đáp chi tiết
                    </span>
                  </div>
                </div>

                {/* Question Accordion Cards */}
                <div className="space-y-2.5 sm:space-y-3.5">
                  {groupItems.map((item) => {
                    const key = `${group}-${item.question}`;
                    const isOpen = openKey === key || filteredItems.length === 1;
                    const isHelpful = helpfulFeedback[key];

                    return (
                      <div
                        key={key}
                        className={`rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 overflow-hidden ${
                          isOpen
                            ? "bg-gradient-to-br from-primary-50/90 via-white to-primary-50/30 border-primary-300 shadow-cute-lg"
                            : "bg-white border-primary-100/90 hover:border-primary-300 hover:shadow-cute"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenKey(isOpen ? null : key)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-5 text-left"
                        >
                          <span className="text-[14px] sm:text-[16.5px] font-black text-neutral-950 leading-snug">
                            {item.question}
                          </span>
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                              isOpen
                                ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white rotate-180 shadow-cute"
                                : "bg-primary-100 text-primary-600"
                            }`}
                          >
                            <ChevronDown size={17} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                          </div>
                        </button>

                        {/* Answer Expanded Block */}
                        <div
                          className={`grid transition-all duration-300 ease-out ${
                            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2 border-t border-primary-100/80 space-y-3 sm:space-y-4">
                              <p className="text-[13px] sm:text-[15px] font-semibold leading-relaxed text-neutral-800 whitespace-pre-line">
                                {item.answer}
                              </p>

                              {/* Feedback Bar */}
                              <div className="pt-2.5 sm:pt-3 border-t border-primary-100/50 flex items-center justify-between flex-wrap gap-2 text-[11px] sm:text-[12px] font-bold text-neutral-500">
                                <span>Câu trả lời này có giúp ích cho bạn không?</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      setHelpfulFeedback((prev) => ({
                                        ...prev,
                                        [key]: true,
                                      }))
                                    }
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all text-xs ${
                                      isHelpful
                                        ? "bg-emerald-500 text-white border-emerald-500"
                                        : "bg-white text-neutral-700 border-neutral-200 hover:border-emerald-400"
                                    }`}
                                  >
                                    <ThumbsUp size={12} />
                                    <span>{isHelpful ? "Cảm ơn bạn!" : "Hữu ích"}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

