import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { TREASURE_CODES, treasurePayload } from "@/lib/treasure-codes";

export const metadata: Metadata = {
  title: "운영 · QR 인쇄",
  description: "키즈카페 직원용 보물 QR 미리보기 및 인쇄",
  robots: { index: false, follow: false },
};

export default function StaffPrintQrPage() {
  return (
    <div className="print-root min-h-full bg-amber-50 px-4 py-8 text-slate-900">
      <header className="no-print mx-auto mb-8 max-w-5xl rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-amber-100">
        <p className="text-sm font-semibold text-amber-800">직원 · 운영 화면</p>
        <h1 className="mt-1 text-2xl font-extrabold text-amber-950">보물 QR 인쇄용</h1>
        <p className="mt-2 text-base leading-relaxed text-slate-700">
          아래 QR을 인쇄해 매장에 붙이세요. 브라우저 메뉴에서 <strong>인쇄</strong>를
          선택하면 이 페이지만 깔끔하게 출력됩니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-2xl bg-amber-500 px-5 text-base font-bold text-amber-950"
          >
            ← 참가 앱으로
          </Link>
          <a
            href="/print/treasure-qr-sheet.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center rounded-2xl border-2 border-amber-600 bg-white px-5 text-base font-extrabold text-amber-900"
          >
            한 장 인쇄 파일 열기
          </a>
          <span className="inline-flex min-h-12 items-center rounded-2xl border border-amber-200 bg-amber-50 px-4 text-sm text-slate-600">
            PNG 원본: <code className="ml-1 font-mono text-xs">public/qr-print/</code>
          </span>
        </div>
      </header>

      <section
        aria-label="보물 QR 20개"
        className="mx-auto grid max-w-5xl grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-3 print:gap-4"
      >
        {TREASURE_CODES.map((code) => (
          <figure
            key={code}
            className="flex w-full flex-col items-center rounded-3xl bg-white p-4 text-center shadow-md ring-1 ring-amber-100 print:break-inside-avoid"
          >
            <Image
              src={`/qr-print/${code}.png`}
              alt={`보물 QR ${code}`}
              width={200}
              height={200}
              className="h-auto w-full max-w-[200px] rounded-lg"
              priority={code === "WK01"}
            />
            <figcaption className="mt-3 text-lg font-extrabold text-amber-950">
              {code}
            </figcaption>
            <p className="mt-1 max-w-[200px] break-all font-mono text-[11px] leading-snug text-slate-500">
              {treasurePayload(code)}
            </p>
          </figure>
        ))}
      </section>
    </div>
  );
}
