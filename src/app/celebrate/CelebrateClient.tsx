"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDeviceId } from "@/hooks/useDeviceId";
import { useMe } from "@/hooks/useMe";

const btnClass =
  "flex min-h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-amber-500 px-6 text-lg font-extrabold text-amber-950 shadow-md outline-offset-4 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800 active:scale-[0.99]";

export function CelebrateClient() {
  const deviceId = useDeviceId();
  const { data, loading } = useMe(deviceId);
  const router = useRouter();

  useEffect(() => {
    if (loading || !data) return;
    if (data.foundCount < 20) {
      router.replace("/");
    }
  }, [data, loading, router]);

  if (!deviceId || loading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-lg font-semibold text-slate-700" role="status">
          확인 중…
        </p>
      </div>
    );
  }

  if (data.foundCount < 20) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <p className="text-6xl" aria-hidden>
        👑
      </p>
      <h1 className="text-3xl font-extrabold leading-tight text-amber-950 sm:text-4xl">
        당신은 보물찾기의 왕!
      </h1>
      <p className="text-2xl font-extrabold text-orange-600">진정한 월드킹!</p>
      <p className="text-xl font-extrabold text-slate-800">축하합니다!</p>
      <p className="max-w-sm text-lg font-medium leading-relaxed text-slate-600">
        보물 20개를 모두 찾았어요. 정말 대단하고 멋져요!
      </p>
      <Link href="/" className={btnClass}>
        홈으로
      </Link>
    </div>
  );
}
