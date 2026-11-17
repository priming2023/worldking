"use client";

import { useEffect, useRef } from "react";

/** 1분 이하일 때 Web Audio로 똑딱 소리 재생 */
export function useWinterTickSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: number | undefined;

    const playTick = (high: boolean) => {
      try {
        const ctx = ctxRef.current ?? new AudioContext();
        ctxRef.current = ctx;
        if (ctx.state === "suspended") void ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = high ? 880 : 660;
        gain.gain.value = 0.04;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.stop(ctx.currentTime + 0.09);
      } catch {
        // autoplay / AudioContext 실패 시 무시
      }
    };

    let high = true;
    const loop = () => {
      if (cancelled) return;
      playTick(high);
      high = !high;
      timer = window.setTimeout(loop, 500);
    };
    loop();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [enabled]);
}
