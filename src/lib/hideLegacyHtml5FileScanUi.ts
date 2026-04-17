/**
 * 예전 Html5QrcodeScanner가 남긴 DOM(영어 "Choose image" / 드래그 안내 등)을 숨깁니다.
 * 현재 앱은 카메라(qr-scanner)만 사용합니다.
 */
export function hideLegacyHtml5FileScanUi(): void {
  if (typeof document === "undefined") return;

  const hide = (el: Element | null | undefined) => {
    if (el instanceof HTMLElement) {
      el.style.setProperty("display", "none", "important");
    }
  };

  hide(document.getElementById("html5-qrcode-anchor-scan-type-change"));

  const btn = document.getElementById("html5-qrcode-button-file-selection");
  hide(document.getElementById("html5-qrcode-private-filescan-input"));
  hide(btn);

  const label = document.querySelector('label[for="html5-qrcode-private-filescan-input"]');
  hide(label);
  if (label?.nextElementSibling instanceof HTMLElement) {
    hide(label.nextElementSibling);
  }

  if (!(btn instanceof HTMLElement)) return;

  let n: HTMLElement | null = btn;
  for (let i = 0; i < 12 && n; i++) {
    const border = n.style?.border ?? "";
    if (typeof border === "string" && border.includes("dashed")) {
      n.style.setProperty("display", "none", "important");
      return;
    }
    n = n.parentElement;
  }
}
