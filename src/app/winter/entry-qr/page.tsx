"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

const PROD_ENTRY_URL = "https://worldking-t86b.vercel.app/winter";

export default function WinterEntryQrPage() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [entryUrl, setEntryUrl] = useState(PROD_ENTRY_URL);

  useEffect(() => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/winter`
        : PROD_ENTRY_URL;
    setEntryUrl(url);
    void QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#1b3a5c", light: "#f7fbff" },
    }).then(setDataUrl);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-10 print:py-4">
      <div className="flex w-full justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="winter-btn-primary rounded-xl px-4 py-2"
        >
          인쇄
        </button>
      </div>

      <div className="winter-card w-full rounded-3xl p-8 text-center">
        <p className="text-xs font-semibold tracking-[0.28em] text-[var(--winter-frost)]">2027 NEW YEAR</p>
        <h1 className="winter-title mt-2 text-2xl font-bold">월드킹 새해 보물찾기</h1>
        <p className="mt-2 text-sm text-white/80">이 QR을 스캔하면 타임어택이 시작돼요</p>

        {dataUrl ? (
          <img
            src={dataUrl}
            alt="새해 보물찾기 입장 QR"
            className="mx-auto mt-6 w-64 max-w-full rounded-2xl border border-white/40"
          />
        ) : (
          <div className="mx-auto mt-6 h-64 w-64 animate-pulse rounded-2xl bg-white/10" />
        )}

        <p className="mt-4 break-all font-mono text-xs text-[var(--winter-gold)]">{entryUrl}</p>
      </div>
    </main>
  );
}
