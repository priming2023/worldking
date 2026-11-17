"use client";

type Props = {
  open: boolean;
  title: string;
  subtitle: string;
  onDone: () => void;
};

export function WinterBombFx({ open, title, subtitle, onDone }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1524]/88 px-6">
      <div className="relative w-full max-w-sm text-center">
        <div className="winter-boom-burst absolute inset-0 flex items-center justify-center text-7xl" aria-hidden>
          💥
        </div>
        <div className="relative pt-16">
          <p className="text-5xl" aria-hidden>
            🧨
          </p>
          <h2 className="winter-title mt-4 text-3xl font-bold text-white">{title}</h2>
          <p className="mt-2 text-sm text-white/80">{subtitle}</p>
          <button type="button" onClick={onDone} className="winter-btn-primary mt-6 w-full rounded-2xl py-3">
            코인 확인하기
          </button>
        </div>
      </div>
    </div>
  );
}
