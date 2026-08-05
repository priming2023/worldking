"use client";

import Link from "next/link";
import { useChuseokDeviceId } from "@/hooks/chuseok/useChuseokDeviceId";
import { useChuseokMe } from "@/hooks/chuseok/useChuseokMe";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";

export default function ChuseokCompletePage() {
  const deviceId = useChuseokDeviceId();
  const { data } = useChuseokMe(deviceId);

  const coins = data?.expectedCoins ?? 0;
  const isOrdered = data?.rewardMode === "ordered" || (data?.orderedMode && data.foundCount >= MISSION_TOTAL);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <div className="chuseok-moon h-24 w-24 opacity-80" aria-hidden />
      <h1 className="chuseok-title text-3xl font-extrabold text-chuseok-burgundy sm:text-4xl">
        {isOrdered ? "20코인 달성!" : "10개 보물 완료!"}
      </h1>
      <p className="text-lg font-semibold text-chuseok-burgundy/90">
        {isOrdered
          ? "순서대로 모든 보물을 찾았어요. 정말 대단해요!"
          : "모든 보물을 찾았어요!"}
      </p>
      <p className="text-2xl font-extrabold tabular-nums text-chuseok-gold">
        예상 {coins}코인
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {data?.canClaim && (
          <Link
            href="/chuseok/claim"
            className="chuseok-btn-primary flex min-h-14 items-center justify-center rounded-2xl text-lg font-extrabold"
          >
            코인 받기
          </Link>
        )}
        <Link
          href="/chuseok"
          className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-chuseok-gold/40 font-bold text-chuseok-burgundy"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
