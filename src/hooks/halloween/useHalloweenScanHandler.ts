"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { parseTreasureCode } from "@/lib/qr";
import { isMissionCode, MISSION_TOTAL } from "@/lib/halloween/codes";
import { CLAIM_MIN } from "@/lib/halloween/reward";

type PendingScan = {
  text: string;
  confirmOutOfOrder: boolean;
};

export function useHalloweenScanHandler(
  deviceId: string,
  onRefresh?: () => void | Promise<unknown>,
) {
  const router = useRouter();
  const handling = useRef(false);
  const lastRawRef = useRef("");
  const lastScanAtRef = useRef(0);

  const [dupOpen, setDupOpen] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errText, setErrText] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [successCanClaim, setSuccessCanClaim] = useState(false);
  const [orderWarnOpen, setOrderWarnOpen] = useState(false);
  const [orderWarnText, setOrderWarnText] = useState("");
  const pendingScanRef = useRef<PendingScan | null>(null);

  const releaseHandling = useCallback(() => {
    handling.current = false;
  }, []);

  const postScan = useCallback(
    async (text: string, confirmOutOfOrder = false) => {
      const res = await fetch("/api/halloween/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, qrPayload: text, confirmOutOfOrder }),
      });
      return res;
    },
    [deviceId],
  );

  const handleScanResult = useCallback(
    async (json: {
      status?: string;
      message?: string;
      error?: string;
      foundCount?: number;
      missionComplete?: boolean;
      expectedCoins?: number;
      orderedMode?: boolean;
      nextPhase?: string;
    }) => {
      if (json.status === "order_warning") {
        setOrderWarnText(json.message ?? "순서가 맞지 않아요. 스캔할까요?");
        setOrderWarnOpen(true);
        return;
      }
      if (json.status === "duplicate") {
        setDupOpen(true);
        return;
      }
      if (json.status === "new") {
        await onRefresh?.();
        const foundCount = json.foundCount ?? 0;
        if (json.missionComplete) {
          releaseHandling();
          router.push("/halloween/complete");
          return;
        }
        setSuccessCount(foundCount);
        setSuccessCanClaim(foundCount >= CLAIM_MIN);
        setSuccessOpen(true);

        // 순서 모드: QR 성공 후 바로 다음 퀴즈로 (홈으로 나가지 않아도 됨)
        const goNextQuizSoon =
          json.orderedMode !== false && json.nextPhase === "quiz";
        if (goNextQuizSoon) {
          window.setTimeout(() => {
            setSuccessOpen(false);
            releaseHandling();
            void onRefresh?.();
          }, 900);
        }
        return;
      }
      setErrText(json.message ?? "스캔에 실패했어요.");
      setErrOpen(true);
    },
    [onRefresh, releaseHandling, router],
  );

  const handleDecoded = useCallback(
    async (text: string, confirmOutOfOrder = false) => {
      // 순서 경고 확인 재호출은 handling이 잠겨 있어도 허용
      if (handling.current && !confirmOutOfOrder) return;
      const code = parseTreasureCode(text);
      if (!code || !isMissionCode(code)) return;

      const now = Date.now();
      if (
        !confirmOutOfOrder &&
        text === lastRawRef.current &&
        now - lastScanAtRef.current < 2200
      ) {
        return;
      }
      lastRawRef.current = text;
      lastScanAtRef.current = now;

      handling.current = true;
      try {
        const res = await postScan(text, confirmOutOfOrder);
        const json = (await res.json()) as {
          status?: string;
          message?: string;
          error?: string;
          foundCount?: number;
          missionComplete?: boolean;
          expectedCoins?: number;
          orderedMode?: boolean;
          nextPhase?: string;
        };
        if (!res.ok && json.status !== "order_warning") {
          setErrText(json.message ?? "스캔에 실패했어요.");
          setErrOpen(true);
          return;
        }
        if (json.status === "order_warning" && !confirmOutOfOrder) {
          pendingScanRef.current = { text, confirmOutOfOrder: true };
        }
        await handleScanResult(json);
      } catch {
        setErrText("네트워크 오류가 났어요. 다시 시도해 주세요.");
        setErrOpen(true);
      }
    },
    [postScan, handleScanResult],
  );

  const confirmOrderWarn = useCallback(async () => {
    setOrderWarnOpen(false);
    const pending = pendingScanRef.current;
    pendingScanRef.current = null;
    if (pending) {
      // 핵심: 경고 모달 때 locking된 handling을 풀어 재스캔(카운트 증가) 허용
      handling.current = false;
      await handleDecoded(pending.text, true);
    } else {
      releaseHandling();
    }
  }, [handleDecoded, releaseHandling]);

  const cancelOrderWarn = useCallback(() => {
    setOrderWarnOpen(false);
    pendingScanRef.current = null;
    releaseHandling();
  }, [releaseHandling]);

  const closeDup = useCallback(() => {
    setDupOpen(false);
    releaseHandling();
  }, [releaseHandling]);

  const closeErr = useCallback(() => {
    setErrOpen(false);
    releaseHandling();
  }, [releaseHandling]);

  const closeSuccess = useCallback(() => {
    setSuccessOpen(false);
    releaseHandling();
  }, [releaseHandling]);

  return {
    handleDecoded,
    releaseHandling,
    dupOpen,
    errOpen,
    errText,
    successOpen,
    successCount,
    successCanClaim,
    orderWarnOpen,
    orderWarnText,
    closeDup,
    closeErr,
    closeSuccess,
    confirmOrderWarn,
    cancelOrderWarn,
    missionTotal: MISSION_TOTAL,
  };
}
