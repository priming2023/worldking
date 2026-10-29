"use client";

import { useEffect, useState } from "react";

export function BlackfridayPinModal({
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
      <div className="w-full max-w-sm rounded-2xl border border-[#E8C170]/50 bg-black p-5 text-white">
        <h2 className="text-lg font-bold text-[#E8C170]">직원 확인</h2>
        <p className="mt-2 text-sm">직원이 비밀번호를 입력한 뒤 코인 수령을 확정해 주세요.</p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          disabled={busy}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))}
          placeholder="비밀번호"
          className="mt-4 w-full rounded-xl border border-[#E8C170]/60 bg-black px-4 py-3 text-center text-2xl tracking-[0.35em] text-white outline-none"
        />
        {error ? <p className="mt-2 text-center text-sm text-[#E8C170]">{error}</p> : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => onConfirm(pin)}
          className="mt-4 w-full rounded-xl bg-[#E8C170] py-3 font-bold text-black disabled:opacity-50"
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
