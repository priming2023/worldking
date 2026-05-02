/**
 * 인쇄용 QR PNG를 두 가지 해상도로 생성합니다.
 * - public/qr-print/     : 420px, ECC M (앱·시트 미리보기)
 * - public/qr-print-hi/  : 1536px, ECC H (고화질 개별 인쇄·스티커)
 *
 * 실행: npm run qr:generate
 */
import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import { TREASURE_CODES, treasurePayload } from "../src/lib/treasure-codes";

const COLOR = { dark: "#422006", light: "#fffbeb" } as const;

async function writePng(
  filepath: string,
  code: string,
  opts: {
    width: number;
    margin: number;
    errorCorrectionLevel: "L" | "M" | "Q" | "H";
  },
) {
  await QRCode.toFile(filepath, treasurePayload(code), {
    type: "png",
    width: opts.width,
    margin: opts.margin,
    errorCorrectionLevel: opts.errorCorrectionLevel,
    color: COLOR,
  });
}

async function main() {
  const stdDir = path.join(process.cwd(), "public", "qr-print");
  const hiDir = path.join(process.cwd(), "public", "qr-print-hi");
  fs.mkdirSync(stdDir, { recursive: true });
  fs.mkdirSync(hiDir, { recursive: true });

  for (const code of TREASURE_CODES) {
    await writePng(path.join(stdDir, `${code}.png`), code, {
      width: 420,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    await writePng(path.join(hiDir, `${code}.png`), code, {
      width: 1536,
      margin: 4,
      errorCorrectionLevel: "H",
    });
  }

  const list = TREASURE_CODES.map((c) => `${c}.png`).join("\n");

  fs.writeFileSync(
    path.join(stdDir, "README.txt"),
    [
      "월드킹 보물찾기 — 인쇄용 QR (미리보기·시트용)",
      "",
      "각 파일은 스캔 시 다음 문자열을 담습니다: worldking:WK01 … WK20",
      "브라우저 미리보기: /staff/print-qr",
      "고해상도 개별 파일(1536px, ECC H): npm run qr:generate 시 ../qr-print-hi/ 에 함께 생성됩니다.",
      "",
      list,
    ].join("\n"),
    "utf8",
  );

  fs.writeFileSync(
    path.join(hiDir, "README.txt"),
    [
      "월드킹 보물찾기 — 고해상도 인쇄용 QR (WK01 … WK20)",
      "",
      "약 1536px PNG, 오류 복원 레벨 H (인쇄·스티커에 유리).",
      "생성: npm run qr:generate",
      "한 번에 받기: npm run qr:zip-hi → 프로젝트 루트에 qr-print-hi-wk01-20.zip",
      "20개 한 장에 인쇄: npm run print:sheet 후 public/print/treasure-qr-sheet.html",
      "",
      list,
    ].join("\n"),
    "utf8",
  );

  console.log(`Wrote ${TREASURE_CODES.length} PNGs → ${stdDir}`);
  console.log(`Wrote ${TREASURE_CODES.length} hi-res PNGs → ${hiDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
