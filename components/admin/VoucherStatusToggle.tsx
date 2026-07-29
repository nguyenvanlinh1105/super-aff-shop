"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

export function VoucherStatusToggle({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function toggle() {
    await fetch(`/api/vouchers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "active" ? "inactive" : "active" }),
    });
    router.refresh();
  }

  return (
    <Button
      variant={status === "active" ? "tertiary" : "secondary"}
      size="sm"
      onClick={toggle}
    >
      {status === "active" ? (
        <>
          <EyeOff size={13} strokeWidth={1.75} />
          Tắt
        </>
      ) : (
        <>
          <Eye size={13} strokeWidth={1.75} />
          Bật
        </>
      )}
    </Button>
  );
}
