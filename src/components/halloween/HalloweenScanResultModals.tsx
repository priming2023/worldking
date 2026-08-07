"use client";

import Link from "next/link";
import { HalloweenModal } from "@/components/halloween/HalloweenModal";
import { MISSION_TOTAL } from "@/lib/halloween/codes";

type Props = {
  dupOpen: boolean;
  onDupClose: () => void;
  errOpen: boolean;
  errText: string;
  onErrClose: () => void;
  successOpen: boolean;
  successCount: number;
  successCanClaim?: boolean;
  onNextQuiz: () => void;
  canClaim?: boolean;
};

/** 추석 미션 전용 — 기존 /claim·/map 과 연결하지 않음 */
export function HalloweenScanResultModals({
  dupOpen,
  onDupClose,
  errOpen,
  errText,
  onErrClose,
  successOpen,
  successCount,
  successCanClaim = false,
  onNextQuiz,
  canClaim = false,
}: Props) {
  const showClaim = canClaim || successCanClaim;
  const allFound = successCount >= MISSION_TOTAL;

  return (
    <>
      <HalloweenModal open={dupOpen} title="이미 찾은 보물이에요" onClose={onDupClose}>
        <p className="text-center text-lg font-semibold">
          이 QR은 오늘 이미 찾았어요. 다른 미션 QR을 찍어 주세요!
        </p>
      </HalloweenModal>

      <HalloweenModal open={errOpen} title="알림" onClose={onErrClose}>
        <p>{errText}</p>
      </HalloweenModal>

      <HalloweenModal
        open={successOpen}
        title={allFound ? "🎊 보물 10개 완료!" : "✨ 보물을 찾았어요!"}
        onClose={onNextQuiz}
        footer={
          <div className="mt-6 flex flex-col gap-3">
            {!allFound && (
              <button
                type="button"
                onClick={onNextQuiz}
                className="halloween-btn-primary min-h-12 w-full rounded-2xl text-lg font-extrabold"
              >
                다음 퀴즈로
              </button>
            )}
            {showClaim && (
              <Link
                href="/halloween/claim"
                className="halloween-btn-primary flex min-h-12 items-center justify-center rounded-2xl text-lg font-extrabold"
              >
                🪙 코인 받으러 가기
              </Link>
            )}
            {allFound && (
              <Link
                href="/halloween/complete"
                className="halloween-btn-secondary flex min-h-12 items-center justify-center rounded-2xl text-lg font-bold"
              >
                축하 화면 보기 🎉
              </Link>
            )}
          </div>
        }
      >
        <div className="space-y-3 text-center">
          <p className="text-4xl" aria-hidden>
            {allFound ? "🎃🎊🏆" : "🪙✨"}
          </p>
          <p className="text-lg font-semibold">
            오늘 찾은 미션 보물{" "}
            <span className="text-2xl font-extrabold tabular-nums text-halloween-gold">
              {successCount}
            </span>
            개!
          </p>
          {allFound && (
            <p className="text-base font-bold text-[#faf5ff]">
              순서 상관없이 10개를 모두 찾았어요! 카운터에서 10코인을 받아 가세요 🎁
            </p>
          )}
          {!allFound && successCanClaim && (
            <p className="text-sm font-semibold text-halloween-gold">
              5개 이상! 카운터에서 코인을 받을 수 있어요 🪙
            </p>
          )}
        </div>
      </HalloweenModal>
    </>
  );
}
