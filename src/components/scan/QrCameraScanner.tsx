"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { startNativeBarcodeQrScan } from "@/lib/qrScan/nativeBarcodeQrScan";
import { shouldUseNativeBarcodeDetector } from "@/lib/qrScan/shouldUseNativeBarcodeDetector";
import {
  findAlternateCameraDeviceId,
  startZxingCameraQrScan,
} from "@/lib/qrScan/zxingCameraQrScan";

export type QrCameraScannerHandle = {
  flipCamera: () => void;
};

export type QrCameraFlipMeta = {
  flipDisabled: boolean;
  flipLabel: string;
};

type Props = {
  active: boolean;
  onDecoded: (text: string) => void;
  onCameraError?: (message: string) => void;
  onFlipMeta?: (meta: QrCameraFlipMeta) => void;
};

type Engine = "checking" | "native" | "zxing";

export const QrCameraScanner = forwardRef<QrCameraScannerHandle, Props>(
  function QrCameraScanner({ active, onDecoded, onCameraError, onFlipMeta }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const stopperRef = useRef<{ stop: () => void } | null>(null);
    const zxingAltIdRef = useRef<string | undefined>(undefined);
    const onDecodedRef = useRef(onDecoded);
    onDecodedRef.current = onDecoded;
    const onCameraErrorRef = useRef(onCameraError);
    onCameraErrorRef.current = onCameraError;

    const [engine, setEngine] = useState<Engine>("checking");
    const [nativeFacing, setNativeFacing] = useState<"environment" | "user">("environment");
    /** undefined = 후면 우선(라이브러리 기본), 문자열 = 지정 카메라 */
    const [zxingDeviceId, setZxingDeviceId] = useState<string | undefined>(undefined);
    const [starting, setStarting] = useState(false);
    const [flipBusy, setFlipBusy] = useState(false);

    useEffect(() => {
      if (!active) {
        stopperRef.current?.stop();
        stopperRef.current = null;
        setEngine("checking");
        setNativeFacing("environment");
        setZxingDeviceId(undefined);
        zxingAltIdRef.current = undefined;
        setStarting(false);
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      let cancelled = false;

      void (async () => {
        setStarting(true);
        setEngine("checking");
        try {
          const useNative = await shouldUseNativeBarcodeDetector();
          if (cancelled) return;

          if (useNative) {
            setEngine("native");
            stopperRef.current = await startNativeBarcodeQrScan(
              video,
              nativeFacing,
              (t) => onDecodedRef.current(t),
            );
          } else {
            setEngine("zxing");
            stopperRef.current = await startZxingCameraQrScan(
              video,
              zxingDeviceId,
              (t) => onDecodedRef.current(t),
            );
          }
        } catch (e) {
          const msg =
            e instanceof DOMException && e.name === "NotAllowedError"
              ? "카메라가 거부됐어요. 브라우저 설정에서 이 사이트의 카메라를 허용해 주세요."
              : "카메라를 시작할 수 없어요. 잠시 후 다시 시도해 주세요.";
          onCameraErrorRef.current?.(msg);
        } finally {
          if (!cancelled) setStarting(false);
        }
      })();

      return () => {
        cancelled = true;
        stopperRef.current?.stop();
        stopperRef.current = null;
      };
    }, [active, nativeFacing, zxingDeviceId]);

    const flipCamera = useCallback(async () => {
      if (flipBusy || starting || engine === "checking") return;
      setFlipBusy(true);
      try {
        if (engine === "native") {
          setNativeFacing((f) => (f === "environment" ? "user" : "environment"));
        } else if (engine === "zxing") {
          if (zxingAltIdRef.current === undefined) {
            zxingAltIdRef.current = await findAlternateCameraDeviceId();
          }
          const alt = zxingAltIdRef.current;
          if (!alt) {
            onCameraErrorRef.current?.("이 기기에서는 다른 카메라로 바꿀 수 없어요.");
            return;
          }
          setZxingDeviceId((cur) => (cur === undefined ? alt : undefined));
        }
      } finally {
        setFlipBusy(false);
      }
    }, [engine, flipBusy, starting]);

    useImperativeHandle(
      ref,
      () => ({
        flipCamera: () => {
          void flipCamera();
        },
      }),
      [flipCamera],
    );

    const flipDisabled = flipBusy || starting || engine === "checking";
    const flipLabel = flipBusy ? "카메라 전환 중…" : "카메라 바꾸기 (뒤·앞)";

    useEffect(() => {
      onFlipMeta?.({ flipDisabled, flipLabel });
    }, [onFlipMeta, flipDisabled, flipLabel]);

    return (
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-3xl bg-black shadow-md ring-2 ring-amber-200/60">
          {starting && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 px-4 text-center text-sm font-bold text-white"
              role="status"
              aria-live="polite"
            >
              카메라 여는 중…
            </div>
          )}
          <video
            ref={videoRef}
            className="mx-auto max-h-[min(55vh,420px)] w-full object-cover"
            muted
            playsInline
          />
        </div>
      </div>
    );
  },
);
