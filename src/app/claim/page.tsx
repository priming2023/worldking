"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeviceId } from "@/hooks/useDeviceId";
import { useMe } from "@/hooks/useMe";
import { Modal } from "@/components/Modal";
import { TREASURE_TOTAL } from "@/lib/treasure-codes";

const primaryBtn =
  "flex w-full min-h-14 items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-lg font-extrabold text-amber-950 shadow-md outline-offset-4 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800 disabled:opacity-60 active:scale-[0.99]";
const secondaryBtn =
  "flex w-full min-h-12 items-center justify-center rounded-2xl border border-slate-200 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50";

export default function ClaimPage() {
  const deviceId = useDeviceId();
  const { data, loading, error, refresh } = useMe(deviceId);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [claimErr, setClaimErr] = useState<string | null>(null);

  const count = data?.foundCount ?? 0;

  async function confirmClaim() {
    if (!deviceId) return;
    setBusy(true);
    setClaimErr(null);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        dateDisplay?: string;
        count?: number;
        praise?: string;
      };
      if (!res.ok) {
        setClaimErr(json.message ?? "선물 받기에 실패했어요.");
        await refresh();
        return;
      }
      sessionStorage.setItem("worldking_last_gift", JSON.stringify(json));
      router.push("/gift");
    } finally {
      setBusy(false);
    }
  }

  if (!deviceId) {
    return (
      <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50 to-amber-100/80">
        <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
          <p className="text-lg font-semibold text-slate-700" role="status">
            기기 정보를 준비하고 있어요…
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50 to-amber-100/80">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-2xl border-2 border-amber-200 bg-white px-4 text-base font-extrabold text-amber-900 shadow-sm"
          >
            ← 홈
          </Link>
        </div>

        {loading && (
          <p className="text-center text-lg font-semibold text-slate-600" role="status">
            불러오는 중…
          </p>
        )}

        {error && (
          <p
            className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-900 ring-1 ring-red-100"
            role="alert"
          >
            {error}
          </p>
        )}

        {!loading && !error && count < 10 && (
          <section className="rounded-3xl border border-amber-200 bg-white p-6 text-center shadow-sm">
            <p className="text-4xl" aria-hidden>
              🧸
            </p>
            <h1 className="mt-3 text-2xl font-extrabold text-amber-950">아직 선물을 받을 수 없어요</h1>
            <p className="mt-3 text-lg font-medium leading-relaxed text-slate-700">
              보물을 <strong className="text-amber-800">10개</strong> 이상 찾으면 코인 선물을 받을 수 있어요!{" "}
              <span className="select-none" aria-hidden>
                🪙✨
              </span>
            </p>
            <p className="mt-2 text-base text-slate-600">
              지금은 <span className="font-extrabold text-amber-700">{count}</span>개 찾았어요. 목표{" "}
              {TREASURE_TOTAL}개!
            </p>
            <div className="mt-6 grid gap-3">
              <Link href="/scan" className={primaryBtn}>
                <span>보물 더 찾으러 가기</span>
                <span className="select-none" aria-hidden>
                  🔭
                </span>
              </Link>
              <Link href="/" className={secondaryBtn}>
                홈으로
              </Link>
            </div>
          </section>
        )}

        {!loading && !error && count >= 10 && data?.claimedToday && (
          <section className="rounded-3xl border border-amber-200 bg-white p-6 text-center shadow-sm">
            <p className="text-4xl" aria-hidden>
              🎉
            </p>
            <h1 className="mt-3 text-2xl font-extrabold text-amber-950">오늘 선물은 이미 받았어요!</h1>
            <p className="mt-3 text-lg font-medium text-slate-700">
              내일 또 보물찾기 놀러 와 주세요{" "}
              <span className="select-none" aria-hidden>
                😊💛
              </span>
            </p>
            <Link href="/" className={`${primaryBtn} mt-6`}>
              <span>홈으로</span>
              <span className="select-none" aria-hidden>
                🏠
              </span>
            </Link>
          </section>
        )}

        {!loading && !error && count >= 10 && !data?.claimedToday && (
          <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm ring-1 ring-amber-100">
            <h1 className="text-center text-2xl font-extrabold text-amber-950 sm:text-3xl">
              <span className="select-none" aria-hidden>
                🎁
              </span>{" "}
              선물 받기{" "}
              <span className="select-none" aria-hidden>
                ✨
              </span>
            </h1>
            <div className="mt-5 rounded-2xl bg-amber-50/90 px-4 py-5 text-center ring-1 ring-amber-100">
              <p className="text-lg font-semibold leading-relaxed text-slate-800">
                <span className="select-none text-2xl" aria-hidden>
                  ⏰
                </span>{" "}
                오늘은 <strong className="text-amber-900">한 번만</strong> 선물을 받을 수 있어요.
              </p>
              <p className="mt-3 text-lg font-semibold leading-relaxed text-slate-800">
                <span className="select-none text-2xl" aria-hidden>
                  👋😄
                </span>{" "}
                카운터 직원에게 <strong>이 화면</strong>을 보여 주세요.
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              <button type="button" disabled={busy} onClick={() => void confirmClaim()} className={primaryBtn}>
                <span>{busy ? "처리 중…" : "네, 받을게요!"}</span>
                {!busy && (
                  <span className="select-none" aria-hidden>
                    🎊
                  </span>
                )}
              </button>
              <Link href="/" className={secondaryBtn}>
                취소
              </Link>
            </div>
          </section>
        )}

        <Modal
          open={Boolean(claimErr)}
          title="안내"
          onClose={() => setClaimErr(null)}
          primaryLabel="알겠어요"
        >
          <p>{claimErr}</p>
        </Modal>
      </main>
    </div>
  );
}
