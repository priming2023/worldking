"use client";

import { useEffect, useState } from "react";

export function WinterPinModal({
  open,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!open) setPin("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-8 sm:items-center">
      <div className="winter-card w-full max-w-sm rounded-2xl p-5 text-white">
        <h2 className="text-lg font-bold text-[var(--winter-gold)]">직원 확인</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/85">
          카운터에서 직원에게 이 화면을 보여주세요.
          <br />
          (어린이 1명당 1회, 인스타 팔로워 이벤트)
        </p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          disabled={busy}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))}
          placeholder="비밀번호"
          className="mt-4 w-full rounded-xl border border-white/30 bg-[#0c1f33] px-4 py-3 text-center text-2xl tracking-[0.35em] text-white outline-none"
        />
        {error ? <p className="mt-2 text-center text-sm text-[var(--winter-crimson)]">{error}</p> : null}
        <button
          type="button"
          disabled={busy || pin.length < 1}
          onClick={() => onConfirm(pin)}
          className="winter-btn-primary mt-4 w-full rounded-xl py-3 disabled:opacity-50"
        >
          {busy ? "확인 중…" : "확인 완료"}
        </button>
        <button type="button" disabled={busy} onClick={onClose} className="mt-2 w-full py-2 text-sm text-white/70">
          취소
        </button>
      </div>
    </div>
  );
}
