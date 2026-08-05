"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  QrCameraScanner,
  type QrCameraFlipMeta,
  type QrCameraScannerHandle,
} from "@/components/scan/QrCameraScanner";
import { OrderWarningModal } from "@/components/chuseok/OrderWarningModal";
import { ChuseokProgressBar } from "@/components/chuseok/ChuseokProgressBar";
import { ChuseokScanResultModals } from "@/components/chuseok/ChuseokScanResultModals";
import { useChuseokScanHandler } from "@/hooks/chuseok/useChuseokScanHandler";
import { useChuseokMe } from "@/hooks/chuseok/useChuseokMe";
import { hideLegacyHtml5FileScanUi } from "@/lib/hideLegacyHtml5FileScanUi";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";

type Props = { deviceId: string };

const defaultFlipMeta: QrCameraFlipMeta = {
  flipDisabled: true,
  flipLabel: "카메라 바꾸기 (뒤·앞)",
};

function ChuseokScanInner({ deviceId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoStart = searchParams.get("auto") === "1";

  const [scannerKey, setScannerKey] = useState(0);
  const [scanCameraError, setScanCameraError] = useState<string | null>(null);
  const [flipMeta, setFlipMeta] = useState<QrCameraFlipMeta>(defaultFlipMeta);
  const scannerRef = useRef<QrCameraScannerHandle>(null);

  const { data, refresh } = useChuseokMe(deviceId);
  const scan = useChuseokScanHandler(deviceId, refresh);

  useLayoutEffect(() => {
    hideLegacyHtml5FileScanUi();
    const id = window.requestAnimationFrame(() => hideLegacyHtml5FileScanUi());
    const t = window.setTimeout(() => hideLegacyHtml5FileScanUi(), 400);
    return () => {
      window.cancelAnimationFrame(id);
      window.clearTimeout(t);
    };
  }, [scannerKey]);

  const goNextQuiz = useCallback(() => {
    scan.closeSuccess();
    router.push("/chuseok");
  }, [router, scan]);

  const count = data?.foundCount ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/chuseok"
          className="inline-flex min-h-11 items-center rounded-2xl border-2 border-chuseok-gold/40 bg-white px-4 text-base font-extrabold text-chuseok-burgundy shadow-sm"
        >
          ← 미션 홈
        </Link>
        <h1 className="chuseok-title flex-1 text-xl font-extrabold text-chuseok-burgundy">
          미션 QR 스캔
        </h1>
        <button
          type="button"
          onClick={() => {
            setScanCameraError(null);
            setScannerKey((k) => k + 1);
          }}
          className="shrink-0 rounded-xl bg-chuseok-burgundy/10 px-3 py-2 text-sm font-bold text-chuseok-burgundy"
        >
          다시 시작
        </button>
      </div>

      <ChuseokProgressBar found={count} total={MISSION_TOTAL} />

      {data?.locationHint && (
        <div className="chuseok-card-highlight rounded-2xl px-4 py-3 text-center">
          <p className="text-xs font-bold text-chuseok-gold">
            {autoStart ? "정답! 보물 위치" : "찾을 위치"}
          </p>
          <p className="mt-1 text-lg font-extrabold text-chuseok-burgundy">
            {data.locationHint}
          </p>
        </div>
      )}

      <p className="text-center text-sm font-semibold text-chuseok-burgundy/75">
        숨겨진 미션 QR을 네모 안에 맞춰 주세요
      </p>

      {scanCameraError && (
        <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-900" role="alert">
          {scanCameraError}
        </p>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => scannerRef.current?.flipCamera()}
          disabled={flipMeta.flipDisabled}
          className="absolute right-2 top-2 z-10 rounded-lg border border-chuseok-gold/40 bg-white/95 px-2 py-1 text-xs font-bold text-chuseok-burgundy disabled:opacity-50"
        >
          {flipMeta.flipLabel}
        </button>
        <QrCameraScanner
          ref={scannerRef}
          key={scannerKey}
          active
          onDecoded={scan.handleDecoded}
          onCameraError={(msg) => setScanCameraError(msg)}
          onFlipMeta={setFlipMeta}
        />
      </div>

      <ChuseokScanResultModals
        dupOpen={scan.dupOpen}
        onDupClose={scan.closeDup}
        errOpen={scan.errOpen}
        errText={scan.errText}
        onErrClose={scan.closeErr}
        successOpen={scan.successOpen}
        successCount={scan.successCount}
        onNextQuiz={goNextQuiz}
        canClaim={data?.canClaim}
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

export function ChuseokScanClient({ deviceId }: Props) {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-center font-semibold text-chuseok-burgundy">카메라 준비 중…</p>
      }
    >
      <ChuseokScanInner deviceId={deviceId} />
    </Suspense>
  );
}
