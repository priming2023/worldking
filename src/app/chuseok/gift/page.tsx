"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ClaimResult = {
  coinAmount?: number;
  praise?: string;
  dateDisplay?: string;
};

export default function ChuseokGiftPage() {
  const [gift, setGift] = useState<ClaimResult | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("worldking_chuseok_last_claim");
      if (raw) {
        setGift(JSON.parse(raw) as ClaimResult);
        sessionStorage.removeItem("worldking_chuseok_last_claim");
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <h1 className="chuseok-title text-3xl font-extrabold text-chuseok-burgundy">
        코인 수령 완료!
      </h1>
      {gift && (
        <>
          <p className="text-5xl font-extrabold tabular-nums text-chuseok-gold">
            {gift.coinAmount}코인
          </p>
          <p className="text-lg font-semibold text-chuseok-burgundy">{gift.praise}</p>
          {gift.dateDisplay && (
            <p className="text-sm text-chuseok-burgundy/70">{gift.dateDisplay}</p>
          )}
        </>
      )}
      <Link
        href="/chuseok"
        className="chuseok-btn-primary flex min-h-14 w-full max-w-xs items-center justify-center rounded-2xl text-lg font-extrabold"
      >
        홈으로
      </Link>
    </main>
  );
}
