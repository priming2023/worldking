/**
 * 중복 QR 안내 시 짧게 재생하는 아쉬운 느낌의 효과음 (별도 음원 파일 없음, Web Audio API).
 * 브라우저·기기에 따라 음소거·저전력 모드·자동재생 정책으로 재생되지 않을 수 있음.
 */
export async function playDuplicateDisappointedSound(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;

    const ctx = new AC();
    await ctx.resume().catch(() => {});

    const t0 = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.11;
    master.connect(ctx.destination);

    const makeSigh = (start: number, startHz: number, endHz: number, dur: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(startHz, start);
      osc.frequency.exponentialRampToValueAtTime(endHz, start + dur);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(1, start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.008, start + dur + 0.05);
      osc.connect(g);
      g.connect(master);
      osc.start(start);
      osc.stop(start + dur + 0.08);
    };

    makeSigh(t0, 360, 220, 0.22);
    makeSigh(t0 + 0.2, 300, 180, 0.26);

    window.setTimeout(() => {
      void ctx.close();
    }, 700);
  } catch {
    /* 재생 불가 시 무시 */
  }
}
