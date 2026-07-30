"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck2, Gift } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/TextInput";
import { Select } from "@/components/ui/Select";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";

type Option = { id: string; label: string };
type PreviewRow = {
  orderExternalId?: string;
  trackingCode?: string;
  orderAmount?: number;
  commissionAmount?: number;
  orderStatus?: string;
};
type PreviewResult = {
  totalRows: number;
  matchedRows: number;
  unmappedRows: number;
  preview: PreviewRow[];
};
type CommitResult = {
  successRows: number;
  unmappedRows: number;
  errorRows: number;
  duplicateRows: number;
  referralBonusCount: number;
  referralBonusTotal: number;
};

export function ImportOrdersWizard({ platforms }: { platforms: Option[] }) {
  const router = useRouter();
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [sourceName, setSourceName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runPreview(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setCommitResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "preview");
    formData.append("platformId", platformId);
    formData.append("sourceName", sourceName);

    const res = await fetch("/api/orders/import", { method: "POST", body: formData });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Không đọc được file");
      return;
    }

    setPreview(await res.json());
  }

  async function runCommit() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "commit");
    formData.append("platformId", platformId);
    formData.append("sourceName", sourceName);

    const res = await fetch("/api/orders/import", { method: "POST", body: formData });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Import thất bại");
      return;
    }

    setCommitResult(await res.json());
    setPreview(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-neutral-200/70 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={runPreview} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5 block">Nền Tảng Affiliate</label>
              <Select value={platformId} onChange={(e) => setPlatformId(e.target.value)} className="w-full">
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5 block">Nguồn File / Ghi Chú</label>
              <TextInput
                placeholder="VD: Shopee Affiliate CSV tháng 07/2026"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
              />
            </div>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-rose-200 bg-gradient-to-br from-rose-50/40 via-white to-pink-50/30 px-6 py-10 text-center transition-all duration-200 hover:border-rose-400 hover:bg-rose-50/60 shadow-xs">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            {file ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <FileCheck2 size={24} strokeWidth={2} />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-neutral-900 block">{file.name}</span>
                  <span className="text-xs text-neutral-400 font-medium">Bấm để chọn lại file khác</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                  <Upload size={24} strokeWidth={2} />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-neutral-900 block">Kéo thả hoặc Bấm để chọn file CSV đối soát</span>
                  <span className="text-xs text-neutral-400 font-medium">Hỗ trợ định dạng chuẩn UTF-8 CSV từ Shopee & Lazada</span>
                </div>
              </>
            )}
          </label>

          {error && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600">{error}</div>}
          
          <Button type="submit" disabled={loading || !file} className="w-fit bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold shadow-md shadow-rose-500/20">
            {loading ? "Đang xử lý đọc file..." : "Xem Trước Bản Xem Preview 📥"}
          </Button>
        </form>
      </div>

      {preview && (
        <div className="rounded-3xl border border-neutral-200/70 bg-white p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <h2 className="text-lg font-extrabold text-neutral-900 tracking-tight">Kết Quả Xem Trước (Preview)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70">
              <div className="text-2xl font-black tabular-nums text-neutral-900">{preview.totalRows}</div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Tổng số dòng CSV</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-2xl font-black tabular-nums text-emerald-700">{preview.matchedRows}</div>
              <div className="text-xs font-bold text-emerald-700/80 uppercase tracking-wider">Khớp Mã Tracking</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="text-2xl font-black tabular-nums text-rose-600">{preview.unmappedRows}</div>
              <div className="text-xs font-bold text-rose-600/80 uppercase tracking-wider">Chưa Khớp Tracking</div>
            </div>
          </div>

          {preview.preview.length > 0 && (
            <div className="flex flex-col gap-2">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Order ID</Th>
                    <Th>Tracking code</Th>
                    <Th align="right">Giá trị đơn</Th>
                    <Th align="right">Commission</Th>
                    <Th>Trạng thái</Th>
                  </Tr>
                </Thead>
                <tbody>
                  {preview.preview.slice(0, 10).map((row, i) => (
                    <Tr key={i}>
                      <Td className="font-mono text-xs font-bold">{row.orderExternalId || "—"}</Td>
                      <Td className="font-mono text-xs text-neutral-500">{row.trackingCode || "—"}</Td>
                      <Td numeric>{row.orderAmount?.toLocaleString("vi-VN") ?? "—"}</Td>
                      <Td numeric>{row.commissionAmount?.toLocaleString("vi-VN") ?? "—"}</Td>
                      <Td className="font-bold text-xs">{row.orderStatus || "—"}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
              {preview.preview.length > 10 && (
                <p className="mt-1 text-xs text-neutral-400 font-medium">
                  Hiển thị 10/{preview.preview.length} dòng đầu tiên trong bản xem trước.
                </p>
              )}
            </div>
          )}

          <Button onClick={runCommit} disabled={loading} className="w-fit bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-md shadow-emerald-600/20">
            {loading ? "Đang ghi vào hệ thống..." : "Xác Nhận Import Đơn Hàng Vào Hệ Thống ✅"}
          </Button>
        </div>
      )}

      {commitResult && (
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <h2 className="text-lg font-extrabold text-emerald-900 tracking-tight">Import Đơn Hàng Hoàn Tất! 🎉</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white border border-emerald-200">
              <div className="text-2xl font-black tabular-nums text-emerald-700">{commitResult.successRows}</div>
              <div className="text-[10px] font-black uppercase text-emerald-700/70 tracking-wider">Thành công</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-neutral-200">
              <div className="text-2xl font-black tabular-nums text-neutral-700">{commitResult.duplicateRows}</div>
              <div className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Đã có (Trùng)</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-amber-200">
              <div className="text-2xl font-black tabular-nums text-amber-600">{commitResult.unmappedRows}</div>
              <div className="text-[10px] font-black uppercase text-amber-600/80 tracking-wider">Chưa Map Khách</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-rose-200">
              <div className="text-2xl font-black tabular-nums text-rose-600">{commitResult.errorRows}</div>
              <div className="text-[10px] font-black uppercase text-rose-600/80 tracking-wider">Dòng Lỗi</div>
            </div>
          </div>

          {commitResult.referralBonusCount > 0 && (
            <div className="flex items-center gap-4 rounded-2xl bg-purple-50 border border-purple-200 p-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Gift size={20} />
              </div>
              <div>
                <div className="text-xs font-black text-purple-800">
                  Tự động sinh {commitResult.referralBonusCount} lượt hoa hồng giới thiệu
                </div>
                <div className="text-xs text-purple-600 font-medium">
                  Tổng {commitResult.referralBonusTotal.toLocaleString("vi-VN")}đ đã cộng vào ví người giới thiệu (trích từ lợi nhuận Admin giữ).
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

