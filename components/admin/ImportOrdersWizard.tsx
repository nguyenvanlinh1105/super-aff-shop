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
    <div className="flex flex-col gap-lg">
      <Card variant="default" className="border border-gray-100">
        <form onSubmit={runPreview} className="flex flex-col gap-lg">
          <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
            <Select value={platformId} onChange={(e) => setPlatformId(e.target.value)}>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
            <TextInput
              placeholder="Nguồn file (VD: Shopee Affiliate Dashboard)"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
            />
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-sm rounded-md border border-dashed border-gray-100 bg-gray-50/40 px-lg py-2xl text-center transition-colors duration-150 hover:border-gray-100 hover:bg-gray-50">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            {file ? (
              <>
                <FileCheck2 size={22} strokeWidth={1.75} className="text-positive" />
                <span className="text-[14px] font-medium text-gray-900">{file.name}</span>
                <span className="text-[12px] text-gray-500">Bấm để chọn file khác</span>
              </>
            ) : (
              <>
                <Upload size={22} strokeWidth={1.75} className="text-gray-500" />
                <span className="text-[14px] font-medium text-gray-900">Chọn file CSV để tải lên</span>
                <span className="text-[12px] text-gray-500">Kéo thả hoặc bấm để duyệt file</span>
              </>
            )}
          </label>

          {error && <div className="text-[14px] text-red-500">{error}</div>}
          <Button type="submit" disabled={loading || !file} className="w-fit">
            {loading ? "Đang đọc file..." : "Xem trước dữ liệu"}
          </Button>
        </form>
      </Card>

      {preview && (
        <Card variant="soft">
          <h2 className="display-xs mb-lg">Kết quả preview</h2>
          <div className="mb-lg grid grid-cols-1 sm:grid-cols-3 gap-lg text-center">
            <div>
              <div className="text-[24px] font-bold tabular-nums">{preview.totalRows}</div>
              <div className="text-[12px] text-gray-500">Tổng số dòng</div>
            </div>
            <div>
              <div className="text-[24px] font-bold tabular-nums text-positive">{preview.matchedRows}</div>
              <div className="text-[12px] text-gray-500">Map được tracking</div>
            </div>
            <div>
              <div className="text-[24px] font-bold tabular-nums text-red-500">{preview.unmappedRows}</div>
              <div className="text-[12px] text-gray-500">Không map được</div>
            </div>
          </div>

          {preview.preview.length > 0 && (
            <div className="mb-lg">
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
                      <Td>{row.orderExternalId || "—"}</Td>
                      <Td className="font-mono text-[12px]">{row.trackingCode || "—"}</Td>
                      <Td numeric>{row.orderAmount?.toLocaleString("vi-VN") ?? "—"}</Td>
                      <Td numeric>{row.commissionAmount?.toLocaleString("vi-VN") ?? "—"}</Td>
                      <Td>{row.orderStatus || "—"}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
              {preview.preview.length > 10 && (
                <p className="mt-sm text-[12px] text-gray-500">
                  Hiển thị 10/{preview.preview.length} dòng đầu tiên trong bản xem trước.
                </p>
              )}
            </div>
          )}

          <Button onClick={runCommit} disabled={loading}>
            {loading ? "Đang import..." : "Xác nhận import"}
          </Button>
        </Card>
      )}

      {commitResult && (
        <Card variant="soft">
          <h2 className="display-xs mb-lg">Import hoàn tất</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-lg text-center">
            <div>
              <div className="text-[24px] font-bold tabular-nums text-positive">{commitResult.successRows}</div>
              <div className="text-[12px] text-gray-500">Thành công</div>
            </div>
            <div>
              <div className="text-[24px] font-bold tabular-nums">{commitResult.duplicateRows}</div>
              <div className="text-[12px] text-gray-500">Trùng</div>
            </div>
            <div>
              <div className="text-[24px] font-bold tabular-nums text-red-500">{commitResult.unmappedRows}</div>
              <div className="text-[12px] text-gray-500">Chưa map</div>
            </div>
            <div>
              <div className="text-[24px] font-bold tabular-nums text-red-500">{commitResult.errorRows}</div>
              <div className="text-[12px] text-gray-500">Lỗi</div>
            </div>
          </div>

          {commitResult.referralBonusCount > 0 && (
            <div className="mt-lg flex items-center gap-md rounded-2xl bg-purple-50 border border-purple-200 px-lg py-md">
              <Gift size={22} className="text-purple-600 shrink-0" />
              <div>
                <div className="text-[14px] font-bold text-purple-700">
                  Đã tự động tạo {commitResult.referralBonusCount} hoa hồng giới thiệu
                </div>
                <div className="text-[13px] text-purple-600">
                  Tổng {commitResult.referralBonusTotal.toLocaleString("vi-VN")}đ đã cộng vào ví người giới thiệu — trích từ phần hệ thống giữ, xem chi tiết ở tab "🎁 Giới thiệu" trong danh sách đơn hàng.
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
