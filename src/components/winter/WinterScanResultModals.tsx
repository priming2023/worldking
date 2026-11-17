"use client";

type Props = {
  dupOpen: boolean;
  onDupClose: () => void;
  successOpen: boolean;
  successCount: number;
  successCode: string | null;
  onSuccessContinue: () => void;
};

export function WinterScanResultModals({
  dupOpen,
  onDupClose,
  successOpen,
  successCount,
  successCode,
  onSuccessContinue,
}: Props) {
  if (!dupOpen && !successOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-8 sm:items-center">
      {dupOpen ? (
        <div className="winter-card w-full max-w-sm rounded-3xl p-6 text-center">
          <p className="text-4xl" aria-hidden>
            😿
          </p>
          <h2 className="mt-3 text-xl font-bold">이미 찾은 보물이에요</h2>
          <p className="mt-2 text-sm text-white/80">다른 보물 QR을 찍어 주세요!</p>
          <button type="button" onClick={onDupClose} className="winter-btn-primary mt-5 w-full rounded-2xl py-3">
            확인
          </button>
        </div>
      ) : null}

      {successOpen ? (
        <div className="winter-card w-full max-w-sm rounded-3xl p-6 text-center">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <h2 className="mt-3 text-xl font-bold">새 보물을 찾았어요!</h2>
          {successCode ? (
            <p className="mt-2 text-sm font-semibold text-[var(--winter-gold)]">{successCode}</p>
          ) : null}
          <p className="mt-3 rounded-2xl bg-white/10 px-3 py-4 text-base font-bold">
            오늘 찾은 보물{" "}
            <span className="text-2xl tabular-nums text-[var(--winter-gold)]">{successCount}</span>개
          </p>
          <button
            type="button"
            onClick={onSuccessContinue}
            className="winter-btn-primary mt-5 w-full rounded-2xl py-3"
          >
            계속 찾기
          </button>
        </div>
      ) : null}
    </div>
  );
}
