"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { WinterFinishSummary } from "@/components/winter/WinterFinishSummary";
import { WinterPinModal } from "@/components/winter/WinterPinModal";
import { WinterScanResultModals } from "@/components/winter/WinterScanResultModals";
import { WinterTimerHud } from "@/components/winter/WinterTimerHud";
import { QrCameraScanner } from "@/components/scan/QrCameraScanner";
import { useWinterDeviceId } from "@/hooks/winter/useWinterDeviceId";
import { useWinterMe } from "@/hooks/winter/useWinterMe";
import { useWinterScanHandler } from "@/hooks/winter/useWinterScanHandler";
import { useWinterTickSound } from "@/hooks/winter/useWinterTickSound";
import { useWinterTimer } from "@/hooks/winter/useWinterTimer";
import { WINTER_INSTAGRAM_URL } from "@/lib/winter/constants";

export function WinterScanClient() {
  const deviceId = useWinterDeviceId();
  const router = useRouter();
  const { session, loading, reload } = useWinterMe(deviceId);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryTitle, setSummaryTitle] = useState("여기까지!");
  const [summaryFound, setSummaryFound] = useState(0);
  const [summaryCoins, setSummaryCoins] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const finishLockRef = useRef(false);

  const remainingMs = useWinterTimer(session?.endsAt ?? null, session?.status === "playing");
  const effectiveRemaining =
    remainingMs ?? session?.remainingMs ?? (session?.status === "finished" ? 0 : null);

  useWinterTickSound(
    session?.status === "playing" &&
      effectiveRemaining != null &&
      effectiveRemaining <= 60_000 &&
      effectiveRemaining > 0,
  );

  const showSummary = useCallback((title: string, foundCount: number, coins: number) => {
    setSummaryTitle(title);
    setSummaryFound(foundCount);
    setSummaryCoins(coins);
    setSummaryOpen(true);
  }, []);

  const finishGame = useCallback(
    async (reason: "early" | "timeout") => {
      if (!deviceId || finishLockRef.current) return;
      finishLockRef.current = true;
      setFinishing(true);
      try {
        const res = await fetch("/api/winter/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, finishReason: reason }),
        });
        const data = (await res.json()) as {
          foundCount?: number;
          expectedCoins?: number;
        };
        await reload();
        if (!res.ok) {
          finishLockRef.current = false;
          setSummaryOpen(false);
          return;
        }
        showSummary(
          reason === "timeout" ? "시간이 끝났어요!" : "여기까지!",
          data.foundCount ?? 0,
          data.expectedCoins ?? 0,
        );
      } catch {
        finishLockRef.current = false;
      } finally {
        setFinishing(false);
      }
    },
    [deviceId, reload, showSummary],
  );

  const onScanSuccess = useCallback(
    async (foundCount: number) => {
      await reload();
      void foundCount;
    },
    [reload],
  );

  const {
    notice,
    dupOpen,
    setDupOpen,
    successOpen,
    setSuccessOpen,
    successCount,
    successCode,
    handleDecoded,
  } = useWinterScanHandler(deviceId, onScanSuccess, () => void finishGame("timeout"));

  useEffect(() => {
    if (!session) return;
    if (session.status === "idle") {
      router.replace("/winter");
      return;
    }
    if (session.status === "finished" && !summaryOpen) {
      showSummary(
        session.finishReason === "timeout" ? "시간이 끝났어요!" : "여기까지!",
        session.foundCount,
        session.expectedCoins,
      );
    }
  }, [session, router, summaryOpen, showSummary]);

  useEffect(() => {
    if (session?.status !== "playing") return;
    if (effectiveRemaining == null || effectiveRemaining > 0) return;
    void finishGame("timeout");
  }, [effectiveRemaining, session?.status, finishGame]);

  async function confirmPin(pin: string) {
    if (!deviceId) return;
    setPinBusy(true);
    setPinError(null);
    try {
      const res = await fetch("/api/winter/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, staffPin: pin }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        instagramUrl?: string;
      };
      if (!res.ok) {
        setPinError(data.message ?? "다시 입력해 주세요.");
        if (data.error !== "invalid_staff_pin") setPinOpen(false);
        await reload();
        return;
      }
      window.location.assign(data.instagramUrl ?? WINTER_INSTAGRAM_URL);
    } finally {
      setPinBusy(false);
    }
  }

  if (!deviceId || loading || !session) {
    return <p className="px-5 py-10 text-center text-sm text-white/80">불러오는 중…</p>;
  }

  const modalBlocking = dupOpen || successOpen || summaryOpen || pinOpen;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-4">
      <WinterTimerHud
        remainingMs={effectiveRemaining ?? 0}
        foundCount={session.foundCount}
        total={session.total}
        timeLimitMin={session.timeLimitMin}
      />

      <p className="mt-3 text-center text-sm text-white/80">매장안에 QR코드를 찾아 스캔하세요.</p>

      <div className="relative mt-3">
        <QrCameraScanner
          active={session.status === "playing" && !modalBlocking}
          frameClassName="ring-[var(--winter-gold)]"
          onDecoded={(text) => void handleDecoded(text)}
        />
      </div>

      {notice ? <p className="mt-2 text-center text-sm text-[var(--winter-gold)]">{notice}</p> : null}

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          disabled={session.foundCount < 1 || session.status !== "playing" || finishing}
          onClick={() => void finishGame("early")}
          className="winter-btn-primary rounded-2xl py-3 disabled:opacity-40"
        >
          이대로 받기 ({session.foundCount}코인)
        </button>
        <Link href="/winter/map" className="winter-btn-ghost rounded-2xl py-3 text-center">
          보물지도 보기
        </Link>
        <Link href="/winter" className="text-center text-sm text-white/65 underline">
          홈으로
        </Link>
      </div>

      <WinterScanResultModals
        dupOpen={dupOpen}
        onDupClose={() => setDupOpen(false)}
        successOpen={successOpen}
        successCount={successCount}
        successCode={successCode}
        onSuccessContinue={() => {
          setSuccessOpen(false);
          if (successCount >= (session.total ?? 20)) {
            void finishGame("early");
          }
        }}
      />

      <WinterFinishSummary
        open={summaryOpen && !pinOpen}
        title={summaryTitle}
        foundCount={summaryFound}
        coins={summaryCoins}
        canClaim={summaryFound >= 1}
        onClaim={() => {
          setPinError(null);
          setPinOpen(true);
        }}
      />

      <WinterPinModal
        open={pinOpen}
        busy={pinBusy}
        error={pinError}
        onClose={() => setPinOpen(false)}
        onConfirm={(pin) => void confirmPin(pin)}
      />
    </main>
  );
}
