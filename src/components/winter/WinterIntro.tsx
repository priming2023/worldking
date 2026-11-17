export function WinterIntro() {
  return (
    <section className="winter-card rounded-3xl px-5 py-5 text-left">
      <h2 className="text-lg font-bold text-[var(--winter-gold)]">게임방법</h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-white/90">
        <li>돌림판으로 제한 시간을 정해요.(5~15분)</li>
        <li>숨겨진 보물(QR코드)을 찾아요. (총 20개)</li>
        <li>찾은 갯수만큼 카운터에서 코인을 받아요.</li>
      </ol>
      <ul className="mt-3 space-y-1 text-sm text-white/75">
        <li>- 어린이 1명당 1회만 참여 가능해요.</li>
        <li>- 인스타그램 팔로워 이벤트예요.</li>
      </ul>
    </section>
  );
}
