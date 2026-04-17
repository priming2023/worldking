"use client";

import { useCallback, useRef, useState } from "react";
import { parseTreasureCode } from "@/lib/qr";

export function useTreasureScanHandler(deviceId: string) {
  const handling = useRef(false);
  const lastRawRef = useRef("");
  const lastScanAtRef = useRef(0);

  const [dupOpen, setDupOpen] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errText, setErrText] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  const releaseHandling = useCallback(() => {
    handling.current = false;
  }, []);

  const handleDecoded = useCallback(
    async (text: string) => {
      if (handling.current) return;
      if (!parseTreasureCode(text)) return;

      const now = Date.now();
      if (text === lastRawRef.current && now - lastScanAtRef.current < 2200) return;
      lastRawRef.current = text;
      lastScanAtRef.current = now;

      handling.current = true;
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, qrPayload: text }),
        });
        const json = (await res.json()) as {
          status?: string;
          message?: string;
          error?: string;
          foundCount?: number;
        };

        if (!res.ok) {
          setErrText(
            json.message ??
              (json.error === "unknown_qr"
                ? "등록되지 않은 QR이에요. 직원에게 문의해 주세요."
                : "스캔에 실패했어요."),
          );
          setErrOpen(true);
          return;
        }
        if (json.status === "duplicate") {
          setDupOpen(true);
          return;
        }
        if (json.status === "new") {
          setSuccessCount(json.foundCount ?? 0);
          setSuccessOpen(true);
          return;
        }
        setErrText("응답을 이해할 수 없어요. 다시 찍어 주세요.");
        setErrOpen(true);
      } catch {
        setErrText("네트워크 오류가 났어요. 다시 시도해 주세요.");
        setErrOpen(true);
      }
    },
    [deviceId],
  );

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
    closeDup,
    closeErr,
    closeSuccess,
  };
}
