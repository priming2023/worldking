export function BlackfridayIntro({ onStart }: { onStart: () => void }) {
  return (
    <section className="mt-4 rounded-2xl border border-[#E8C170]/40 px-4 py-4">
      <h2 className="text-lg font-bold text-[#E8C170]">어떻게 하나요?</h2>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/90">
        <li>문제를 맞히면 다음 보물 QR 위치를 알려줘요.</li>
        <li>
          QR 10개를 <strong>순서대로</strong> 찾으면 <strong>20코인</strong>!
        </li>
        <li>
          순서 상관없이 10개를 찾으면 <strong>10코인</strong>.
        </li>
        <li>
          <strong>5개 이상</strong> 찾으면 카운터에서 찾은 개수만큼 받을 수 있어요.
        </li>
        <li>순서를 어기면 x2 코인 찬스는 사라져요. (하루 1회 수령)</li>
      </ul>
      <button
        type="button"
        onClick={onStart}
        className="mt-4 w-full rounded-xl bg-[#E8C170] py-3 text-base font-bold text-black"
      >
        퀴즈 시작하기
      </button>
    </section>
  );
}
