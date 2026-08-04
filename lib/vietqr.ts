/**
 * VietQR helper utilities
 * Generates dynamic VietQR image URLs for scanning with banking apps in Vietnam
 */

const BANK_MAP: Array<{ keywords: string[]; shortName: string; bin: string }> = [
  { keywords: ["vietcombank", "vcb", "ngoại thương"], shortName: "vietcombank", bin: "970436" },
  { keywords: ["techcombank", "tcb", "kỹ thương"], shortName: "techcombank", bin: "970407" },
  { keywords: ["mbbank", "mb (ngân hàng", "quân đội", "mb "], shortName: "mbbank", bin: "970422" },
  { keywords: ["vietinbank", "vtb", "công thương"], shortName: "vietinbank", bin: "970415" },
  { keywords: ["bidv", "đầu tư và phát triển"], shortName: "bidv", bin: "970418" },
  { keywords: ["agribank", "nông nghiệp"], shortName: "agribank", bin: "970405" },
  { keywords: ["vpbank", "thịnh vượng"], shortName: "vpbank", bin: "970432" },
  { keywords: ["tpbank", "tiên phong"], shortName: "tpbank", bin: "970423" },
  { keywords: ["acb", "á châu"], shortName: "acb", bin: "970416" },
  { keywords: ["sacombank", "sài gòn thương tín"], shortName: "sacombank", bin: "970403" },
  { keywords: ["vib", "quốc tế"], shortName: "vib", bin: "970441" },
  { keywords: ["hdbank", "phát triển tp.hcm", "phát triển tphcm"], shortName: "hdbank", bin: "970437" },
  { keywords: ["ocb", "phương đông"], shortName: "ocb", bin: "970448" },
  { keywords: ["msb", "hàng hải"], shortName: "msb", bin: "970426" },
  { keywords: ["seabank", "đông nam á"], shortName: "seabank", bin: "970440" },
  { keywords: ["eximbank", "xuất nhập khẩu"], shortName: "eximbank", bin: "970431" },
  { keywords: ["lpbank", "lienvietpostbank", "bưu điện liên việt", "lộc phát"], shortName: "lpbank", bin: "970449" },
  { keywords: ["shb", "sài gòn - hà nội"], shortName: "shb", bin: "970443" },
  { keywords: ["abbank", "an bình"], shortName: "abbank", bin: "970425" },
  { keywords: ["bac a", "bắc á"], shortName: "bacabank", bin: "970409" },
  { keywords: ["baoviet", "bảo việt"], shortName: "baovietbank", bin: "970438" },
  { keywords: ["ncb", "quốc dân"], shortName: "ncb", bin: "970419" },
  { keywords: ["nam a", "nam á"], shortName: "namabank", bin: "970428" },
  { keywords: ["vieta", "việt á"], shortName: "vietabank", bin: "970427" },
  { keywords: ["pvcom", "đại chúng"], shortName: "pvcombank", bin: "970412" },
  { keywords: ["saigonbank", "sài gòn công thương"], shortName: "sgb", bin: "970400" },
  { keywords: ["kienlong", "kiên long"], shortName: "klb", bin: "970452" },
  { keywords: ["vietbank", "việt nam thương tín"], shortName: "vietbank", bin: "970433" },
  { keywords: ["pgbank"], shortName: "pgbank", bin: "970430" },
  { keywords: ["scb", "sài gòn"], shortName: "scb", bin: "970429" },
  { keywords: ["bvbank", "bản việt"], shortName: "vietcapitalbank", bin: "970454" },
  { keywords: ["gpbank", "dầu khí toàn cầu"], shortName: "gpb", bin: "970408" },
  { keywords: ["shinhan"], shortName: "shinhan", bin: "970424" },
  { keywords: ["woori"], shortName: "woori", bin: "970457" },
  { keywords: ["hsbc"], shortName: "hsbc", bin: "458761" },
  { keywords: ["standard chartered"], shortName: "scvn", bin: "970410" },
  { keywords: ["cake"], shortName: "cake", bin: "546034" },
  { keywords: ["ubank"], shortName: "ubank", bin: "546035" },
  { keywords: ["liobank"], shortName: "liobank", bin: "970448" },
  { keywords: ["timo"], shortName: "timo", bin: "963388" },
];

export function getBankShortName(rawBankName: string): string | null {
  if (!rawBankName) return null;
  const name = rawBankName.toLowerCase();
  for (const item of BANK_MAP) {
    if (item.keywords.some((kw) => name.includes(kw))) {
      return item.shortName;
    }
  }
  // Fallback: strip accents & special chars if not matched directly
  return name.replace(/[^a-z0-9]/g, "");
}


export function isValidAccountNumber(accountNumber: string): boolean {
  if (!accountNumber) return false;
  const clean = accountNumber.replace(/[\s-]/g, "");
  return /^\d{6,20}$/.test(clean);
}

export function generateVietQrUrl(params: {
  bankName: string;
  accountNumber: string;
  accountName?: string | null;
  amount: number;
  memo?: string | null;
  template?: "compact2" | "compact" | "qr_only" | "print";
}): string | null {
  const { bankName, accountNumber, accountName, amount, memo, template = "compact2" } = params;
  if (!bankName || !accountNumber) return null;

  const shortName = getBankShortName(bankName);
  if (!shortName) return null;

  const cleanAccNo = accountNumber.replace(/\s+/g, "");
  const query = new URLSearchParams();
  if (amount > 0) query.append("amount", Math.round(amount).toString());
  if (memo) query.append("addInfo", memo);
  if (accountName) query.append("accountName", accountName);

  return `https://img.vietqr.io/image/${shortName}-${cleanAccNo}-${template}.png?${query.toString()}`;
}
