"use client";

import Link from "next/link";
import { CameraHelpPanel } from "@/components/scan/CameraHelpPanel";

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
        <h1 className="text-xl font-extrabold text-amber-950 sm:text-2xl">QR 보물 찍기</h1>
      </div>

      <section
        className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm"
        aria-labelledby="scan-intro-title"
      >
        <h2 id="scan-intro-title" className="text-lg font-extrabold text-amber-950">
          보물 QR을 찍으려면 카메라가 필요해요
        </h2>
        <p className="mt-3 text-base font-medium leading-relaxed text-slate-700">
          다음 화면에서 카메라가 켜지면서 <strong>한 번</strong> 카메라 사용을 물어봅니다. 허용하면
          이 자리에서 보물 QR을 <strong>여러 번 연속</strong>으로 찍을 수 있어요.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          뜨는 창이 영어일 수 있어요 — <strong>Allow</strong> / <strong>허용</strong>만
          골라 주세요. (이 창은 웹앱이 아니라 <strong>기기·브라우저</strong>가 띄우는 것이라
          라이브러리로 한글로 바꿀 수는 없어요. 아래 &quot;카메라가 안 되면…&quot;에 영어
          단어도 정리해 두었어요.)
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
          {busy ? "카메라 확인 중…" : "카메라 사용에 동의하고 시작하기"}
        </button>
      </section>

      <details className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm">
        <summary className="cursor-pointer text-base font-bold text-amber-900">
          카메라가 안 되거나, 예전에 &quot;차단&quot;한 적이 있어요
        </summary>
        <div className="mt-3">
          <CameraHelpPanel />
        </div>
      </details>

      <p className="text-center text-xs text-slate-500">
        HTTPS 주소(지금 이 페이지)에서만 카메라를 쓸 수 있어요.
      </p>
    </div>
  );
}
