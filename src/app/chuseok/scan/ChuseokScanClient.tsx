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
import { OrderWarningModal } from "@/components/chuseok/OrderWarningModal";
import { ChuseokProgressBar } from "@/components/chuseok/ChuseokProgressBar";
import { useChuseokScanHandler } from "@/hooks/chuseok/useChuseokScanHandler";
import { useChuseokMe } from "@/hooks/chuseok/useChuseokMe";
import { hideLegacyHtml5FileScanUi } from "@/lib/hideLegacyHtml5FileScanUi";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";

type ChuseokScanClientProps = {
  deviceId: string;
};

const defaultFlipMeta: QrCameraFlipMeta = {
  flipDisabled: true,
  flipLabel: "카메라 바꾸기 (뒤·앞)",
};

export function ChuseokScanClient({ deviceId }: ChuseokScanClientProps) {
  const [phase, setPhase] = useState<"intro" | "scan">("intro");
  const [scannerKey, setScannerKey] = useState(0);
  const [scanCameraError, setScanCameraError] = useState<string | null>(null);
  const [flipMeta, setFlipMeta] = useState<QrCameraFlipMeta>(defaultFlipMeta);
  const scannerRef = useRef<QrCameraScannerHandle>(null);

  const { data, refresh } = useChuseokMe(deviceId);
  const scan = useChuseokScanHandler(deviceId, refresh);

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
      <div className="chuseok-theme">
        <ScanCameraIntro
          onStart={() => {
            setScanCameraError(null);
            setPhase("scan");
          }}
        />
      </div>
    );
  }

  const count = data?.foundCount ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/chuseok"
          className="inline-flex min-h-12 items-center rounded-2xl border-2 border-chuseok-gold/40 bg-white px-4 text-base font-extrabold text-chuseok-burgundy shadow-sm"
        >
          ← 홈
        </Link>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
          <h1 className="chuseok-title text-xl font-extrabold text-chuseok-burgundy sm:text-2xl">
            QR 보물 스캔
          </h1>
          <button
            type="button"
            onClick={() => {
              setScanCameraError(null);
              setScannerKey((k) => k + 1);
            }}
            className="shrink-0 rounded-xl bg-chuseok-burgundy/10 px-3 py-2 text-sm font-bold text-chuseok-burgundy"
          >
            카메라 다시 시작
          </button>
        </div>
      </div>

      <ChuseokProgressBar found={count} total={MISSION_TOTAL} />

      {data?.phase === "scan" && data.locationHint && (
        <p className="chuseok-card-highlight rounded-2xl px-4 py-3 text-center text-sm font-bold text-chuseok-burgundy">
          찾을 위치: {data.locationHint}
        </p>
      )}

      {scanCameraError && (
        <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-900" role="alert">
          {scanCameraError}
        </p>
      )}

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

      <OrderWarningModal
        open={scan.orderWarnOpen}
        message={scan.orderWarnText}
        onConfirm={scan.confirmOrderWarn}
        onCancel={scan.cancelOrderWarn}
      />
    </div>
  );
}
