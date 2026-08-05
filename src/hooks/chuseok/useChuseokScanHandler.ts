"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { parseTreasureCode } from "@/lib/qr";
import { isMissionCode } from "@/lib/chuseok/codes";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";

type PendingScan = {
  text: string;
  confirmOutOfOrder: boolean;
};

export function useChuseokScanHandler(
  deviceId: string,
  onRefresh?: () => void,
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
  const [orderWarnOpen, setOrderWarnOpen] = useState(false);
  const [orderWarnText, setOrderWarnText] = useState("");
  const pendingScanRef = useRef<PendingScan | null>(null);

  const releaseHandling = useCallback(() => {
    handling.current = false;
  }, []);

  const postScan = useCallback(
    async (text: string, confirmOutOfOrder = false) => {
      const res = await fetch("/api/chuseok/scan", {
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
        onRefresh?.();
        const foundCount = json.foundCount ?? 0;
        if (json.missionComplete) {
          releaseHandling();
          router.push("/chuseok/complete");
          return;
        }
        setSuccessCount(foundCount);
        setSuccessOpen(true);
        return;
      }
      setErrText(json.message ?? "스캔에 실패했어요.");
      setErrOpen(true);
    },
    [onRefresh, releaseHandling, router],
  );

  const handleDecoded = useCallback(
    async (text: string, confirmOutOfOrder = false) => {
      if (handling.current) return;
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
        const json = await res.json() as {
          status?: string;
          message?: string;
          error?: string;
          foundCount?: number;
          missionComplete?: boolean;
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
