"use client";

/** iOS·Android·PC에서 카메라 권한을 바꾸는 방법 (한국어) */
export function CameraHelpPanel({ id }: { id?: string }) {
  return (
    <div
      id={id}
      className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-left text-sm leading-relaxed text-slate-800"
    >
      <p className="font-bold text-amber-950">영어로 나오는 창에서 (허용만 기억하면 돼요)</p>
      <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px]">
        <li>
          <strong>Allow</strong> / <strong>While using the app</strong> →{" "}
          <span className="text-amber-900">눌러 주세요 (허용)</span>
        </li>
        <li>
          <strong>Don&apos;t allow</strong> / <strong>Block</strong> → 누르면 카메라가 안
          켜져요
        </li>
        <li>
          PC에서 <strong>카메라 목록</strong>이 나오면 → 목록에서 카메라 하나 고른 뒤{" "}
          <strong>Allow</strong>를 눌러 주세요
        </li>
      </ul>
      <p className="mt-3 text-xs text-slate-600">
        이 창은 <strong>웹사이트가 아니라 휴대폰·브라우저(또는 컴퓨터)</strong>가 띄웁니다. QR
        스캔 라이브러리를 바꿔도 <strong>한글로 바꿀 수 없고</strong>, 기기 언어·브라우저
        표시 언어를 따릅니다. 한글이 보이게 하려면{" "}
        <strong>휴대폰 설정 → 언어를 한국어</strong>로 맞추는 것이 가장 확실해요.
      </p>
      <p className="mt-4 font-bold text-amber-950">카메라 허용을 바꾸는 방법</p>
      <ul className="mt-2 list-inside list-disc space-y-2">
        <li>
          <strong>iPhone·iPad (Safari)</strong> — 주소창 왼쪽 <strong>aA</strong> →{" "}
          <strong>웹사이트 설정</strong> → 카메라 → <strong>허용</strong>. 안 보이면{" "}
          <strong>설정</strong> 앱 → Safari → 카메라·마이크에서 Safari를 켜 주세요.
        </li>
        <li>
          <strong>Android (Chrome)</strong> — 주소창의 <strong>자물쇠·ⓘ</strong> →{" "}
          <strong>권한</strong> 또는 <strong>사이트 설정</strong> → 카메라 <strong>허용</strong>.
        </li>
        <li>
          <strong>컴퓨터 (Chrome)</strong> — 주소창 왼쪽 <strong>자물쇠</strong> → 이 사이트의
          설정 → 카메라 <strong>허용</strong>.
        </li>
      </ul>
      <p className="mt-3 rounded-xl bg-white/80 p-3 text-xs text-slate-600">
        브라우저나 휴대폰이 <strong>영어</strong>로 &quot;Allow camera&quot; 같은 창을 띄울 수
        있어요. <strong>Allow</strong> / <strong>허용</strong>을 누르면 됩니다. (창 언어는
        기기·브라우저 언어 설정을 따릅니다.)
      </p>
    </div>
  );
}
