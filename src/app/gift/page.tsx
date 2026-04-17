"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type GiftPayload = {
  dateDisplay?: string;
  count?: number;
  praise?: string;
};

const btnClass =
  "flex min-h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-amber-500 px-6 text-lg font-extrabold text-amber-950 shadow-md outline-offset-4 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800 active:scale-[0.99]";

export default function GiftPage() {
  const [data, setData] = useState<GiftPayload | null | undefined>(undefined);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = sessionStorage.getItem("worldking_last_gift");
      if (!raw) {
        setData(null);
        return;
      }
      try {
        setData(JSON.parse(raw) as GiftPayload);
      } catch {
        setData(null);
      }
      sessionStorage.removeItem("worldking_last_gift");
    });
  }, []);

  if (data === undefined) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 items-center justify-center px-4 py-10">
        <p className="text-lg font-semibold text-slate-700" role="status">
          불러오는 중…
        </p>
      </main>
    );
  }

  if (data === null) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
        <h1 className="text-2xl font-extrabold text-amber-950">선물 화면</h1>
        <p className="max-w-sm text-lg font-medium leading-relaxed text-slate-700">
          이 페이지는 선물 받기 직후에만 열려요. 홈으로 돌아가 주세요.
        </p>
        <Link href="/" className={btnClass}>
          홈으로
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <p className="text-lg font-semibold text-slate-600">{data.dateDisplay}</p>
      <h1 className="text-3xl font-extrabold text-amber-950 sm:text-4xl">선물 받기 완료!</h1>
      <p className="max-w-sm text-2xl font-extrabold leading-snug text-slate-800">
        {data.praise ?? `${data.count ?? 0}개 찾았어요. 정말 대단해요!`}
      </p>
      <p className="max-w-sm text-base font-medium leading-relaxed text-slate-600">
        카운터에서 선물을 받아 가세요. 오늘도 즐거운 하루 보내요!
      </p>
      <Link href="/" className={btnClass}>
        홈으로
      </Link>
    </main>
  );
}
