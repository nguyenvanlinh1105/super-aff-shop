"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export interface MonthData {
  label: string;
  commission: number;
  reward: number;
  profit: number;
  count: number;
}

interface AdminRevenueChartProps {
  chartMonths: MonthData[];
  growthPct: number;
  prevMLabel?: string;
  maxVal: number;
}

export function AdminRevenueChart({
  chartMonths,
  growthPct,
  prevMLabel,
  maxVal,
}: AdminRevenueChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const activeIdx = hoveredIdx !== null ? hoveredIdx : chartMonths.length - 1;
  const activeMonth = chartMonths[activeIdx] ?? chartMonths[chartMonths.length - 1];

  const PLOT = { left: 46, right: 584, top: 40, bottom: 165 };
  const n = chartMonths.length;
  const getX = (i: number) => PLOT.left + 14 + i * ((PLOT.right - PLOT.left - 28) / Math.max(n - 1, 1));
  const getY = (val: number) => PLOT.bottom - (val / maxVal) * (PLOT.bottom - PLOT.top);

  const commPoints = chartMonths.map((m, i) => ({ x: getX(i), y: getY(m.commission), val: m.commission }));
  const rewPoints = chartMonths.map((m, i) => ({ x: getX(i), y: getY(m.reward), val: m.reward }));
  const profPoints = chartMonths.map((m, i) => ({ x: getX(i), y: getY(m.profit), val: m.profit }));

  const makePath = (pts: typeof commPoints) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const makeArea = (pts: typeof commPoints) =>
    `${makePath(pts)} L ${pts[pts.length - 1].x} ${PLOT.bottom} L ${pts[0].x} ${PLOT.bottom} Z`;

  const fmtShort = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (v >= 1000) return `${Math.round(v / 1000)}k`;
    return `${v}`;
  };

  const midY = (PLOT.top + PLOT.bottom) / 2;

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-neutral-200/70 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 p-1 flex items-center justify-center shadow-xs border border-rose-100 shrink-0 overflow-hidden">
            <img src="/meow-back-analytics.png" alt="Analytics" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">Xu Hướng Tăng Trưởng Doanh Thu</h2>
            <p className="text-xs text-neutral-500 font-medium">Rà chuột vào từng tháng để xem chi tiết tiền hoa hồng & lợi nhuận</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 text-[11px] font-extrabold shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-neutral-700">Hoa hồng sàn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-neutral-700">Hoàn khách</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-neutral-700">Lợi nhuận</span>
          </div>
        </div>
      </div>

      {/* Summary chips: Tự động cập nhật theo tháng đang hover */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 p-3.5 rounded-2xl bg-neutral-50/90 border border-neutral-200/70 transition-all">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider">
            Hoa hồng {activeMonth.label} {hoveredIdx !== null ? "🔍" : ""}
          </span>
          <span className="text-sm sm:text-base font-black text-neutral-900 tabular-nums">
            {formatCurrency(activeMonth.commission)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">
            Hoàn khách {activeMonth.label}
          </span>
          <span className="text-sm sm:text-base font-black text-neutral-900 tabular-nums">
            {formatCurrency(activeMonth.reward)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
            Lợi nhuận {activeMonth.label}
          </span>
          <span className="text-sm sm:text-base font-black text-emerald-700 tabular-nums">
            {formatCurrency(activeMonth.profit)}
          </span>
        </div>
      </div>

      {/* Interactive SVG 3-Line Graph */}
      <div className="relative w-full">
        <svg
          viewBox="0 0 600 215"
          className="w-full h-auto select-none overflow-visible"
          role="img"
          aria-label="Biểu đồ xu hướng doanh thu"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={PLOT.left} y1={PLOT.top} x2={PLOT.right} y2={PLOT.top} stroke="#F1F5F9" strokeWidth="1" />
          <line x1={PLOT.left} y1={midY} x2={PLOT.right} y2={midY} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1" />
          <line x1={PLOT.left} y1={PLOT.bottom} x2={PLOT.right} y2={PLOT.bottom} stroke="#D1D5DB" strokeWidth="1.5" />

          <text x={PLOT.left - 6} y={PLOT.top + 4} textAnchor="end" className="text-[10px] font-bold fill-neutral-400">
            {fmtShort(maxVal)}
          </text>
          <text x={PLOT.left - 6} y={midY + 4} textAnchor="end" className="text-[10px] font-bold fill-neutral-400">
            {fmtShort(maxVal / 2)}
          </text>
          <text x={PLOT.left - 6} y={PLOT.bottom + 4} textAnchor="end" className="text-[10px] font-bold fill-neutral-400">
            0
          </text>

          {/* Area Fills */}
          <path d={makeArea(commPoints)} fill="url(#roseGradient)" />
          <path d={makeArea(profPoints)} fill="url(#emeraldGradient)" />

          {/* Lines */}
          <path d={makePath(commPoints)} fill="none" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={makePath(rewPoints)} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={makePath(profPoints)} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Hover Guideline */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={PLOT.top}
              x2={getX(hoveredIdx)}
              y2={PLOT.bottom}
              stroke="#F43F5E"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Data Points */}
          {commPoints.map((p, i) => (
            <g key={`comm-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 6 : 4.5}
                fill={hoveredIdx === i ? "#F43F5E" : "#FFFFFF"}
                stroke="#F43F5E"
                strokeWidth={hoveredIdx === i ? 3 : 2.5}
                className="transition-all"
              />
              {hoveredIdx !== i && (
                <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[10px] font-black fill-rose-600 font-mono">
                  {fmtShort(p.val)}
                </text>
              )}
            </g>
          ))}
          {rewPoints.map((p, i) => (
            <g key={`rew-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 5.5 : 4}
                fill={hoveredIdx === i ? "#F59E0B" : "#FFFFFF"}
                stroke="#F59E0B"
                strokeWidth="2"
                className="transition-all"
              />
              {hoveredIdx !== i && p.val > 0 && Math.abs(p.y - commPoints[i].y) > 16 && (
                <text x={p.x} y={p.y - 7} textAnchor="middle" className="text-[9px] font-extrabold fill-amber-600 font-mono">
                  {fmtShort(p.val)}
                </text>
              )}
            </g>
          ))}
          {profPoints.map((p, i) => (
            <circle
              key={`prof-${i}`}
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? 5 : 3.5}
              fill={hoveredIdx === i ? "#10B981" : "#FFFFFF"}
              stroke="#10B981"
              strokeWidth="2"
              className="transition-all"
            />
          ))}

          {/* Month Labels & Interactive Hover Columns */}
          {chartMonths.map((m, i) => {
            const cx = getX(i);
            const isHovered = hoveredIdx === i;

            // Tính vị trí Tooltip thông minh không che điểm dữ liệu
            const tooltipBoxX = Math.max(10, Math.min(cx - 85, 420));
            const commY = commPoints[i].y;
            const tooltipBoxY = commY < 100 ? commY + 14 : commY - 72;

            return (
              <g
                key={`col-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
              >
                {/* Invisible hover area */}
                <rect
                  x={cx - 35}
                  y={PLOT.top - 10}
                  width="70"
                  height={PLOT.bottom - PLOT.top + 45}
                  fill="transparent"
                />

                {/* Month Label */}
                <text
                  x={cx}
                  y={PLOT.bottom + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-black transition-colors ${
                    isHovered ? "fill-rose-600 font-extrabold" : "fill-neutral-700"
                  }`}
                >
                  {m.label}
                </text>
                <text
                  x={cx}
                  y={PLOT.bottom + 31}
                  textAnchor="middle"
                  className={`text-[9px] font-bold transition-colors ${
                    isHovered ? "fill-rose-600 font-black" : "fill-neutral-400"
                  }`}
                >
                  {m.count} đơn
                </text>

                {/* Floating Rich Tooltip on Hover */}
                {isHovered && (
                  <g className="pointer-events-none">
                    {/* Tooltip Background Card */}
                    <rect
                      x={tooltipBoxX}
                      y={tooltipBoxY}
                      width="170"
                      height="65"
                      rx="12"
                      fill="#0F172A"
                      opacity="0.96"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    {/* Tooltip Title */}
                    <text
                      x={tooltipBoxX + 12}
                      y={tooltipBoxY + 16}
                      className="text-[10px] font-extrabold fill-rose-300"
                    >
                      THÁNG {m.label.replace("Thg ", "")} ({m.count} ĐƠN HÀNG)
                    </text>
                    {/* Tooltip Currency Lines */}
                    <text
                      x={tooltipBoxX + 12}
                      y={tooltipBoxY + 30}
                      className="text-[10px] font-bold fill-white"
                    >
                      • Sàn trả: {formatCurrency(m.commission)}
                    </text>
                    <text
                      x={tooltipBoxX + 12}
                      y={tooltipBoxY + 43}
                      className="text-[10px] font-bold fill-amber-300"
                    >
                      • Hoàn khách: {formatCurrency(m.reward)}
                    </text>
                    <text
                      x={tooltipBoxX + 12}
                      y={tooltipBoxY + 56}
                      className="text-[10px] font-bold fill-emerald-400"
                    >
                      • Lợi nhuận: {formatCurrency(m.profit)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer info */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500 font-medium gap-2">
        <span className={`flex items-center gap-1 font-bold ${growthPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {growthPct >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          {growthPct >= 0 ? "+" : ""}{growthPct}% hoa hồng so với {prevMLabel ?? "kỳ trước"}
        </span>
        <span>Rà chuột vào từng điểm/tháng để hiển thị số tiền đầy đủ</span>
      </div>
    </div>
  );
}
