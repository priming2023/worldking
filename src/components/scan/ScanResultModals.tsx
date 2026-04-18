"use client";

import Link from "next/link";
import { Modal } from "@/components/Modal";

type Props = {
  dupOpen: boolean;
  onDupClose: () => void;
  errOpen: boolean;
  errText: string;
  onErrClose: () => void;
  successOpen: boolean;
  successCount: number;
  onSuccessContinue: () => void;
  onSuccessClose: () => void;
};

export function ScanResultModals({
  dupOpen,
  onDupClose,
  errOpen,
  errText,
  onErrClose,
  successOpen,
  successCount,
  onSuccessContinue,
  onSuccessClose,
}: Props) {
  return (
    <>
      <Modal open={dupOpen} title="이미 찾은 보물이에요" onClose={onDupClose}>
        <p>이 QR은 이미 찾은 보물이에요. 다른 보물 QR을 찍어 주세요.</p>
      </Modal>

      <Modal open={errOpen} title="알림" onClose={onErrClose}>
        <p>{errText}</p>
      </Modal>

      <Modal
        open={successOpen}
        title="🎉 새 보물을 찾았어요! 🏆"
        onClose={onSuccessClose}
        footer={
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={onSuccessContinue}
              className="w-full min-h-[3.25rem] rounded-2xl bg-amber-500 py-4 text-lg font-bold text-amber-950 shadow-sm outline-offset-4 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700 active:scale-[0.99]"
            >
              계속 찾기{" "}
              <span className="select-none" aria-hidden>
                🔭
              </span>
            </button>
            <Link
              href="/?openClaim=1"
              className="flex min-h-[3.25rem] items-center justify-center rounded-2xl border-2 border-amber-300 bg-white text-lg font-bold text-amber-900"
            >
              선물받으러 가기{" "}
              <span className="select-none" aria-hidden>
                🎁
              </span>
            </Link>
          </div>
        }
      >
        <div className="space-y-3 text-center">
          <p className="text-xl font-extrabold text-amber-950">
            <span className="select-none" aria-hidden>
              ⭐
            </span>{" "}
            대단해요!{" "}
            <span className="select-none" aria-hidden>
              ✨
            </span>
          </p>
          <p className="rounded-2xl bg-amber-50/95 px-3 py-4 text-lg font-bold leading-snug text-slate-800 ring-1 ring-amber-100">
            <span className="select-none text-2xl" aria-hidden>
              🗺️
            </span>{" "}
            오늘 찾은 보물은{" "}
            <span className="text-2xl font-extrabold text-amber-700 tabular-nums">{successCount}</span>
            개예요!{" "}
            <span className="select-none text-2xl" aria-hidden>
              🪙
            </span>
            <br />
            <span className="mt-2 inline-block text-base font-semibold text-amber-900/90">
              계속 찾아볼까요?{" "}
              <span className="select-none" aria-hidden>
                🎊
              </span>
            </span>
          </p>
        </div>
      </Modal>
    </>
  );
}
