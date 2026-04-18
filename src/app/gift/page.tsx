"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type GiftPayload = {
  dateDisplay?: string;
  count?: number;
  praise?: string;
};

const btnClass =
  "flex min-h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 text-lg font-extrabold text-amber-950 shadow-md outline-offset-4 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800 active:scale-[0.99]";

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
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-3 px-4 py-10">
        <p className="text-4xl" aria-hidden>
          🎁
        </p>
        <p className="text-lg font-semibold text-slate-700" role="status">
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
        <h1 className="text-2xl font-extrabold text-amber-950">선물 화면</h1>
        <p className="max-w-sm text-lg font-medium leading-relaxed text-slate-700">
          이 페이지는 선물 받기 직후에만 열려요.{" "}
          <span className="select-none" aria-hidden>
            🏠😊
          </span>
          <br />
          홈으로 돌아가 주세요.
        </p>
        <Link href="/" className={btnClass}>
          <span>홈으로</span>
          <span className="select-none" aria-hidden>
            🧸
          </span>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <p className="text-5xl" aria-hidden>
        🥳
      </p>
      <p className="text-lg font-semibold text-slate-600">{data.dateDisplay}</p>
      <h1 className="text-3xl font-extrabold text-amber-950 sm:text-4xl">
        <span className="select-none" aria-hidden>
          🎉
        </span>{" "}
        선물 받기 완료!{" "}
        <span className="select-none" aria-hidden>
          🎁✨
        </span>
      </h1>
      <p className="max-w-sm rounded-2xl bg-amber-50/95 px-4 py-5 text-2xl font-extrabold leading-snug text-slate-800 ring-1 ring-amber-100">
        <span className="select-none" aria-hidden>
          😄⭐
        </span>{" "}
        {data.praise ?? `${data.count ?? 0}개 찾았어요. 정말 대단해요!`}{" "}
        <span className="select-none" aria-hidden>
          🎊
        </span>
      </p>
      <p className="max-w-sm text-base font-semibold leading-relaxed text-slate-600">
        <span className="select-none text-xl" aria-hidden>
          🎁🤗
        </span>
        <br />
        카운터에서 선물을 받아 가세요. 오늘도 즐거운 하루 보내요!
      </p>
      <Link href="/" className={btnClass}>
        <span>홈으로</span>
        <span className="select-none" aria-hidden>
          🏠💛
        </span>
      </Link>
    </main>
  );
}
