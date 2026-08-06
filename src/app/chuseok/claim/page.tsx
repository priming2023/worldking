"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useChuseokDeviceId } from "@/hooks/chuseok/useChuseokDeviceId";
import { useChuseokMe } from "@/hooks/chuseok/useChuseokMe";

export default function ChuseokClaimPage() {
  const deviceId = useChuseokDeviceId();
  const { data, refresh } = useChuseokMe(deviceId);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!deviceId) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
        <p className="text-lg font-semibold text-chuseok-burgundy">준비 중…</p>
      </main>
    );
  }

  const handleClaim = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/chuseok/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        coinAmount?: number;
        praise?: string;
        message?: string;
      };
      if (!res.ok) {
        setErr(json.message ?? "수령에 실패했어요.");
        return;
      }
      sessionStorage.setItem(
        "worldking_chuseok_last_claim",
        JSON.stringify(json),
      );
      await refresh();
      router.push("/chuseok/gift");
    } catch {
      setErr("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  const coins = data?.expectedCoins ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8">
      <Link href="/chuseok" className="text-chuseok-burgundy font-bold">
        ← 홈
      </Link>
      <h1 className="chuseok-title text-2xl font-extrabold text-chuseok-burgundy">
        코인 받기
      </h1>

      {data?.claimedToday ? (
        <div className="chuseok-card rounded-3xl p-6 text-center">
          <p className="text-lg font-bold text-chuseok-burgundy">
            오늘은 이미 {data.todayClaim?.coinAmount}코인을 받았어요!
          </p>
        </div>
      ) : data?.canClaim ? (
        <div className="chuseok-card-highlight rounded-3xl p-6 text-center">
          <p className="text-sm font-bold text-chuseok-gold">받을 코인</p>
          <p className="mt-2 text-5xl font-extrabold tabular-nums text-chuseok-burgundy">
            {coins}
          </p>
          <p className="mt-2 text-sm font-semibold text-chuseok-burgundy/80">
            카운터에서 직원에게 보여 주세요
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleClaim()}
            className="chuseok-btn-primary mt-6 w-full rounded-2xl py-4 text-lg font-extrabold disabled:opacity-50"
          >
            {loading ? "처리 중…" : "코인 받기 확인"}
          </button>
        </div>
      ) : (
        <div className="chuseok-card rounded-3xl p-6 text-center">
          <p className="font-bold text-chuseok-burgundy">
            아직 받을 수 있는 코인이 없어요.
          </p>
          <p className="mt-2 text-sm text-chuseok-burgundy/70">
            보물을 5개 이상 찾으면 카운터에서 받을 수 있어요.
            <br />
            순서대로 10개면 20코인!
          </p>
        </div>
      )}

      {err && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-800" role="alert">
          {err}
        </p>
      )}
    </main>
  );
}
