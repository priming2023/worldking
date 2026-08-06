"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChuseokModal } from "@/components/chuseok/ChuseokModal";
import { useChuseokDeviceId } from "@/hooks/chuseok/useChuseokDeviceId";
import { useChuseokMe } from "@/hooks/chuseok/useChuseokMe";
import { CLAIM_MIN } from "@/lib/chuseok/reward";
import { MISSION_TOTAL } from "@/lib/chuseok/codes";

const primaryBtn =
  "chuseok-btn-primary flex w-full min-h-14 items-center justify-center gap-2 rounded-2xl py-4 text-lg font-extrabold disabled:opacity-60 active:scale-[0.99]";
const secondaryBtn =
  "flex w-full min-h-12 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-chuseok-gold/40 bg-white px-3 py-3 text-center text-base font-bold text-chuseok-burgundy hover:bg-white/80";

export default function ChuseokClaimPage() {
  const deviceId = useChuseokDeviceId();
  const { data, loading, error, refresh } = useChuseokMe(deviceId);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [claimErr, setClaimErr] = useState<string | null>(null);

  const count = data?.foundCount ?? 0;
  const coins = data?.expectedCoins ?? 0;

  async function confirmClaim() {
    if (!deviceId) return;
    setBusy(true);
    setClaimErr(null);
    try {
      const res = await fetch("/api/chuseok/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        dateDisplay?: string;
        coinAmount?: number;
        praise?: string;
      };
      if (!res.ok) {
        setClaimErr(json.message ?? "코인 받기에 실패했어요.");
        await refresh();
        return;
      }
      sessionStorage.setItem("worldking_chuseok_last_claim", JSON.stringify(json));
      router.push("/chuseok/gift");
    } catch {
      setClaimErr("네트워크 오류가 났어요.");
    } finally {
      setBusy(false);
    }
  }

  if (!deviceId) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
        <p className="text-lg font-semibold text-chuseok-burgundy" role="status">
          기기 정보를 준비하고 있어요…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 pb-10">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/chuseok"
          className="inline-flex min-h-12 items-center rounded-2xl border-2 border-chuseok-gold/40 bg-white px-4 text-base font-extrabold text-chuseok-burgundy shadow-sm"
        >
          ← 홈
        </Link>
      </div>

      {loading && (
        <p className="text-center text-lg font-semibold text-chuseok-burgundy/70" role="status">
          불러오는 중…
        </p>
      )}

      {error && (
        <p
          className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-900"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && !error && count < CLAIM_MIN && (
        <section className="chuseok-card rounded-3xl p-6 text-center">
          <p className="text-4xl" aria-hidden>
            🌕
          </p>
          <h1 className="chuseok-title mt-3 text-2xl font-extrabold text-chuseok-burgundy">
            아직 코인을 받을 수 없어요
          </h1>
          <p className="mt-3 text-lg font-medium leading-relaxed text-chuseok-burgundy/90">
            보물을 <strong>{CLAIM_MIN}개</strong> 이상 찾으면 코인을 받을 수 있어요! 🪙✨
          </p>
          <p className="mt-2 text-base text-chuseok-burgundy/70">
            지금은 <span className="font-extrabold text-chuseok-gold">{count}</span>개 찾았어요.
            목표 {MISSION_TOTAL}개!
          </p>
          <div className="mt-6 grid gap-3">
            <Link href="/chuseok/scan?auto=1" className={primaryBtn}>
              <span>보물 더 찾으러 가기</span>
              <span aria-hidden>🔭</span>
            </Link>
            <Link href="/chuseok" className={secondaryBtn}>
              홈으로
            </Link>
          </div>
        </section>
      )}

      {!loading && !error && count >= CLAIM_MIN && data?.claimedToday && (
        <section className="chuseok-card rounded-3xl p-6 text-center">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <h1 className="chuseok-title mt-3 text-2xl font-extrabold text-chuseok-burgundy">
            오늘 코인은 이미 받았어요!
          </h1>
          <p className="mt-3 text-lg font-medium text-chuseok-burgundy/90">
            {data.todayClaim?.coinAmount != null && (
              <>
                오늘 <strong>{data.todayClaim.coinAmount}코인</strong>을 받았어요.
                <br />
              </>
            )}
            내일 또 미션 놀러 와 주세요 😊🌕
          </p>
          <Link href="/chuseok" className={`${primaryBtn} mt-6`}>
            <span>홈으로</span>
            <span aria-hidden>🏠</span>
          </Link>
        </section>
      )}

      {!loading && !error && count >= CLAIM_MIN && !data?.claimedToday && (
        <section className="chuseok-card rounded-3xl p-6 shadow-sm">
          <h1 className="chuseok-title text-center text-2xl font-extrabold text-chuseok-burgundy sm:text-3xl">
            🎁 코인 받기 ✨
          </h1>
          <p className="mt-4 text-center text-4xl font-extrabold tabular-nums text-chuseok-gold">
            {coins}코인
          </p>
          <div className="mt-5 rounded-2xl bg-chuseok-burgundy/5 px-4 py-5 text-center ring-1 ring-chuseok-gold/30">
            <p className="text-lg font-semibold leading-relaxed text-chuseok-burgundy">
              ⏰ 오늘은 <strong>한 번만</strong> 코인을 받을 수 있어요.
            </p>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-chuseok-burgundy">
              👋😄 카운터 직원에게 <strong>이 화면</strong>을 보여 주세요.
            </p>
          </div>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirmClaim()}
              className={primaryBtn}
            >
              <span>{busy ? "처리 중…" : "네, 받을게요!"}</span>
              {!busy && <span aria-hidden>🎊</span>}
            </button>
            <Link href="/chuseok/scan?auto=1" className={secondaryBtn}>
              <span aria-hidden>👋</span>
              <span>아니요. 더 찾을게요!</span>
              <span aria-hidden>🔭✨</span>
            </Link>
          </div>
        </section>
      )}

      <ChuseokModal
        open={Boolean(claimErr)}
        title="안내"
        onClose={() => setClaimErr(null)}
        primaryLabel="알겠어요"
      >
        <p>{claimErr}</p>
      </ChuseokModal>
    </main>
  );
}
