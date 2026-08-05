"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function ChuseokEntryQrPage() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [entryUrl, setEntryUrl] = useState("");

  useEffect(() => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/chuseok`
        : "https://worldking-t86b.vercel.app/chuseok";
    setEntryUrl(url);
    void QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: { dark: "#8B2942", light: "#FFF8F0" },
    }).then(setDataUrl);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-10 print:py-4">
      <div className="no-print flex w-full justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="chuseok-btn-primary rounded-xl px-4 py-2 font-bold"
        >
          인쇄
        </button>
      </div>

      <div className="chuseok-card w-full rounded-3xl p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-chuseok-gold">
          진입 QR
        </p>
        <h1 className="chuseok-title mt-2 text-2xl font-extrabold text-chuseok-burgundy">
          추석 QR 보물미션
        </h1>
        <p className="mt-2 text-sm font-semibold text-chuseok-burgundy/80">
          이 QR을 스캔하면 게임이 시작돼요
        </p>

        {dataUrl ? (
          <img
            src={dataUrl}
            alt="추석 QR 보물미션 진입 QR"
            className="mx-auto mt-6 w-64 max-w-full rounded-2xl border-4 border-chuseok-gold/40"
          />
        ) : (
          <div className="mx-auto mt-6 h-64 w-64 animate-pulse rounded-2xl bg-chuseok-burgundy/10" />
        )}

        <p className="mt-4 break-all text-xs font-mono text-chuseok-burgundy/60">
          {entryUrl}
        </p>
      </div>
    </main>
  );
}
