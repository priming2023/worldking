"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useDeviceId } from "@/hooks/useDeviceId";
import { useMe } from "@/hooks/useMe";
import { TREASURE_CODES, TREASURE_TOTAL } from "@/lib/treasure-codes";

export function TreasureMapView() {
  const deviceId = useDeviceId();
  const { data, loading, error } = useMe(deviceId);

  const foundSet = useMemo(
    () => new Set(data?.foundCodes ?? []),
    [data?.foundCodes],
  );

  if (!deviceId) {
    return (
      <p className="text-center text-lg font-semibold text-slate-700" role="status">
        기기 정보를 준비하고 있어요…
      </p>
    );
  }

  if (loading && !data) {
    return (
      <p className="text-center text-lg font-semibold text-slate-600" role="status">
        보물지도 불러오는 중…
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-900 ring-1 ring-red-100">
        {error}
      </p>
    );
  }

  const found = data?.foundCount ?? 0;

  return (
    <>
      <header className="text-center">
        <p className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-amber-800/90">
          <span className="select-none text-lg" aria-hidden>
            🗺️
          </span>
          보물지도
          <span className="select-none text-lg" aria-hidden>
            ✨
          </span>
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-amber-950 sm:text-3xl">
          어떤 보물을 찾았을까요?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-center text-sm font-semibold leading-relaxed text-slate-600 sm:text-base">
          보물은 화장실, 수유실, 미니룸, 파티룸에는 숨겨져 있지 않아요~
        </p>
        <p className="mt-2 text-base font-semibold text-slate-700">
          <span className="select-none" aria-hidden>
            🪙
          </span>{" "}
          찾은 보물{" "}
          <span className="tabular-nums text-xl font-extrabold text-amber-700">{found}</span> /{" "}
          {TREASURE_TOTAL}개
        </p>
        <p className="mt-2 text-sm font-medium text-slate-600">
          찾은 칸은{" "}
          <span className="font-extrabold text-emerald-700">⭕ 표</span>로 표시돼요. 아직이면{" "}
          <span className="font-extrabold text-amber-700">?</span> 이에요.
        </p>
      </header>

      <ul
        className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3"
        aria-label={`보물 ${TREASURE_TOTAL}칸`}
      >
        {TREASURE_CODES.map((code) => {
          const done = foundSet.has(code);
          return (
            <li key={code}>
              <div
                className={`flex min-h-[4.25rem] flex-col items-center justify-center rounded-2xl border-2 px-1 py-2 text-center shadow-sm transition-colors ${
                  done
                    ? "border-emerald-400 bg-emerald-50/90 ring-1 ring-emerald-200"
                    : "border-amber-100 bg-white/95 ring-1 ring-amber-50"
                }`}
              >
                <span
                  className={`text-[11px] font-extrabold tracking-tight sm:text-xs ${
                    done ? "text-emerald-800/70 line-through decoration-2" : "text-amber-900"
                  }`}
                >
                  {code}
                </span>
                {done ? (
                  <span
                    className="mt-0.5 select-none text-2xl font-black leading-none text-emerald-600 sm:text-3xl"
                    aria-label={`${code} 찾음`}
                    title="찾은 보물"
                  >
                    ⭕
                  </span>
                ) : (
                  <span
                    className="mt-0.5 select-none text-xl font-bold text-amber-300 sm:text-2xl"
                    aria-hidden
                  >
                    ?
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/scan"
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 text-base font-extrabold text-amber-950 shadow-md hover:bg-amber-400"
        >
          <span aria-hidden>📷</span>
          QR 보물찾기
        </Link>
        <Link
          href="/"
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-amber-300 bg-white px-4 text-base font-extrabold text-amber-900 hover:bg-amber-50"
        >
          <span aria-hidden>🏠</span>
          홈으로
        </Link>
      </div>
    </>
  );
}
