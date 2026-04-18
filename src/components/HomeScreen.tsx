"use client";

import Link from "next/link";
import { useMemo } from "react";
import { pickEncouragement } from "@/lib/encouragement";
import { useDeviceId } from "@/hooks/useDeviceId";
import { useMe } from "@/hooks/useMe";
import { ProgressBar } from "@/components/ProgressBar";
import { CompleteTreasureBanner } from "@/components/home/CompleteTreasureBanner";
import { EncouragementCard } from "@/components/home/EncouragementCard";
import { TREASURE_TOTAL } from "@/lib/treasure-codes";

export function HomeScreen() {
  const deviceId = useDeviceId();
  const { data, loading, error } = useMe(deviceId);
  const count = data?.foundCount ?? 0;
  const encouragement = useMemo(() => pickEncouragement(count), [count]);

  if (!deviceId) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
        <p className="text-lg font-semibold text-slate-700" role="status">
          기기 정보를 준비하고 있어요…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 pb-10">
      <header className="text-center">
        <p className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-800/85">
          <span className="select-none text-base normal-case" aria-hidden>
            🏰
          </span>
          월드킹 보물찾기
          <span className="select-none text-base normal-case" aria-hidden>
            ✨
          </span>
        </p>
        <h1
          id="home-progress-label"
          className="mt-2 flex flex-wrap items-center justify-center gap-2 text-3xl font-extrabold tracking-tight text-amber-950 sm:text-4xl"
        >
          <span className="select-none sm:text-5xl" aria-hidden>
            🗺️
          </span>
          오늘의 보물
          <span className="select-none sm:text-5xl" aria-hidden>
            💎
          </span>
        </h1>
        <p className="mt-3 text-lg font-semibold text-slate-800">
          코인{" "}
          <span className="tabular-nums text-2xl font-extrabold text-amber-700">
            {count}
          </span>{" "}
          개 · 목표 {TREASURE_TOTAL}개
        </p>
        <div className="mx-auto mt-5 max-w-md">
          <ProgressBar found={count} labelId="home-progress-label" />
        </div>
        {loading && (
          <p className="mt-2 text-sm font-medium text-slate-500" aria-live="polite">
            불러오는 중…
          </p>
        )}
        {error && (
          <p
            className="mx-auto mt-3 max-w-md rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-900 ring-1 ring-red-100"
            role="alert"
          >
            {error}
          </p>
        )}
      </header>

      {count === 20 && (
        <>
          <CompleteTreasureBanner claimedToday={Boolean(data?.claimedToday)} />
          <Link
            href="/map"
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-amber-400/80 bg-white/90 text-base font-extrabold text-amber-900 shadow-sm hover:bg-amber-50"
          >
            <span className="select-none text-lg" aria-hidden>
              🗺️
            </span>
            보물지도 보기
          </Link>
        </>
      )}

      {count < 10 && <EncouragementCard text={encouragement} />}

      {count >= 10 && count < 20 && (
        <section className="grid gap-3 sm:grid-cols-2" aria-label="선물과 스캔">
          {data?.claimedToday ? (
            <span className="flex min-h-14 items-center justify-center rounded-2xl bg-slate-300 px-4 text-lg font-extrabold text-slate-600 shadow-none">
              오늘 선물 완료
            </span>
          ) : (
            <Link
              href="/claim"
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 text-lg font-extrabold text-amber-950 shadow-md outline-offset-4 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800 active:scale-[0.99]"
            >
              <span className="select-none text-xl" aria-hidden>
                🎁
              </span>
              선물 받아가기
              <span className="select-none text-xl" aria-hidden>
                🤗
              </span>
            </Link>
          )}
          <Link
            href="/scan"
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-amber-600 bg-white text-lg font-extrabold text-amber-900 shadow-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700 active:scale-[0.99]"
          >
            <span className="select-none text-xl" aria-hidden>
              🔭
            </span>
            계속 찾기 (QR)
            <span className="select-none text-xl" aria-hidden>
              📷
            </span>
          </Link>
          <Link
            href="/map"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-amber-400/80 bg-white/90 text-base font-extrabold text-amber-900 shadow-sm hover:bg-amber-50 sm:col-span-2"
          >
            <span className="select-none text-lg" aria-hidden>
              🗺️
            </span>
            보물지도 보기
          </Link>
        </section>
      )}

      {count < 10 && (
        <div className="mt-auto flex flex-col gap-3">
          <Link
            href="/scan"
            className="flex min-h-[3.75rem] items-center justify-center rounded-2xl bg-amber-500 text-xl font-extrabold text-amber-950 shadow-lg outline-offset-4 ring-2 ring-amber-300/50 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800 active:scale-[0.99]"
          >
            QR 월드킹 보물 찾기
          </Link>
          <Link
            href="/map"
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-amber-400/80 bg-white/90 text-base font-extrabold text-amber-900 shadow-sm hover:bg-amber-50"
          >
            <span className="select-none text-lg" aria-hidden>
              🗺️
            </span>
            보물지도 보기
          </Link>
          <p className="text-center text-base font-medium text-slate-600">
            매장 안에 숨어 있는 QR을 카메라로 비춰 주세요.
          </p>
        </div>
      )}

    </main>
  );
}
