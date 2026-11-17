import { mkdirSync } from "fs";
import QRCode from "qrcode";

const OUT = "public/print/winter-entry-qr.png";
const URL = "https://worldking-t86b.vercel.app/winter";

async function main() {
  mkdirSync("public/print", { recursive: true });
  await QRCode.toFile(OUT, URL, {
    width: 1024,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#1b3a5c", light: "#f7fbff" },
  });
  console.log(`wrote ${OUT} -> ${URL}`);
}

void main();
