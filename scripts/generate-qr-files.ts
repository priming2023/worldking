/**
 * 인쇄용 QR PNG 20개를 public/qr-print/ 에 생성합니다.
 * 실행: npm run qr:generate
 */
import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import { TREASURE_CODES, treasurePayload } from "../src/lib/treasure-codes";

async function main() {
  const outDir = path.join(process.cwd(), "public", "qr-print");
  fs.mkdirSync(outDir, { recursive: true });

  for (const code of TREASURE_CODES) {
    const text = treasurePayload(code);
    const filepath = path.join(outDir, `${code}.png`);
    await QRCode.toFile(filepath, text, {
      type: "png",
      width: 420,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#422006", light: "#fffbeb" },
    });
  }

  const lines = [
    "월드킹 보물찾기 — 인쇄용 QR",
    "",
    "각 파일은 스캔 시 다음 문자열을 담습니다: worldking:WK01 … WK20",
    "브라우저 미리보기: /staff/print-qr",
    "",
    ...TREASURE_CODES.map((c) => `${c}.png`),
  ];
  fs.writeFileSync(path.join(outDir, "README.txt"), lines.join("\n"), "utf8");

  console.log(`Wrote ${TREASURE_CODES.length} PNGs to ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
