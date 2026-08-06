"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HalloweenModal } from "@/components/halloween/HalloweenModal";
import { StaffPinModal } from "@/components/halloween/StaffPinModal";
import { useHalloweenDeviceId } from "@/hooks/halloween/useHalloweenDeviceId";
import { useHalloweenMe } from "@/hooks/halloween/useHalloweenMe";
import { CLAIM_MIN } from "@/lib/halloween/reward";
import { MISSION_TOTAL } from "@/lib/halloween/codes";

const primaryBtn =
  "halloween-btn-primary flex w-full min-h-14 items-center justify-center gap-2 rounded-2xl py-4 text-lg font-extrabold disabled:opacity-60 active:scale-[0.99]";
const secondaryBtn =
  "halloween-btn-secondary flex w-full min-h-12 flex-wrap items-center justify-center gap-2 rounded-2xl px-3 py-3 text-center text-base font-bold";

export default function HalloweenClaimPage() {
  const deviceId = useHalloweenDeviceId();
  const { data, loading, error, refresh } = useHalloweenMe(deviceId);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [claimErr, setClaimErr] = useState<string | null>(null);

  const count = data?.foundCount ?? 0;
  const coins = data?.expectedCoins ?? 0;

  async function confirmClaim(staffPin: string) {
    if (!deviceId) return;
    setBusy(true);
    setClaimErr(null);
    try {
      const res = await fetch("/api/halloween/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, staffPin }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        dateDisplay?: string;
        coinAmount?: number;
        praise?: string;
        error?: string;
      };
      if (!res.ok) {
        if (json.error === "invalid_staff_pin") {
          setClaimErr(json.message ?? "직원 비밀번호가 틀렸어요.");
          return;
        }
        setPinOpen(false);
        setClaimErr(json.message ?? "코인 받기에 실패했어요.");
        await refresh();
        return;
      }
      setPinOpen(false);
      sessionStorage.setItem("worldking_halloween_last_claim", JSON.stringify(json));
      router.push("/halloween/gift");
    } catch {
      setClaimErr("네트워크 오류가 났어요.");
    } finally {
      setBusy(false);
    }
  }

  if (!deviceId) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
        <p className="text-lg font-semibold text-halloween-burgundy" role="status">
          기기 정보를 준비하고 있어요…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 pb-10">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/halloween"
          className="halloween-btn-secondary inline-flex min-h-12 items-center rounded-2xl px-4 text-base font-extrabold shadow-sm"
        >
          ← 홈
        </Link>
      </div>

      {loading && (
        <p className="text-center text-lg font-semibold text-halloween-burgundy/70" role="status">
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
        <section className="halloween-card rounded-3xl p-6 text-center">
          <p className="text-4xl" aria-hidden>
            🎃
          </p>
          <h1 className="halloween-title mt-3 text-2xl font-extrabold text-halloween-burgundy">
            아직 코인을 받을 수 없어요
          </h1>
          <p className="mt-3 text-lg font-medium leading-relaxed text-halloween-burgundy/90">
            보물을 <strong>{CLAIM_MIN}개</strong> 이상 찾으면 코인을 받을 수 있어요! 🪙✨
          </p>
          <p className="mt-2 text-base text-halloween-burgundy/70">
            지금은 <span className="font-extrabold text-halloween-gold">{count}</span>개 찾았어요.
            목표 {MISSION_TOTAL}개!
          </p>
          <div className="mt-6 grid gap-3">
            <Link href="/halloween/scan?auto=1" className={primaryBtn}>
              <span>보물 더 찾으러 가기</span>
              <span aria-hidden>🔭</span>
            </Link>
            <Link href="/halloween" className={secondaryBtn}>
              홈으로
            </Link>
          </div>
        </section>
      )}

      {!loading && !error && count >= CLAIM_MIN && data?.claimedToday && (
        <section className="halloween-card rounded-3xl p-6 text-center">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <h1 className="halloween-title mt-3 text-2xl font-extrabold text-halloween-burgundy">
            오늘 코인은 이미 받았어요!
          </h1>
          <p className="mt-3 text-lg font-medium text-halloween-burgundy/90">
            {data.todayClaim?.coinAmount != null && (
              <>
                오늘 <strong>{data.todayClaim.coinAmount}코인</strong>을 받았어요.
                <br />
              </>
            )}
            내일 또 미션 놀러 와 주세요 😊🎃
          </p>
          <Link href="/halloween" className={`${primaryBtn} mt-6`}>
            <span>홈으로</span>
            <span aria-hidden>🏠</span>
          </Link>
        </section>
      )}

      {!loading && !error && count >= CLAIM_MIN && !data?.claimedToday && (
        <section className="halloween-card rounded-3xl p-6 shadow-sm">
          <h1 className="halloween-title text-center text-2xl font-extrabold text-halloween-burgundy sm:text-3xl">
            🎁 코인 받기 ✨
          </h1>
          <p className="mt-4 text-center text-4xl font-extrabold tabular-nums text-halloween-gold">
            {coins}코인
          </p>
          <div className="mt-5 rounded-2xl bg-halloween-burgundy/5 px-4 py-5 text-center ring-1 ring-halloween-gold/30">
            <p className="text-lg font-semibold leading-relaxed text-halloween-burgundy">
              ⏰ 오늘은 <strong>한 번만</strong> 코인을 받을 수 있어요.
            </p>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-halloween-burgundy">
              👋😄 카운터 직원에게 <strong>이 화면</strong>을 보여 주세요.
            </p>
          </div>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setClaimErr(null);
                setPinOpen(true);
              }}
              className={primaryBtn}
            >
              <span>네, 받을게요!</span>
              <span aria-hidden>🎊</span>
            </button>
            <Link href="/halloween/scan?auto=1" className={secondaryBtn}>
              <span aria-hidden>👋</span>
              <span>아니요. 더 찾을게요!</span>
              <span aria-hidden>🔭✨</span>
            </Link>
          </div>
        </section>
      )}

      <StaffPinModal
        open={pinOpen}
        busy={busy}
        error={pinOpen ? claimErr : null}
        onClose={() => {
          if (busy) return;
          setPinOpen(false);
          setClaimErr(null);
        }}
        onConfirm={(pin) => void confirmClaim(pin)}
      />

      <HalloweenModal
        open={Boolean(claimErr) && !pinOpen}
        title="안내"
        onClose={() => setClaimErr(null)}
        primaryLabel="알겠어요"
      >
        <p>{claimErr}</p>
      </HalloweenModal>
    </main>
  );
}
