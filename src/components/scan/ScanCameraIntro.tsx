"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  onStart: () => void;
  /** 카메라를 미리 여는 등 지연 작업이 있을 때만 사용 */
  busy?: boolean;
  error?: string | null;
};

export function ScanCameraIntro({ onStart, busy = false, error = null }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-2xl border-2 border-amber-200 bg-white px-4 text-base font-extrabold text-amber-900 shadow-sm"
        >
          ← 홈
        </Link>
        <h1 className="text-xl font-extrabold text-amber-950 sm:text-2xl">QR 월드킹 보물 찾기</h1>
      </div>

      <section
        className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm"
        aria-labelledby="scan-intro-title"
      >
        <h2
          id="scan-intro-title"
          className="flex flex-wrap items-center justify-center gap-2 text-center text-lg font-extrabold text-amber-950"
        >
          <span className="select-none text-2xl" aria-hidden>
            🎪
          </span>
          <span>즐거운 보물찾기 함께해요.</span>
          <span className="select-none text-2xl" aria-hidden>
            🎁
          </span>
        </h2>

        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-center text-xs font-semibold text-amber-800/90">보물 QR 예시</p>
          <Image
            src="/qr-print/WK01.png"
            alt="월드킹 보물 QR 코드 예시. 매장에 붙은 스티커와 비슷한 모양이에요."
            width={168}
            height={168}
            className="rounded-2xl border-2 border-amber-200 bg-white p-2 shadow-md ring-1 ring-amber-100"
            priority
          />
        </div>

        <p className="mt-4 text-center text-base font-semibold leading-relaxed text-slate-800">
          월드킹 여기저기에 위에 같은 보물 QR이 숨어있어요.
        </p>

        <p className="mt-3 rounded-2xl bg-amber-50/90 px-3 py-4 text-center text-base font-semibold leading-relaxed text-slate-800 ring-1 ring-amber-100">
          <span className="select-none text-xl" aria-hidden>
            🗺️
          </span>{" "}
          20개의 보물 중 10개보다 많은 보물을 찾으면{" "}
          <span className="select-none text-xl" aria-hidden>
            🪙
          </span>{" "}
          찾은 만큼 코인을 받을 수 있어요! 즐겁게 보물을 찾은 후 카운터에서{" "}
          <span className="select-none text-xl" aria-hidden>
            🎁
          </span>{" "}
          코인 선물 받아가세요~{" "}
          <span className="select-none text-xl" aria-hidden>
            ✨
          </span>
        </p>

        {error && (
          <p
            className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-900 ring-1 ring-red-100"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onStart}
          disabled={busy}
          className="mt-5 w-full min-h-14 rounded-2xl bg-amber-500 text-lg font-extrabold text-amber-950 shadow-md disabled:opacity-60"
        >
          {busy ? "카메라 확인 중…" : "카메라 사용 동의 후 시작"}
        </button>
      </section>
    </div>
  );
}
