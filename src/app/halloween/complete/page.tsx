"use client";

import Link from "next/link";
import { useHalloweenDeviceId } from "@/hooks/halloween/useHalloweenDeviceId";
import { useHalloweenMe } from "@/hooks/halloween/useHalloweenMe";

export default function HalloweenCompletePage() {
  const deviceId = useHalloweenDeviceId();
  const { data } = useHalloweenMe(deviceId);

  const coins = data?.expectedCoins ?? 0;
  const isOrdered = data?.rewardMode === "ordered";
  const isUnorderedTen =
    data?.rewardMode === "unordered" ||
    (!isOrdered && (data?.foundCount ?? 0) >= 10);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <div className="halloween-moon h-28 w-28 opacity-90" aria-hidden />
      <p className="text-5xl" aria-hidden>
        {isOrdered ? "🎃🏆🎉" : "🎊🪙🎃"}
      </p>
      <h1 className="halloween-title text-3xl font-extrabold text-halloween-burgundy sm:text-4xl">
        {isOrdered ? "20코인 대성공!" : "보물 10개 완주!"}
      </h1>
      <p className="text-lg font-semibold leading-relaxed text-halloween-burgundy/90">
        {isOrdered
          ? "퀴즈를 풀며 순서대로 모든 보물을 찾았어요.\n으스스~ 할로윈 대성공이에요!"
          : isUnorderedTen
            ? "보물 10개를 모두 찾았어요!\n카운터에서 10코인을 받아 가세요!"
            : "미션을 완주했어요!"}
      </p>
      <p className="rounded-2xl bg-halloween-burgundy/10 px-6 py-4 text-2xl font-extrabold tabular-nums text-halloween-gold">
        🪙 예상 {coins}코인
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {data?.canClaim && (
          <Link
            href="/halloween/claim"
            className="halloween-btn-primary flex min-h-14 items-center justify-center rounded-2xl text-lg font-extrabold"
          >
            🎁 코인 받기
          </Link>
        )}
        <Link
          href="/halloween"
          className="halloween-btn-secondary flex min-h-12 items-center justify-center rounded-2xl font-bold"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
