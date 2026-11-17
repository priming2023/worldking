"use client";

import Link from "next/link";
import { useState } from "react";
import { WinterIntro } from "@/components/winter/WinterIntro";
import { WinterWheel } from "@/components/winter/WinterWheel";
import { useWinterDeviceId } from "@/hooks/winter/useWinterDeviceId";
import { useWinterMe } from "@/hooks/winter/useWinterMe";
import type { WinterTimeLimitMin } from "@/lib/winter/time-options";

export function WinterHome() {
  const deviceId = useWinterDeviceId();
  const { session, loading, error, reload } = useWinterMe(deviceId);
  const [spunMinutes, setSpunMinutes] = useState<WinterTimeLimitMin | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  async function startGame() {
    if (!deviceId || !spunMinutes) return;
    setStarting(true);
    setStartError(null);
    try {
      const res = await fetch("/api/winter/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, timeLimitMin: spunMinutes }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setStartError(data.message ?? "시작할 수 없어요.");
        await reload();
        return;
      }
      window.location.href = "/winter/scan";
    } finally {
      setStarting(false);
    }
  }

  if (!deviceId || loading) {
    return <p className="px-5 py-10 text-center text-sm text-white/80">불러오는 중…</p>;
  }

  if (error || !session) {
    return (
      <main className="mx-auto max-w-md px-5 py-10 text-center">
        <p className="text-sm text-[var(--winter-crimson)]">{error ?? "오류가 났어요."}</p>
        <button type="button" className="winter-btn-ghost mt-4 rounded-xl px-4 py-2" onClick={() => void reload()}>
          다시 시도
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-8">
      <header className="text-center">
        <h1 className="winter-title text-3xl font-bold text-white sm:text-4xl">월드킹</h1>
        <p className="mt-2 text-base font-semibold text-white/90">타임어택 QR 보물찾기</p>
      </header>

      <div className="mt-6">
        <WinterIntro />
      </div>

      {session.claimedToday ? (
        <section className="winter-card mt-6 rounded-3xl px-5 py-6 text-center">
          <h2 className="text-xl font-bold">오늘은 이미 받았어요</h2>
          <p className="mt-2 text-sm text-white/80">
            오늘 {session.todayClaim?.coinAmount}코인을 받았어요.
            <br />
            어린이 1명당 1회만 참여할 수 있어요.
          </p>
        </section>
      ) : null}

      {!session.claimedToday && session.status === "idle" ? (
        <section className="mt-6">
          <WinterWheel disabled={starting} onSpun={setSpunMinutes} />
          <button
            type="button"
            disabled={!spunMinutes || starting}
            onClick={() => void startGame()}
            className="winter-btn-primary mt-4 w-full rounded-2xl py-3.5 text-base"
          >
            {starting ? "시작 중…" : "게임 시작"}
          </button>
          {startError ? <p className="mt-2 text-center text-sm text-[var(--winter-crimson)]">{startError}</p> : null}
        </section>
      ) : null}

      {!session.claimedToday && session.status === "playing" ? (
        <section className="winter-card mt-6 rounded-3xl px-5 py-6 text-center">
          <h2 className="text-xl font-bold">게임이 진행 중이에요</h2>
          <p className="mt-2 text-sm text-white/80">
            {session.timeLimitMin}분 타임어택 · 찾은 보물 {session.foundCount}개
          </p>
          <Link href="/winter/scan" className="winter-btn-primary mt-5 block rounded-2xl py-3">
            이어서 찾기
          </Link>
          <Link href="/winter/map" className="winter-btn-ghost mt-3 block rounded-2xl py-3">
            보물지도 보기
          </Link>
        </section>
      ) : null}

      {!session.claimedToday && session.status === "finished" ? (
        <section className="winter-card mt-6 rounded-3xl px-5 py-6 text-center">
          <h2 className="text-xl font-bold">게임 종료!</h2>
          <p className="mt-2 text-sm text-white/80">
            보물 {session.foundCount}개 · {session.expectedCoins}코인
          </p>
          {session.canClaim ? (
            <Link href="/winter/claim" className="winter-btn-primary mt-5 block rounded-2xl py-3">
              코인 받으러 가기
            </Link>
          ) : (
            <p className="mt-4 text-sm text-white/70">보물을 1개 이상 찾아야 코인을 받을 수 있어요.</p>
          )}
          <Link href="/winter/map" className="mt-3 block text-sm text-white/65 underline">
            보물지도 보기
          </Link>
        </section>
      ) : null}
    </main>
  );
}
