"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BlackfridayHeader } from "@/components/blackfriday/BlackfridayHeader";
import { BlackfridayPinModal } from "@/components/blackfriday/BlackfridayPinModal";
import { useBlackfridayDeviceId } from "@/hooks/blackfriday/useBlackfridayDeviceId";

type Session = {
  foundCount: number;
  expectedCoins: number;
  canClaim: boolean;
  claimedToday: boolean;
  todayClaim: { coinAmount: number } | null;
};

export function BlackfridayClaim() {
  const deviceId = useBlackfridayDeviceId();
  const [session, setSession] = useState<Session | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!deviceId) return;
    const res = await fetch(`/api/blackfriday/me?deviceId=${deviceId}`);
    if (!res.ok) return;
    setSession((await res.json()) as Session);
  }, [deviceId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function confirm(pin: string) {
    if (!deviceId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/blackfriday/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, staffPin: pin }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(data.message ?? "다시 입력해 주세요.");
        if (data.error !== "invalid_staff_pin") setPinOpen(false);
        await reload();
        return;
      }
      setPinOpen(false);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return <p className="px-4 py-8 text-center text-sm text-[#E8C170]">불러오는 중…</p>;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-6 text-center">
      <BlackfridayHeader progress={`${session.foundCount}/10`} />
      {session.foundCount < 5 ? (
        <section className="mt-8">
          <h1 className="text-2xl font-bold">아직 코인을 받을 수 없어요</h1>
          <p className="mt-3 text-sm text-white/80">보물을 5개 이상 찾으면 찾은 개수만큼 받을 수 있어요.</p>
        </section>
      ) : null}
      {session.claimedToday ? (
        <section className="mt-8">
          <h1 className="text-2xl font-bold">오늘 코인은 이미 받았어요</h1>
          <p className="mt-3 text-sm">오늘 {session.todayClaim?.coinAmount}코인을 받았어요. 내일 다시 받을 수 있어요.</p>
        </section>
      ) : null}
      {session.foundCount >= 5 && !session.claimedToday ? (
        <section className="mt-8">
          <h1 className="text-2xl font-bold">코인 받기</h1>
          <p className="mt-4 text-4xl font-bold text-[#E8C170]">{session.expectedCoins}코인</p>
          <p className="mt-4 text-sm leading-relaxed">오늘은 한 번만 코인을 받을 수 있어요.</p>
          <p className="mt-2 text-sm leading-relaxed">카운터 직원에게 이 화면을 보여 주세요.</p>
          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-[#E8C170] py-3 font-bold text-black"
            onClick={() => {
              setError(null);
              setPinOpen(true);
            }}
          >
            네, 받을게요!
          </button>
          <Link href="/blackfriday/scan" className="mt-3 block text-sm text-white/70 underline">
            아니요. 더 찾을게요!
          </Link>
        </section>
      ) : null}
      <Link href="/blackfriday" className="mt-8 text-sm text-white/60 underline">
        홈으로
      </Link>
      <BlackfridayPinModal
        open={pinOpen}
        busy={busy}
        error={error}
        onClose={() => setPinOpen(false)}
        onConfirm={(pin) => void confirm(pin)}
      />
    </main>
  );
}
