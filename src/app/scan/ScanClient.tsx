"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/Modal";

type ScanClientProps = {
  deviceId: string;
};

type ScannerLike = {
  clear: () => Promise<void>;
  render: (
    onSuccess: (decodedText: string) => void,
    onFailure: (errorMessage: string) => void,
  ) => void;
};

export function ScanClient({ deviceId }: ScanClientProps) {
  const router = useRouter();
  const busy = useRef(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errText, setErrText] = useState("");

  useEffect(() => {
    let cancelled = false;
    let scanner: ScannerLike | null = null;

    void (async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      if (cancelled) return;

      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 8, qrbox: { width: 280, height: 280 } },
        false,
      ) as unknown as ScannerLike;

      if (cancelled) {
        await scanner.clear().catch(() => {});
        return;
      }

      const onSuccess = async (decodedText: string) => {
        if (busy.current) return;
        busy.current = true;
        try {
          const res = await fetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceId, qrPayload: decodedText }),
          });
          const json = (await res.json()) as {
            status?: string;
            message?: string;
            error?: string;
          };

          await scanner?.clear().catch(() => {});

          if (!res.ok) {
            setErrText(
              json.message ??
                (json.error === "unknown_qr"
                  ? "등록되지 않은 QR이에요. 직원에게 문의해 주세요."
                  : "스캔에 실패했어요."),
            );
            setErrOpen(true);
            busy.current = false;
            return;
          }

          if (json.status === "duplicate") {
            setDupOpen(true);
            busy.current = false;
            return;
          }

          router.replace("/");
        } catch {
          await scanner?.clear().catch(() => {});
          setErrText("네트워크 오류가 났어요. 다시 시도해 주세요.");
          setErrOpen(true);
          busy.current = false;
        }
      };

      scanner.render(onSuccess, () => {});
    })();

    return () => {
      cancelled = true;
      void scanner?.clear().catch(() => {});
    };
  }, [deviceId, router]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-2xl border-2 border-amber-200 bg-white px-4 text-base font-extrabold text-amber-900 shadow-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-700"
        >
          ← 홈
        </Link>
        <h1 className="text-xl font-extrabold text-amber-950 sm:text-2xl">QR 보물 찍기</h1>
      </div>

      <ol className="grid gap-2 rounded-2xl border border-amber-100 bg-white/90 p-4 text-base font-semibold text-slate-800 shadow-sm sm:grid-cols-3">
        <li className="flex gap-2 rounded-xl bg-amber-50/80 px-3 py-2">
          <span className="font-extrabold text-amber-700">1</span>
          <span>카메라 허용</span>
        </li>
        <li className="flex gap-2 rounded-xl bg-amber-50/80 px-3 py-2">
          <span className="font-extrabold text-amber-700">2</span>
          <span>QR을 네모 안에</span>
        </li>
        <li className="flex gap-2 rounded-xl bg-amber-50/80 px-3 py-2 sm:col-span-1">
          <span className="font-extrabold text-amber-700">3</span>
          <span>자동으로 홈 이동</span>
        </li>
      </ol>

      <p className="text-base font-medium leading-relaxed text-slate-700">
        보물 QR을 화면 중앙 네모에 맞추면 자동으로 인식돼요. 잠시만 기다려 주세요.
      </p>

      <div
        id="qr-reader"
        className="min-h-[280px] overflow-hidden rounded-3xl bg-white shadow-md ring-2 ring-amber-200/60"
      />

      <Modal
        open={dupOpen}
        title="이미 찾은 보물이에요!"
        onClose={() => {
          setDupOpen(false);
          router.push("/");
        }}
      >
        <p>이 QR은 이미 찾았어요. 다른 보물을 찾아볼까요?</p>
      </Modal>

      <Modal
        open={errOpen}
        title="알림"
        onClose={() => {
          setErrOpen(false);
          router.push("/");
        }}
      >
        <p>{errText}</p>
      </Modal>
    </div>
  );
}
