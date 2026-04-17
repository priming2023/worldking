/** Chromium·웨일 등: OS에 내장된 바코드 인식(Shape Detection). iOS Safari는 보통 false. */
export async function shouldUseNativeBarcodeDetector(): Promise<boolean> {
  if (typeof globalThis === "undefined") return false;
  if (!("BarcodeDetector" in globalThis)) return false;
  try {
    const BD = (
      globalThis as unknown as {
        BarcodeDetector: {
          getSupportedFormats?: () => Promise<string[]>;
        };
      }
    ).BarcodeDetector;
    const formats = await BD.getSupportedFormats?.();
    return Boolean(formats?.includes("qr_code"));
  } catch {
    return false;
  }
}
