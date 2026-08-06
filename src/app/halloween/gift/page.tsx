"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ClaimResult = {
  coinAmount?: number;
  praise?: string;
  dateDisplay?: string;
};

const btnClass =
  "halloween-btn-primary flex min-h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-6 text-lg font-extrabold active:scale-[0.99]";

export default function HalloweenGiftPage() {
  const [data, setData] = useState<ClaimResult | null | undefined>(undefined);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = sessionStorage.getItem("worldking_halloween_last_claim");
      if (!raw) {
        setData(null);
        return;
      }
      try {
        setData(JSON.parse(raw) as ClaimResult);
      } catch {
        setData(null);
      }
      sessionStorage.removeItem("worldking_halloween_last_claim");
    });
  }, []);

  if (data === undefined) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-3 px-4 py-10">
        <p className="text-4xl" aria-hidden>
          🎁
        </p>
        <p className="text-lg font-semibold text-halloween-burgundy" role="status">
          불러오는 중…
        </p>
      </main>
    );
  }

  if (data === null) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
        <p className="text-5xl" aria-hidden>
          🎀
        </p>
        <h1 className="halloween-title text-2xl font-extrabold text-halloween-burgundy">
          코인 화면
        </h1>
        <p className="max-w-sm text-lg font-medium leading-relaxed text-halloween-burgundy/90">
          이 페이지는 코인 받기 직후에만 열려요. 🏠😊
          <br />
          홈으로 돌아가 주세요.
        </p>
        <Link href="/halloween" className={btnClass}>
          <span>홈으로</span>
          <span aria-hidden>🎃</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <p className="text-5xl" aria-hidden>
        🥳
      </p>
      {data.dateDisplay && (
        <p className="text-lg font-semibold text-halloween-burgundy/70">{data.dateDisplay}</p>
      )}
      <h1 className="halloween-title text-3xl font-extrabold text-halloween-burgundy sm:text-4xl">
        🎉 코인 받기 완료! 🎁✨
      </h1>
      <p className="max-w-sm rounded-2xl bg-halloween-burgundy/5 px-4 py-5 text-2xl font-extrabold leading-snug text-halloween-burgundy ring-1 ring-halloween-gold/30">
        😄⭐ {data.praise ?? `${data.coinAmount ?? 0}코인 받았어요!`} 🎊
      </p>
      <p className="max-w-sm text-base font-semibold leading-relaxed text-halloween-burgundy/80">
        🎁🤗
        <br />
        카운터에서 코인을 받아 가세요. 오늘도 즐거운 하루 보내요!
      </p>
      <Link href="/halloween" className={btnClass}>
        <span>홈으로</span>
        <span aria-hidden>🏠🎃</span>
      </Link>
    </main>
  );
}
