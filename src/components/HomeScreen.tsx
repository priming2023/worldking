"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { pickEncouragement } from "@/lib/encouragement";
import { useDeviceId } from "@/hooks/useDeviceId";
import { useMe } from "@/hooks/useMe";
import { Modal } from "@/components/Modal";
import { ProgressBar } from "@/components/ProgressBar";
import { CompleteTreasureBanner } from "@/components/home/CompleteTreasureBanner";
import { EncouragementCard } from "@/components/home/EncouragementCard";
import { TREASURE_TOTAL } from "@/lib/treasure-codes";

export function HomeScreen() {
  const deviceId = useDeviceId();
  const { data, loading, error, refresh } = useMe(deviceId);
  const router = useRouter();
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const count = data?.foundCount ?? 0;
  const encouragement = useMemo(() => pickEncouragement(count), [count]);

  async function confirmClaim() {
    if (!deviceId) return;
    setClaimBusy(true);
    setClaimError(null);
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
        setClaimOpen(false);
        setClaimError(json.message ?? "선물 받기에 실패했어요.");
        await refresh();
        return;
      }
      sessionStorage.setItem("worldking_last_gift", JSON.stringify(json));
      setClaimOpen(false);
      router.push("/gift");
    } finally {
      setClaimBusy(false);
    }
  }

  if (!deviceId) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
        <p className="text-lg font-semibold text-slate-700" role="status">
          기기 정보를 준비하고 있어요…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 pb-10">
      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-amber-800/85">
          월드킹 보물찾기
        </p>
        <h1
          id="home-progress-label"
          className="mt-2 text-3xl font-extrabold tracking-tight text-amber-950 sm:text-4xl"
        >
          오늘의 보물
        </h1>
        <p className="mt-3 text-lg font-semibold text-slate-800">
          코인{" "}
          <span className="tabular-nums text-2xl font-extrabold text-amber-700">
            {count}
          </span>{" "}
          개 · 목표 {TREASURE_TOTAL}개
        </p>
        <div className="mx-auto mt-5 max-w-md">
          <ProgressBar found={count} labelId="home-progress-label" />
        </div>
        {loading && (
          <p className="mt-2 text-sm font-medium text-slate-500" aria-live="polite">
            불러오는 중…
          </p>
        )}
        {error && (
          <p
            className="mx-auto mt-3 max-w-md rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-900 ring-1 ring-red-100"
            role="alert"
          >
            {error}
          </p>
        )}
      </header>

      {count === 20 && (
        <CompleteTreasureBanner
          claimedToday={Boolean(data?.claimedToday)}
          onGiftClick={() => setClaimOpen(true)}
        />
      )}

      {count < 10 && <EncouragementCard text={encouragement} />}

      {count >= 10 && count < 20 && (
        <section className="grid gap-3 sm:grid-cols-2" aria-label="선물과 스캔">
          <button
            type="button"
            disabled={Boolean(data?.claimedToday)}
            onClick={() => {
              if (data?.claimedToday) return;
              setClaimOpen(true);
            }}
            className="min-h-14 rounded-2xl bg-amber-500 px-4 text-lg font-extrabold text-amber-950 shadow-md outline-offset-4 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
          >
            {data?.claimedToday ? "오늘 선물 완료" : "선물 받아가기"}
          </button>
          <Link
            href="/scan"
            className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-amber-600 bg-white text-lg font-extrabold text-amber-900 shadow-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700 active:scale-[0.99]"
          >
            계속 찾기 (QR)
          </Link>
        </section>
      )}

      {count < 10 && (
        <div className="mt-auto flex flex-col gap-3">
          <Link
            href="/scan"
            className="flex min-h-[3.75rem] items-center justify-center rounded-2xl bg-amber-500 text-xl font-extrabold text-amber-950 shadow-lg outline-offset-4 ring-2 ring-amber-300/50 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800 active:scale-[0.99]"
          >
            QR 보물 찍기
          </Link>
          <p className="text-center text-base font-medium text-slate-600">
            매장 안에 숨어 있는 QR을 카메라로 비춰 주세요.
          </p>
        </div>
      )}

      <footer className="mt-4 text-center">
        <Link
          href="/staff/print-qr"
          className="text-xs font-semibold text-amber-900/45 underline decoration-amber-900/30 underline-offset-2 hover:text-amber-900/70"
        >
          직원용 · QR 인쇄
        </Link>
      </footer>

      <Modal
        open={claimOpen}
        title="선물 받기"
        onClose={() => !claimBusy && setClaimOpen(false)}
        footer={
          <div className="mt-6 grid gap-2">
            <button
              type="button"
              disabled={claimBusy}
              onClick={confirmClaim}
              className="w-full min-h-14 rounded-2xl bg-amber-500 py-4 text-lg font-extrabold text-amber-950 disabled:opacity-60"
            >
              {claimBusy ? "처리 중…" : "네, 받을게요!"}
            </button>
            <button
              type="button"
              disabled={claimBusy}
              onClick={() => setClaimOpen(false)}
              className="w-full min-h-12 rounded-2xl border border-slate-200 py-3 text-base font-semibold text-slate-700"
            >
              취소
            </button>
          </div>
        }
      >
        <p>
          오늘은 <strong>한 번만</strong> 선물을 받을 수 있어요. 카운터 직원에게 이
          화면을 보여 주세요.
        </p>
      </Modal>

      <Modal
        open={Boolean(claimError)}
        title="안내"
        onClose={() => setClaimError(null)}
        primaryLabel="알겠어요"
      >
        <p>{claimError}</p>
      </Modal>
    </main>
  );
}
