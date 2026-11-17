"use client";

import { useCallback, useRef, useState } from "react";
import { parseTreasureCode } from "@/lib/qr";

type ScanResult = {
  status?: string;
  message?: string;
  error?: string;
  code?: string;
  foundCount?: number;
};

export function useWinterScanHandler(
  deviceId: string | null,
  onSuccess: (foundCount: number) => void,
  onFinished: () => void,
) {
  const handling = useRef(false);
  const lastRawRef = useRef("");
  const lastScanAtRef = useRef(0);
  const [notice, setNotice] = useState("");

  const handleDecoded = useCallback(
    async (text: string) => {
      if (!deviceId || handling.current) return;
      if (!parseTreasureCode(text)) return;

      const now = Date.now();
      if (text === lastRawRef.current && now - lastScanAtRef.current < 2200) return;
      lastRawRef.current = text;
      lastScanAtRef.current = now;

      handling.current = true;
      try {
        const res = await fetch("/api/winter/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, qrPayload: text }),
        });
        const json = (await res.json()) as ScanResult;

        if (!res.ok) {
          if (json.error === "finished") {
            onFinished();
            return;
          }
          setNotice(json.message ?? "스캔에 실패했어요.");
          return;
        }

        if (json.status === "duplicate") {
          setNotice(json.message ?? "이미 찾은 보물이에요!");
          return;
        }
        if (json.status === "unknown_qr") {
          setNotice(json.message ?? "월드킹 보물 QR이 아니에요.");
          return;
        }
        if (json.status === "ok") {
          setNotice(`${json.code} 찾았어요!`);
          onSuccess(json.foundCount ?? 0);
          return;
        }
        setNotice(json.message ?? "다시 찍어 주세요.");
      } catch {
        setNotice("네트워크 오류가 났어요.");
      } finally {
        handling.current = false;
      }
    },
    [deviceId, onFinished, onSuccess],
  );

  return { notice, setNotice, handleDecoded };
}
