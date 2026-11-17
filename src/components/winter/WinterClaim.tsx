"use client";

import Link from "next/link";
import { useState } from "react";
import { WinterPinModal } from "@/components/winter/WinterPinModal";
import { useWinterDeviceId } from "@/hooks/winter/useWinterDeviceId";
import { useWinterMe } from "@/hooks/winter/useWinterMe";
import { WINTER_INSTAGRAM_URL } from "@/lib/winter/constants";

export function WinterClaim() {
  const deviceId = useWinterDeviceId();
  const { session, loading, reload } = useWinterMe(deviceId);
  const [pinOpen, setPinOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm(pin: string) {
    if (!deviceId) return;
    setBusy(true);
    setError(null);
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
        setError(data.message ?? "다시 입력해 주세요.");
        if (data.error !== "invalid_staff_pin") setPinOpen(false);
        await reload();
        return;
      }
      // PIN 성공 시 인스타로 즉시 이동 (중간 화면 없음)
      window.location.assign(data.instagramUrl ?? WINTER_INSTAGRAM_URL);
    } finally {
      setBusy(false);
    }
  }

  if (!deviceId || loading || !session) {
    return <p className="px-5 py-10 text-center text-sm text-white/80">불러오는 중…</p>;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8 text-center">
      <h1 className="winter-title text-3xl font-bold">코인 받기</h1>

      {session.claimedToday ? (
        <section className="winter-card mt-8 rounded-3xl px-5 py-6">
          <h2 className="text-xl font-bold">오늘은 이미 받았어요</h2>
          <p className="mt-3 text-4xl font-bold text-[var(--winter-gold)]">
            {session.todayClaim?.coinAmount}코인
          </p>
          <p className="mt-3 text-sm text-white/80">어린이 1명당 1회만 참여할 수 있어요.</p>
        </section>
      ) : null}

      {!session.claimedToday && session.status !== "finished" ? (
        <section className="winter-card mt-8 rounded-3xl px-5 py-6">
          <h2 className="text-xl font-bold">아직 게임이 끝나지 않았어요</h2>
          <p className="mt-3 text-sm text-white/80">스캔 화면에서 시간이 끝나거나 「이대로 받기」를 눌러 주세요.</p>
          <Link href="/winter/scan" className="winter-btn-primary mt-5 block rounded-2xl py-3">
            스캔으로 이동
          </Link>
        </section>
      ) : null}

      {!session.claimedToday && session.status === "finished" && session.foundCount < 1 ? (
        <section className="winter-card mt-8 rounded-3xl px-5 py-6">
          <h2 className="text-xl font-bold">받을 코인이 없어요</h2>
          <p className="mt-3 text-sm text-white/80">보물을 1개 이상 찾아야 코인을 받을 수 있어요.</p>
        </section>
      ) : null}

      {!session.claimedToday && session.canClaim ? (
        <section className="winter-card mt-8 rounded-3xl px-5 py-6">
          <p className="text-sm text-white/75">보물 {session.foundCount}개 찾음</p>
          <p className="mt-2 text-5xl font-bold text-[var(--winter-gold)]">{session.expectedCoins}코인</p>
          <p className="mt-4 text-sm leading-relaxed text-white/85">
            카운터 직원에게 이 화면을 보여 주세요.
          </p>
          <button
            type="button"
            className="winter-btn-primary mt-6 w-full rounded-2xl py-3"
            onClick={() => {
              setError(null);
              setPinOpen(true);
            }}
          >
            코인 받으러 가기
          </button>
        </section>
      ) : null}

      <Link href="/winter" className="mt-8 text-sm text-white/60 underline">
        홈으로
      </Link>

      <WinterPinModal
        open={pinOpen}
        busy={busy}
        error={error}
        onClose={() => setPinOpen(false)}
        onConfirm={(pin) => void confirm(pin)}
      />
    </main>
  );
}
