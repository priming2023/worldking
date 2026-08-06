type ChuseokIntroProps = {
  onStart: () => void;
};

export function ChuseokIntro({ onStart }: ChuseokIntroProps) {
  return (
    <section className="chuseok-card rounded-3xl p-5">
      <h2 className="text-lg font-extrabold text-chuseok-burgundy">어떻게 하나요?</h2>
      <ul className="mt-3 space-y-2 text-sm font-semibold leading-relaxed text-chuseok-burgundy/90">
        <li>🌙 추석·민속놀이 퀴즈를 맞히면 보물 QR 위치를 알려줘요.</li>
        <li>🎯 QR 10개를 <strong>순서대로</strong> 찾으면 <strong>20코인</strong>!</li>
        <li>📦 순서 상관없이 10개를 찾으면 <strong>10코인</strong>.</li>
        <li>🪙 <strong>5개 이상</strong> 찾으면 카운터에서 찾은 개수만큼 받을 수 있어요.</li>
        <li>⚠️ 순서를 어기면 20코인 보너스는 없어요. (하루 1회 수령)</li>
      </ul>
      <button
        type="button"
        onClick={onStart}
        className="chuseok-btn-primary mt-4 w-full rounded-2xl py-3 text-base font-extrabold"
      >
        퀴즈 시작하기
      </button>
    </section>
  );
}
