"use client";

type Props = {
  open: boolean;
  foundCount: number;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function WinterQuitConfirm({ open, foundCount, busy, onCancel, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-8 sm:items-center">
      <div className="winter-card w-full max-w-sm rounded-3xl p-6 text-center">
        <p className="text-4xl" aria-hidden>
          ⏳
        </p>
        <h2 className="mt-3 text-xl font-bold">정말 그만두시겠습니까?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          지금 그만두면 더 이상 보물을 찾을 수 없어요.
          <br />
          지금까지 찾은 보물 {foundCount}개로 코인을 받아요.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className="winter-btn-primary mt-5 w-full rounded-2xl py-3 disabled:opacity-50"
        >
          {busy ? "종료 중…" : "네, 그만둘게요"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="mt-2 w-full rounded-2xl py-3 text-sm text-white/75 underline"
        >
          아니요, 더 찾을게요
        </button>
      </div>
    </div>
  );
}
