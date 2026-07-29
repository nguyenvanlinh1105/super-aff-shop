"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

type Row = {
  name: string;
  keywords: string;
  rate: number;
  isDefault: boolean;
};

export function CategoryRateForm({ initialRows }: { initialRows: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { name: "", keywords: "", rate: 5, isDefault: false }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function setDefault(index: number) {
    setRows((prev) => prev.map((r, i) => ({ ...r, isDefault: i === index })));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/settings/category-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rates: rows }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Không lưu được");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-md">
      <p className="text-[12px] text-gray-500">
        Vì Shopee không có API trả trước % hoa hồng thật của từng sản phẩm, hệ thống dùng bảng này để{" "}
        <span className="font-semibold">ước tính</span> cashback hiển thị cho khách lúc dán link tạo link — không phải
        số tiền hoa hồng chính thức. Sản phẩm được xếp vào ngành hàng đầu tiên khớp từ khoá trong tiêu đề; nếu không
        khớp dòng nào, dùng ngành hàng đánh dấu "Mặc định".
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <th className="py-sm pr-sm">Ngành hàng</th>
              <th className="py-sm pr-sm">Từ khoá (phân tách bằng dấu phẩy)</th>
              <th className="py-sm pr-sm w-[110px]">Hoa hồng (%)</th>
              <th className="py-sm pr-sm w-[90px] text-center">Mặc định</th>
              <th className="py-sm w-[40px]"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-xs pr-sm">
                  <TextInput
                    value={row.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    className="h-9 text-[13px]"
                    placeholder="Thời trang nữ"
                  />
                </td>
                <td className="py-xs pr-sm">
                  <TextInput
                    value={row.keywords}
                    onChange={(e) => updateRow(i, { keywords: e.target.value })}
                    className="h-9 text-[13px]"
                    placeholder="áo,đầm,váy"
                  />
                </td>
                <td className="py-xs pr-sm">
                  <TextInput
                    type="number"
                    step="0.1"
                    min={0}
                    max={100}
                    value={row.rate}
                    onChange={(e) => updateRow(i, { rate: Number(e.target.value) })}
                    className="h-9 text-[13px]"
                  />
                </td>
                <td className="py-xs pr-sm text-center">
                  <input
                    type="radio"
                    name="isDefault"
                    checked={row.isDefault}
                    onChange={() => setDefault(i)}
                    className="h-4 w-4 accent-[#e86a33]"
                  />
                </td>
                <td className="py-xs text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex w-fit items-center gap-xs text-[12px] font-bold text-[#e86a33] hover:text-[#d65d2a]"
      >
        <Plus size={14} strokeWidth={2.5} />
        Thêm ngành hàng
      </button>

      {error && <div className="text-[13px] text-red-500">{error}</div>}
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Đang lưu..." : "Lưu bảng tỷ lệ"}
      </Button>
    </form>
  );
}
