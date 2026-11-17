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
  const [claimedCoins, setClaimedCoins] = useState<number | null>(null);

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
        coinAmount?: number;
        instagramUrl?: string;
      };
      if (!res.ok) {
        setError(data.message ?? "다시 입력해 주세요.");
        if (data.error !== "invalid_staff_pin") setPinOpen(false);
        await reload();
        return;
      }
      setPinOpen(false);
      setClaimedCoins(data.coinAmount ?? null);
      await reload();
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
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--winter-frost)]">WORLDKING WINTER</p>
      <h1 className="winter-title mt-2 text-3xl font-bold">코인 받기</h1>

      {session.claimedToday || claimedCoins != null ? (
        <section className="winter-card mt-8 rounded-3xl px-5 py-6">
          <h2 className="text-xl font-bold">수령 완료!</h2>
          <p className="mt-3 text-4xl font-bold text-[var(--winter-gold)]">
            {claimedCoins ?? session.todayClaim?.coinAmount}코인
          </p>
          <p className="mt-3 text-sm text-white/80">
            인스타그램으로 이동했어요. 팔로우 부탁드려요!
          </p>
          <a
            href={WINTER_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="winter-btn-primary mt-5 block rounded-2xl py-3"
          >
            인스타그램 다시 열기
          </a>
        </section>
      ) : null}

      {!session.claimedToday && claimedCoins == null && session.status !== "finished" ? (
        <section className="winter-card mt-8 rounded-3xl px-5 py-6">
          <h2 className="text-xl font-bold">아직 게임이 끝나지 않았어요</h2>
          <p className="mt-3 text-sm text-white/80">스캔 화면에서 시간이 끝나거나 「이대로 받기」를 눌러 주세요.</p>
          <Link href="/winter/scan" className="winter-btn-primary mt-5 block rounded-2xl py-3">
            스캔으로 이동
          </Link>
        </section>
      ) : null}

      {!session.claimedToday && claimedCoins == null && session.status === "finished" && session.foundCount < 1 ? (
        <section className="winter-card mt-8 rounded-3xl px-5 py-6">
          <h2 className="text-xl font-bold">받을 코인이 없어요</h2>
          <p className="mt-3 text-sm text-white/80">보물을 1개 이상 찾아야 코인을 받을 수 있어요.</p>
        </section>
      ) : null}

      {!session.claimedToday && claimedCoins == null && session.canClaim ? (
        <section className="winter-card mt-8 rounded-3xl px-5 py-6">
          <p className="text-sm text-white/75">찾은 보물</p>
          <p className="mt-2 text-5xl font-bold text-[var(--winter-gold)]">{session.expectedCoins}코인</p>
          <p className="mt-4 text-sm leading-relaxed text-white/85">
            카운터 직원에게 이 화면을 보여 주세요.
            <br />
            확인 후 인스타그램으로 바로 연결돼요.
          </p>
          <button
            type="button"
            className="winter-btn-primary mt-6 w-full rounded-2xl py-3"
            onClick={() => {
              setError(null);
              setPinOpen(true);
            }}
          >
            네, 받을게요!
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
