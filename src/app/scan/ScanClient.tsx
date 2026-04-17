"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { CameraHelpPanel } from "@/components/scan/CameraHelpPanel";
import { QrCameraScanner } from "@/components/scan/QrCameraScanner";
import { ScanCameraIntro } from "@/components/scan/ScanCameraIntro";
import { ScanResultModals } from "@/components/scan/ScanResultModals";
import { useTreasureScanHandler } from "@/hooks/useTreasureScanHandler";
import { hideLegacyHtml5FileScanUi } from "@/lib/hideLegacyHtml5FileScanUi";

type ScanClientProps = {
  deviceId: string;
};

export function ScanClient({ deviceId }: ScanClientProps) {
  const [phase, setPhase] = useState<"intro" | "scan">("intro");
  const [scannerKey, setScannerKey] = useState(0);
  const [scanCameraError, setScanCameraError] = useState<string | null>(null);

  const scan = useTreasureScanHandler(deviceId);

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

  const goIntro = () => {
    scan.releaseHandling();
    setPhase("intro");
  };

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
        <h1 className="text-xl font-extrabold text-amber-950 sm:text-2xl">QR 보물 찍기</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={goIntro}
          className="min-h-11 rounded-xl border-2 border-amber-300 bg-white px-4 text-sm font-bold text-amber-900"
        >
          안내 다시 보기
        </button>
        <button
          type="button"
          onClick={() => {
            setScanCameraError(null);
            setScannerKey((k) => k + 1);
          }}
          className="min-h-11 rounded-xl bg-amber-100 px-4 text-sm font-bold text-amber-950"
        >
          카메라 다시 시작
        </button>
      </div>

      {scanCameraError && (
        <p
          className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-900 ring-1 ring-red-100"
          role="alert"
        >
          {scanCameraError}
        </p>
      )}

      <ol className="grid gap-2 rounded-2xl border border-amber-100 bg-white/90 p-4 text-sm font-semibold text-slate-800 shadow-sm sm:grid-cols-3">
        <li className="flex gap-2 rounded-xl bg-amber-50/80 px-2 py-2">
          <span className="font-extrabold text-amber-700">1</span>
          <span>QR을 네모 안에</span>
        </li>
        <li className="flex gap-2 rounded-xl bg-amber-50/80 px-2 py-2">
          <span className="font-extrabold text-amber-700">2</span>
          <span>자동 인식</span>
        </li>
        <li className="flex gap-2 rounded-xl bg-amber-50/80 px-2 py-2">
          <span className="font-extrabold text-amber-700">3</span>
          <span>연속으로 찾기</span>
        </li>
      </ol>

      <p className="text-base font-medium leading-relaxed text-slate-700">
        보물 QR을 화면 중앙에 맞추면 돼요. 한 번 카메라를 허용하면 이 페이지에 있는 동안 계속
        찍을 수 있어요.
      </p>

      <QrCameraScanner
        key={scannerKey}
        active={phase === "scan"}
        onDecoded={scan.handleDecoded}
        onCameraError={(msg) => setScanCameraError(msg)}
      />

      <details className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm">
        <summary className="cursor-pointer text-base font-bold text-amber-900">
          카메라·권한 설정 도움말
        </summary>
        <div className="mt-3">
          <CameraHelpPanel />
        </div>
      </details>

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
