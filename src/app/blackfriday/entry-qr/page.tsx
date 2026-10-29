"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

const ENTRY_PATH = "/blackfriday";

export default function BlackfridayEntryQrPage() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [entryUrl, setEntryUrl] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}${ENTRY_PATH}`;
    setEntryUrl(url);
    void QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#E8C170", light: "#000000" },
    }).then(setDataUrl);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-10 print:py-4">
      <div className="flex w-full justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-[#E8C170] px-4 py-2 font-bold text-black"
        >
          인쇄
        </button>
      </div>

      <div className="w-full rounded-3xl border border-[#E8C170]/40 p-8 text-center">
        <p className="text-xs font-semibold tracking-[0.28em] text-[#E8C170]">BLACK FRIDAY</p>
        <h1 className="mt-2 text-2xl font-bold">월드킹 블랙프라이데이 보물찾기</h1>
        <p className="mt-2 text-sm text-white/80">이 QR을 스캔하면 보물찾기가 시작돼요</p>

        {dataUrl ? (
          <img
            src={dataUrl}
            alt="블랙프라이데이 보물찾기 입장 QR"
            className="mx-auto mt-6 w-64 max-w-full rounded-2xl border border-[#E8C170]/50"
          />
        ) : (
          <div className="mx-auto mt-6 h-64 w-64 animate-pulse rounded-2xl bg-white/10" />
        )}

        <p className="mt-4 break-all font-mono text-xs text-[#E8C170]">{entryUrl}</p>
      </div>
    </main>
  );
}
