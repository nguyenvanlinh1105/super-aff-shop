import { prisma } from "./prisma";

export type BankFlowStep = "await_bank_name" | "await_bank_account_number" | "await_bank_account_name";

export type BankFlowData = {
  bankName?: string;
  bankAccountNumber?: string;
};

export function isValidFlowStep(step: string | null | undefined): step is BankFlowStep {
  return step === "await_bank_name" || step === "await_bank_account_number" || step === "await_bank_account_name";
}

export function parseFlowData(raw: string | null | undefined): BankFlowData {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function startBankInfoFlow(customerId: string): Promise<void> {
  await prisma.customer.update({
    where: { id: customerId },
    data: { telegramFlowStep: "await_bank_name", telegramFlowData: "{}" },
  });
}

export async function cancelFlow(customerId: string): Promise<void> {
  await prisma.customer.update({
    where: { id: customerId },
    data: { telegramFlowStep: null, telegramFlowData: null },
  });
}

type FlowReplyResult =
  | { done: false; next: BankFlowStep; data: BankFlowData }
  | { done: true; bankName: string; bankAccountNumber: string; bankAccountName: string };

// Xử lý 1 tin nhắn trả lời trong hội thoại nhập ngân hàng qua Telegram —
// hỏi lần lượt tên ngân hàng -> số tài khoản -> tên chủ TK, rồi lưu thẳng
// vào đúng hồ sơ khách (đồng bộ với web vì dùng chung 1 bảng Customer).
export async function handleBankInfoFlowReply(
  customerId: string,
  step: BankFlowStep,
  data: BankFlowData,
  text: string
): Promise<FlowReplyResult> {
  const value = text.trim();

  if (step === "await_bank_name") {
    const nextData: BankFlowData = { ...data, bankName: value };
    await prisma.customer.update({
      where: { id: customerId },
      data: { telegramFlowStep: "await_bank_account_number", telegramFlowData: JSON.stringify(nextData) },
    });
    return { done: false, next: "await_bank_account_number", data: nextData };
  }

  if (step === "await_bank_account_number") {
    const nextData: BankFlowData = { ...data, bankAccountNumber: value };
    await prisma.customer.update({
      where: { id: customerId },
      data: { telegramFlowStep: "await_bank_account_name", telegramFlowData: JSON.stringify(nextData) },
    });
    return { done: false, next: "await_bank_account_name", data: nextData };
  }

  // step === "await_bank_account_name" — đủ 3 thông tin, lưu thẳng vào hồ sơ khách
  const bankName = data.bankName ?? "";
  const bankAccountNumber = data.bankAccountNumber ?? "";
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      bankName,
      bankAccountNumber,
      bankAccountName: value,
      telegramFlowStep: null,
      telegramFlowData: null,
    },
  });
  return { done: true, bankName, bankAccountNumber, bankAccountName: value };
}
