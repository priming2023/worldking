"use client";

type Props = {
  open: boolean;
  title: string;
  foundCount: number;
  coins: number;
  canClaim: boolean;
  onClaim: () => void;
};

export function WinterFinishSummary({ open, title, foundCount, coins, canClaim, onClaim }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1524]/90 px-6">
      <div className="relative w-full max-w-sm text-center">
        <div className="winter-boom-burst absolute inset-0 flex items-center justify-center text-7xl" aria-hidden>
          💥
        </div>
        <div className="winter-card relative rounded-3xl px-5 pb-6 pt-10">
          <p className="text-5xl" aria-hidden>
            🧨
          </p>
          <h2 className="winter-title mt-3 text-3xl font-bold text-white">{title}</h2>
          <p className="mt-4 text-base text-white/85">
            보물 <span className="font-bold text-[var(--winter-gold)]">{foundCount}</span>개를 찾았어요
          </p>
          <p className="mt-1 text-2xl font-extrabold text-[var(--winter-gold)]">{coins}코인 수령 가능</p>
          {canClaim ? (
            <button type="button" onClick={onClaim} className="winter-btn-primary mt-6 w-full rounded-2xl py-3.5">
              코인 받으러 가기
            </button>
          ) : (
            <p className="mt-6 text-sm text-white/70">보물을 1개 이상 찾아야 코인을 받을 수 있어요.</p>
          )}
        </div>
      </div>
    </div>
  );
}
