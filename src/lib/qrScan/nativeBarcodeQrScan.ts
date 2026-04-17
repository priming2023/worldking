export type QrScanStopper = { stop: () => void };

const INTERVAL_MS = 130;

/**
 * getUserMedia + video + BarcodeDetector 주기 호출. UI·워커 파일 없음.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector
 * @see https://whale.dev/tutorials/barcodeDetection/ (국내 브라우저 가이드)
 */
export async function startNativeBarcodeQrScan(
  video: HTMLVideoElement,
  facingMode: "environment" | "user",
  onCode: (text: string) => void,
): Promise<QrScanStopper> {
  const BD = (
    globalThis as unknown as {
      BarcodeDetector: new (opts?: { formats?: string[] }) => {
        detect(image: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
      };
    }
  ).BarcodeDetector;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: facingMode } },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();

  const detector = new BD({ formats: ["qr_code"] });
  let stopped = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  timer = setInterval(() => {
    if (stopped || video.readyState < 2) return;
    void detector.detect(video).then(
      (results) => {
        const v = results[0]?.rawValue;
        if (v) onCode(v);
      },
      () => {},
    );
  }, INTERVAL_MS);

  return {
    stop: () => {
      stopped = true;
      if (timer) clearInterval(timer);
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    },
  };
}
