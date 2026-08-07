"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  QrCameraScanner,
  type QrCameraFlipMeta,
  type QrCameraScannerHandle,
} from "@/components/scan/QrCameraScanner";
import { OrderWarningModal } from "@/components/halloween/OrderWarningModal";
import { HalloweenProgressBar } from "@/components/halloween/HalloweenProgressBar";
import { HalloweenScanQuizPanel } from "@/components/halloween/HalloweenScanQuizPanel";
import { HalloweenScanResultModals } from "@/components/halloween/HalloweenScanResultModals";
import { useHalloweenScanHandler } from "@/hooks/halloween/useHalloweenScanHandler";
import { useHalloweenMe } from "@/hooks/halloween/useHalloweenMe";
import { hideLegacyHtml5FileScanUi } from "@/lib/hideLegacyHtml5FileScanUi";
import { MISSION_TOTAL } from "@/lib/halloween/codes";

type Props = { deviceId: string };

const defaultFlipMeta: QrCameraFlipMeta = {
  flipDisabled: true,
  flipLabel: "카메라 바꾸기 (뒤·앞)",
};

function HalloweenScanInner({ deviceId }: Props) {
  const searchParams = useSearchParams();
  const autoStart = searchParams.get("auto") === "1";

  const [scannerKey, setScannerKey] = useState(0);
  const [scanCameraError, setScanCameraError] = useState<string | null>(null);
  const [flipMeta, setFlipMeta] = useState<QrCameraFlipMeta>(defaultFlipMeta);
  const [quizErr, setQuizErr] = useState<string | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [correctFlash, setCorrectFlash] = useState<string | null>(null);
  const scannerRef = useRef<QrCameraScannerHandle>(null);

  const { data, refresh } = useHalloweenMe(deviceId);
  const scan = useHalloweenScanHandler(deviceId, refresh);

  // 순서 모드 퀴즈 중에만 카메라 UI 가림 (스트림은 유지). 무순서는 퀴즈 없음.
  const inQuizPhase =
    Boolean(data?.orderedMode) &&
    data?.phase === "quiz" &&
    Boolean(data.currentQuiz);
  const showScanUi = !inQuizPhase && !correctFlash;

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
    setCorrectFlash(null);
    void refresh();
    // 홈으로 나가지 않음 → 카메라 유지, 같은 페이지에서 다음 퀴즈
  }, [scan, refresh]);

  const handleDecoded = useCallback(
    (text: string) => {
      if (inQuizPhase || correctFlash || scan.successOpen || scan.dupOpen) return;
      void scan.handleDecoded(text);
    },
    [inQuizPhase, correctFlash, scan],
  );

  const handleQuizSubmit = async (answer: string) => {
    setQuizSubmitting(true);
    setQuizErr(null);
    try {
      const res = await fetch("/api/halloween/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, answer }),
      });
      const json = (await res.json()) as {
        status?: string;
        message?: string;
        locationHint?: string;
      };
      if (json.status === "correct") {
        setCorrectFlash(json.message ?? "정답! 보물을 찾아 주세요.");
        await refresh();
        window.setTimeout(() => setCorrectFlash(null), 800);
      } else {
        setQuizErr(json.message ?? "틀렸어요. 다시 생각해 보세요!");
      }
    } catch {
      setQuizErr("네트워크 오류");
    } finally {
      setQuizSubmitting(false);
    }
  };

  const count = data?.foundCount ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/halloween"
          className="halloween-btn-secondary inline-flex min-h-11 items-center rounded-2xl px-4 text-base font-extrabold shadow-sm"
        >
          ← 미션 홈
        </Link>
        <h1 className="halloween-title flex-1 text-xl font-extrabold text-halloween-burgundy">
          미션 QR 스캔
        </h1>
        <button
          type="button"
          onClick={() => {
            setScanCameraError(null);
            setScannerKey((k) => k + 1);
          }}
          className="shrink-0 rounded-xl bg-halloween-burgundy/10 px-3 py-2 text-sm font-bold text-halloween-burgundy"
        >
          다시 시작
        </button>
      </div>

      <HalloweenProgressBar found={count} total={MISSION_TOTAL} />

      {/* 다음 퀴즈 — 같은 페이지에서 (카메라 스트림 유지) */}
      {inQuizPhase && data.currentQuiz && !scan.successOpen && (
        <HalloweenScanQuizPanel
          stepOrder={data.currentQuiz.stepOrder}
          question={data.currentQuiz.question}
          answerDisplay={data.currentQuiz.answerDisplay}
          onSubmit={handleQuizSubmit}
          submitting={quizSubmitting}
          error={quizErr}
        />
      )}

      {correctFlash && (
        <section className="halloween-card-highlight rounded-3xl p-5 text-center" role="status">
          <p className="text-sm font-bold text-halloween-gold">정답이에요!</p>
          <p className="mt-2 text-lg font-extrabold text-halloween-burgundy">{correctFlash}</p>
        </section>
      )}

      {showScanUi && data?.locationHint && (
        <div className="halloween-card-highlight rounded-2xl px-4 py-3 text-center">
          <p className="text-xs font-bold text-halloween-gold">
            {autoStart ? "정답! 보물 위치" : "찾을 위치"}
          </p>
          <p className="mt-1 text-lg font-extrabold text-halloween-burgundy">
            {data.locationHint}
          </p>
        </div>
      )}

      {showScanUi && (
        <p className="text-center text-sm font-semibold text-halloween-burgundy/75">
          숨겨진 미션 QR을 네모 안에 맞춰 주세요
        </p>
      )}

      {scanCameraError && (
        <p className="rounded-2xl bg-red-950/80 px-3 py-2 text-sm font-semibold text-orange-200 ring-1 ring-red-500/40" role="alert">
          {scanCameraError}
        </p>
      )}

      {/* 카메라 항상 active — 퀴즈 때는 가리기만 해서 권한 재요청 방지 */}
      <div
        className={
          showScanUi
            ? "relative"
            : "pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        }
        aria-hidden={!showScanUi}
      >
        {showScanUi && (
          <button
            type="button"
            onClick={() => scannerRef.current?.flipCamera()}
            disabled={flipMeta.flipDisabled}
            className="absolute right-2 top-2 z-10 rounded-lg border border-halloween-gold/50 bg-[#4c1d95]/95 px-2 py-1 text-xs font-bold text-white disabled:opacity-50"
          >
            {flipMeta.flipLabel}
          </button>
        )}
        <QrCameraScanner
          ref={scannerRef}
          key={scannerKey}
          active
          onDecoded={handleDecoded}
          onCameraError={(msg) => setScanCameraError(msg)}
          onFlipMeta={setFlipMeta}
        />
      </div>

      {data?.canClaim && (
        <Link
          href="/halloween/claim"
          className="halloween-btn-primary flex min-h-12 items-center justify-center rounded-2xl text-base font-extrabold"
        >
          코인 받기
        </Link>
      )}

      <HalloweenScanResultModals
        dupOpen={scan.dupOpen}
        onDupClose={scan.closeDup}
        errOpen={scan.errOpen}
        errText={scan.errText}
        onErrClose={scan.closeErr}
        successOpen={scan.successOpen}
        successCount={scan.successCount}
        successCanClaim={scan.successCanClaim}
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

export function HalloweenScanClient({ deviceId }: Props) {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-center font-semibold text-halloween-burgundy">카메라 준비 중…</p>
      }
    >
      <HalloweenScanInner deviceId={deviceId} />
    </Suspense>
  );
}
