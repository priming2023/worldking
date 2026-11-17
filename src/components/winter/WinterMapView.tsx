"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useWinterDeviceId } from "@/hooks/winter/useWinterDeviceId";
import { useWinterMe } from "@/hooks/winter/useWinterMe";
import { WINTER_CODES, WINTER_TOTAL } from "@/lib/winter/codes";

export function WinterMapView() {
  const deviceId = useWinterDeviceId();
  const { session, loading, error } = useWinterMe(deviceId);

  const foundSet = useMemo(
    () => new Set(session?.foundCodes ?? []),
    [session?.foundCodes],
  );

  if (!deviceId || (loading && !session)) {
    return <p className="px-5 py-10 text-center text-sm text-white/80">보물지도 불러오는 중…</p>;
  }

  if (error || !session) {
    return (
      <p className="mx-5 mt-8 rounded-2xl bg-[var(--winter-crimson)]/20 px-4 py-3 text-center text-sm">
        {error ?? "오류가 났어요."}
      </p>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-6">
      <header className="text-center">
        <p className="text-sm font-semibold text-[var(--winter-frost)]">🗺️ 보물지도</p>
        <h1 className="winter-title mt-2 text-2xl font-bold">어떤 보물을 찾았을까요?</h1>
        <p className="mt-2 text-sm text-white/75">
          찾은 칸은 <span className="font-bold text-emerald-300">⭕</span>, 아직이면{" "}
          <span className="font-bold text-[var(--winter-gold)]">?</span> 이에요.
        </p>
        <p className="mt-2 text-base font-semibold">
          찾은 보물{" "}
          <span className="tabular-nums text-xl text-[var(--winter-gold)]">{session.foundCount}</span> /{" "}
          {WINTER_TOTAL}개
        </p>
      </header>

      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5" aria-label={`보물 ${WINTER_TOTAL}칸`}>
        {WINTER_CODES.map((code) => {
          const done = foundSet.has(code);
          return (
            <li key={code}>
              <div
                className={`flex min-h-[4.25rem] flex-col items-center justify-center rounded-2xl border px-1 py-2 text-center ${
                  done
                    ? "border-emerald-400/60 bg-emerald-500/15"
                    : "border-white/20 bg-white/5"
                }`}
              >
                <span
                  className={`text-[11px] font-extrabold tracking-tight ${
                    done ? "text-emerald-200/80 line-through" : "text-white/90"
                  }`}
                >
                  {code}
                </span>
                {done ? (
                  <span className="mt-0.5 text-2xl text-emerald-300" aria-label={`${code} 찾음`}>
                    ⭕
                  </span>
                ) : (
                  <span className="mt-0.5 text-xl text-[var(--winter-gold)]/70" aria-hidden>
                    ?
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {session.status === "playing" ? (
        <Link href="/winter/scan" className="winter-btn-primary flex min-h-12 items-center justify-center rounded-2xl">
          QR 보물찾기
        </Link>
      ) : null}
    </main>
  );
}
