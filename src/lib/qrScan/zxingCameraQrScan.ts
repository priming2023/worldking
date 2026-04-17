import { BrowserQRCodeReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

export type QrScanStopper = { stop: () => void };

/**
 * Google ZXing 브라우저 레이어 — 카메라 스트림만 사용(파일 UI 없음).
 * Safari·iOS 등 BarcodeDetector 미지원 시 폴백.
 */
export async function startZxingCameraQrScan(
  video: HTMLVideoElement,
  deviceId: string | undefined,
  onCode: (text: string) => void,
): Promise<QrScanStopper> {
  const reader = new BrowserQRCodeReader(undefined, {
    delayBetweenScanAttempts: 90,
    delayBetweenScanSuccess: 400,
    tryPlayVideoTimeout: 12000,
  });

  const controls: IScannerControls = await reader.decodeFromVideoDevice(
    deviceId,
    video,
    (result) => {
      if (result) onCode(result.getText());
    },
  );

  return {
    stop: () => {
      controls.stop();
    },
  };
}

/** 후면 우선으로 쓸 수 있는 다른 카메라 deviceId (없으면 undefined) */
export async function findAlternateCameraDeviceId(): Promise<string | undefined> {
  const list = await BrowserQRCodeReader.listVideoInputDevices();
  if (list.length < 2) return undefined;
  const frontish = list.find((d) => /front|user|face|내장|selfie/i.test(d.label));
  if (frontish) return frontish.deviceId;
  const notRear = list.find((d) => !/back|rear|environment|wide|ultra|외장/i.test(d.label));
  return notRear?.deviceId ?? list[1]?.deviceId;
}
