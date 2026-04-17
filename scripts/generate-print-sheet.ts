/**
 * 키즈카페에 붙일 QR 20개를 한 파일에 담은 인쇄용 HTML을 만듭니다.
 * (이미지 Base64 내장 → 브라우저로 열어 PDF 저장/인쇄 가능, 서버 없이도 열림)
 *
 * 선행: npm run qr:generate
 * 실행: npm run print:sheet
 */
import fs from "node:fs";
import path from "node:path";
import { TREASURE_CODES, treasurePayload } from "../src/lib/treasure-codes";

function main() {
  const qrDir = path.join(process.cwd(), "public", "qr-print");
  const outDir = path.join(process.cwd(), "public", "print");
  fs.mkdirSync(outDir, { recursive: true });

  const cells = TREASURE_CODES.map((code) => {
    const pngPath = path.join(qrDir, `${code}.png`);
    if (!fs.existsSync(pngPath)) {
      throw new Error(
        `PNG가 없습니다: ${pngPath}\n먼저 실행: npm run qr:generate`,
      );
    }
    const b64 = fs.readFileSync(pngPath).toString("base64");
    const dataUrl = `data:image/png;base64,${b64}`;
    const payload = treasurePayload(code);
    return { code, dataUrl, payload };
  });

  const cellHtml = cells
    .map(
      (c) => `
    <figure class="cell">
      <img src="${c.dataUrl}" alt="보물 QR ${c.code}" width="200" height="200" />
      <figcaption>
        <span class="code">${c.code}</span>
        <span class="payload">${c.payload}</span>
      </figcaption>
    </figure>`,
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>월드킹 보물찾기 · QR 20개 인쇄용</title>
  <style>
    :root { color-scheme: only light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;
      color: #1c1917;
      background: #fff;
    }
    header {
      padding: 10mm 12mm 6mm;
      border-bottom: 2px solid #f59e0b;
    }
    h1 { margin: 0 0 4mm; font-size: 18pt; }
    .lead { margin: 0; font-size: 10.5pt; line-height: 1.5; color: #444; }
    .toolbar {
      padding: 4mm 12mm;
      background: #fffbeb;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    button#printBtn {
      font: inherit;
      font-weight: 700;
      padding: 10px 18px;
      border-radius: 10px;
      border: none;
      background: #f59e0b;
      color: #422006;
      cursor: pointer;
    }
    button#printBtn:hover { filter: brightness(1.05); }
    .hint { font-size: 9.5pt; color: #57534e; }
    .grid {
      padding: 8mm 10mm 12mm;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6mm 5mm;
      max-width: 210mm;
      margin: 0 auto;
    }
    figure.cell {
      margin: 0;
      padding: 3mm;
      border: 1px solid #fde68a;
      border-radius: 3mm;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    figure.cell img {
      display: block;
      width: 100%;
      max-width: 36mm;
      height: auto;
      margin: 0 auto;
    }
    figcaption { margin-top: 2mm; }
    .code {
      display: block;
      font-weight: 800;
      font-size: 11pt;
      color: #92400e;
    }
    .payload {
      display: block;
      margin-top: 1mm;
      font-size: 7pt;
      word-break: break-all;
      color: #78716c;
      font-family: ui-monospace, monospace;
    }
    footer.note {
      padding: 0 12mm 10mm;
      font-size: 9pt;
      color: #57534e;
    }
    @page { size: A4; margin: 0; }
    @media print {
      .toolbar { display: none !important; }
      header { padding-top: 8mm; }
    }
  </style>
</head>
<body>
  <header>
    <h1>월드킹 보물찾기 — 매장 배치용 QR (20개)</h1>
    <p class="lead">
      각 QR을 잘라 키즈카페 곳곳에 붙이세요. 참가자 앱에서 카메라로 스캔하면 보물이 쌓입니다.
      이 파일은 이미지가 모두 들어 있어 <strong>인터넷 없이</strong> 열어도 인쇄할 수 있습니다.
    </p>
  </header>
  <div class="toolbar no-print">
    <button type="button" id="printBtn">인쇄 / PDF로 저장</button>
    <span class="hint">크롬/엣지: 인쇄 창에서 &quot;PDF로 저장&quot; 선택 가능</span>
  </div>
  <div class="grid" aria-label="보물 QR 20개">
    ${cellHtml}
  </div>
  <footer class="note">
    생성 시각(로컬): ${new Date().toLocaleString("ko-KR")} · 앱 주소는 배포 후 실제 URL로 안내하세요.
  </footer>
  <script>
    document.getElementById("printBtn")?.addEventListener("click", function () {
      window.print();
    });
  </script>
</body>
</html>`;

  const outPath = path.join(outDir, "treasure-qr-sheet.html");
  fs.writeFileSync(outPath, html, "utf8");
  console.log("Wrote", outPath);
}

main();
