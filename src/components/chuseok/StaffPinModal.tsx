"use client";

import { useEffect, useRef, useState } from "react";
import { ChuseokModal } from "@/components/chuseok/ChuseokModal";

type Props = {
  open: boolean;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (pin: string) => void;
};

/** 직원 확인용 PIN 입력 (카운터 전용) */
export function StaffPinModal({
  open,
  busy = false,
  error = null,
  onClose,
  onConfirm,
}: Props) {
  const [pin, setPin] = useState("");
  const [localErr, setLocalErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setPin("");
      setLocalErr(null);
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  const submit = () => {
    if (pin.trim().length === 0) {
      setLocalErr("비밀번호를 입력해 주세요.");
      return;
    }
    setLocalErr(null);
    onConfirm(pin.trim());
  };

  const showErr = localErr ?? error;

  return (
    <ChuseokModal
      open={open}
      title="직원 확인"
      onClose={() => {
        if (busy) return;
        onClose();
      }}
      footer={
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="chuseok-btn-primary min-h-12 w-full rounded-2xl text-lg font-extrabold disabled:opacity-60"
          >
            {busy ? "확인 중…" : "확인 완료"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="min-h-11 w-full rounded-2xl border-2 border-chuseok-gold/40 bg-white text-base font-bold text-chuseok-burgundy disabled:opacity-60"
          >
            취소
          </button>
        </div>
      }
    >
      <p className="text-base font-semibold">
        직원이 비밀번호를 입력한 뒤 코인 수령을 확정해 주세요.
      </p>
      <label className="mt-4 block">
        <span className="sr-only">직원 비밀번호</span>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          value={pin}
          disabled={busy}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 8));
            setLocalErr(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="비밀번호"
          className="mt-1 w-full rounded-2xl border-2 border-chuseok-gold/40 bg-white px-4 py-3 text-center text-2xl font-extrabold tracking-[0.35em] text-chuseok-burgundy outline-none focus:border-chuseok-burgundy"
        />
      </label>
      {showErr && (
        <p className="mt-3 text-center text-sm font-bold text-red-700" role="alert">
          {showErr}
        </p>
      )}
    </ChuseokModal>
  );
}
