/**
 * public/qr-print-hi/ 를 프로젝트 루트의 zip 한 파일로 묶습니다.
 * (맥/리눅스: 시스템 `zip` 명령 필요. 없으면 Finder에서 폴더 우클릭 → 압축)
 *
 * 선행: npm run qr:generate
 * 실행: npm run qr:zip-hi
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function main() {
  const root = process.cwd();
  const hiRel = path.join("public", "qr-print-hi");
  const hiAbs = path.join(root, hiRel);
  if (!fs.existsSync(hiAbs)) {
    console.error("폴더가 없습니다:", hiAbs, "\n먼저 실행: npm run qr:generate");
    process.exit(1);
  }
  const outName = "qr-print-hi-wk01-20.zip";
  const outAbs = path.join(root, outName);
  if (fs.existsSync(outAbs)) {
    fs.unlinkSync(outAbs);
  }
  try {
    execFileSync("zip", ["-r", "-q", outAbs, "qr-print-hi"], {
      cwd: path.join(root, "public"),
      stdio: "inherit",
    });
  } catch {
    console.error(
      "`zip` 명령을 실행하지 못했습니다. 터미널에 zip이 있는지 확인하거나,\n" +
        `Finder에서 폴더를 열고 압축하세요: ${hiAbs}`,
    );
    process.exit(1);
  }
  console.log("생성됨:", outAbs);
}

main();
