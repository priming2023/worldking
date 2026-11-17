"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { WinterBombFx } from "@/components/winter/WinterBombFx";
import { WinterTimerHud } from "@/components/winter/WinterTimerHud";
import { QrCameraScanner } from "@/components/scan/QrCameraScanner";
import { useWinterDeviceId } from "@/hooks/winter/useWinterDeviceId";
import { useWinterMe } from "@/hooks/winter/useWinterMe";
import { useWinterScanHandler } from "@/hooks/winter/useWinterScanHandler";
import { useWinterTickSound } from "@/hooks/winter/useWinterTickSound";
import { useWinterTimer } from "@/hooks/winter/useWinterTimer";

export function WinterScanClient() {
  const deviceId = useWinterDeviceId();
  const router = useRouter();
  const { session, loading, reload } = useWinterMe(deviceId);
  const [boomOpen, setBoomOpen] = useState(false);
  const [boomTitle, setBoomTitle] = useState("꽝!");
  const [boomSubtitle, setBoomSubtitle] = useState("");
  const [finishing, setFinishing] = useState(false);
  const finishLockRef = useRef(false);

  const remainingMs = useWinterTimer(
    session?.endsAt ?? null,
    session?.status === "playing",
  );
  const effectiveRemaining =
    remainingMs ?? session?.remainingMs ?? (session?.status === "finished" ? 0 : null);

  useWinterTickSound(
    session?.status === "playing" && effectiveRemaining != null && effectiveRemaining <= 60_000 && effectiveRemaining > 0,
  );

  const goBoom = useCallback((title: string, subtitle: string) => {
    setBoomTitle(title);
    setBoomSubtitle(subtitle);
    setBoomOpen(true);
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
          message?: string;
        };
        await reload();
        if (!res.ok) {
          finishLockRef.current = false;
          setBoomOpen(false);
          return;
        }
        goBoom(
          reason === "timeout" ? "시간이 끝났어요!" : "여기까지!",
          `${data.foundCount ?? 0}개 찾았어요 · ${data.expectedCoins ?? 0}코인`,
        );
      } catch {
        finishLockRef.current = false;
      } finally {
        setFinishing(false);
      }
    },
    [deviceId, goBoom, reload],
  );

  const onScanSuccess = useCallback(
    async (foundCount: number) => {
      await reload();
      if (foundCount >= (session?.total ?? 20)) {
        void finishGame("early");
      }
    },
    [finishGame, reload, session?.total],
  );

  const { notice, handleDecoded } = useWinterScanHandler(
    deviceId,
    onScanSuccess,
    () => void finishGame("timeout"),
  );

  useEffect(() => {
    if (!session) return;
    if (session.status === "idle") {
      router.replace("/winter");
      return;
    }
    if (session.status === "finished" && !boomOpen) {
      goBoom(
        session.finishReason === "timeout" ? "시간이 끝났어요!" : "여기까지!",
        `${session.foundCount}개 찾았어요 · ${session.expectedCoins}코인`,
      );
    }
  }, [session, router, boomOpen, goBoom]);

  useEffect(() => {
    if (session?.status !== "playing") return;
    if (effectiveRemaining == null) return;
    if (effectiveRemaining > 0) return;
    void finishGame("timeout");
  }, [effectiveRemaining, session?.status, finishGame]);

  if (!deviceId || loading || !session) {
    return <p className="px-5 py-10 text-center text-sm text-white/80">불러오는 중…</p>;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-4">
      <WinterTimerHud
        remainingMs={effectiveRemaining ?? 0}
        foundCount={session.foundCount}
        total={session.total}
        timeLimitMin={session.timeLimitMin}
      />

      <p className="mt-3 text-center text-sm text-white/80">매장 안 QR(WK01~WK20)을 찾아 스캔하세요</p>

      <div className="relative mt-3">
        <QrCameraScanner
          active={session.status === "playing" && !boomOpen}
          frameClassName="ring-[var(--winter-gold)]"
          onDecoded={(text) => void handleDecoded(text)}
        />
      </div>

      {notice ? <p className="mt-2 text-center text-sm text-[var(--winter-gold)]">{notice}</p> : null}

      <button
        type="button"
        disabled={session.foundCount < 1 || session.status !== "playing" || finishing}
        onClick={() => void finishGame("early")}
        className="winter-btn-primary mt-4 rounded-2xl py-3 disabled:opacity-40"
      >
        이대로 받기 ({session.foundCount}코인)
      </button>

      <Link href="/winter" className="mt-3 text-center text-sm text-white/65 underline">
        홈으로
      </Link>

      <WinterBombFx
        open={boomOpen}
        title={boomTitle}
        subtitle={boomSubtitle}
        onDone={() => {
          setBoomOpen(false);
          router.push("/winter/claim");
        }}
      />
    </main>
  );
}
