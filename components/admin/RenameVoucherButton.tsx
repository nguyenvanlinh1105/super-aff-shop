"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Pencil } from "lucide-react";

export function RenameVoucherButton({ id, currentTitle }: { id: string; currentTitle: string }) {
  const router = useRouter();

  async function rename() {
    const next = window.prompt("Đổi tên chương trình ưu đãi:", currentTitle);
    if (!next || next.trim() === "" || next === currentTitle) return;

    await fetch(`/api/vouchers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: next.trim() }),
    });
    router.refresh();
  }

  return (
    <Button variant="tertiary" size="sm" onClick={rename}>
      <Pencil size={13} strokeWidth={1.75} />
      Đổi tên
    </Button>
  );
}
