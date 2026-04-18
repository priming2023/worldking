"use client";

import Link from "next/link";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  QrCameraScanner,
  type QrCameraFlipMeta,
  type QrCameraScannerHandle,
} from "@/components/scan/QrCameraScanner";
import { ScanCameraIntro } from "@/components/scan/ScanCameraIntro";
import { ScanResultModals } from "@/components/scan/ScanResultModals";
import { useTreasureScanHandler } from "@/hooks/useTreasureScanHandler";
import { hideLegacyHtml5FileScanUi } from "@/lib/hideLegacyHtml5FileScanUi";

type ScanClientProps = {
  deviceId: string;
};

const defaultFlipMeta: QrCameraFlipMeta = {
  flipDisabled: true,
  flipLabel: "카메라 바꾸기 (뒤·앞)",
};

export function ScanClient({ deviceId }: ScanClientProps) {
  const [phase, setPhase] = useState<"intro" | "scan">("intro");
  const [scannerKey, setScannerKey] = useState(0);
  const [scanCameraError, setScanCameraError] = useState<string | null>(null);
  const [flipMeta, setFlipMeta] = useState<QrCameraFlipMeta>(defaultFlipMeta);
  const scannerRef = useRef<QrCameraScannerHandle>(null);

  const scan = useTreasureScanHandler(deviceId);

  const handleFlipMeta = useCallback((meta: QrCameraFlipMeta) => {
    setFlipMeta(meta);
  }, []);

  useLayoutEffect(() => {
    if (phase !== "scan") return;
    hideLegacyHtml5FileScanUi();
    const id = window.requestAnimationFrame(() => hideLegacyHtml5FileScanUi());
    const t = window.setTimeout(() => hideLegacyHtml5FileScanUi(), 400);
    return () => {
      window.cancelAnimationFrame(id);
      window.clearTimeout(t);
    };
  }, [phase]);

  if (phase === "intro") {
    return (
      <ScanCameraIntro
        onStart={() => {
          setScanCameraError(null);
          setPhase("scan");
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-2xl border-2 border-amber-200 bg-white px-4 text-base font-extrabold text-amber-900 shadow-sm"
        >
          ← 홈
        </Link>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-extrabold text-amber-950 sm:text-2xl">QR 보물찾기</h1>
          <button
            type="button"
            onClick={() => {
              setScanCameraError(null);
              setScannerKey((k) => k + 1);
            }}
            className="shrink-0 rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950 hover:bg-amber-200"
          >
            카메라 다시 시작
          </button>
        </div>
      </div>

      {scanCameraError && (
        <p
          className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-900 ring-1 ring-red-100"
          role="alert"
        >
          {scanCameraError}
        </p>
      )}

      <ol className="grid gap-2 rounded-2xl border border-amber-100 bg-white/90 p-4 text-sm font-semibold text-slate-800 shadow-sm sm:grid-cols-2">
        <li className="flex gap-2 rounded-xl bg-amber-50/80 px-2 py-2">
          <span className="font-extrabold text-amber-700">1</span>
          <span>QR을 네모 안에</span>
        </li>
        <li className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50/80 px-2 py-2">
          <span className="flex items-center gap-2">
            <span className="font-extrabold text-amber-700">2</span>
            <span>자동 인식</span>
          </span>
          <button
            type="button"
            onClick={() => scannerRef.current?.flipCamera()}
            disabled={flipMeta.flipDisabled}
            className="shrink-0 rounded-lg border-2 border-amber-300 bg-white px-2.5 py-1.5 text-xs font-bold text-amber-900 disabled:opacity-50"
          >
            {flipMeta.flipLabel}
          </button>
        </li>
      </ol>

      <QrCameraScanner
        ref={scannerRef}
        key={scannerKey}
        active={phase === "scan"}
        onDecoded={scan.handleDecoded}
        onCameraError={(msg) => setScanCameraError(msg)}
        onFlipMeta={handleFlipMeta}
      />

      <ScanResultModals
        dupOpen={scan.dupOpen}
        onDupClose={scan.closeDup}
        errOpen={scan.errOpen}
        errText={scan.errText}
        onErrClose={scan.closeErr}
        successOpen={scan.successOpen}
        successCount={scan.successCount}
        onSuccessContinue={scan.closeSuccess}
        onSuccessClose={scan.closeSuccess}
      />
    </div>
  );
}
