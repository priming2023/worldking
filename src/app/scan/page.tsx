"use client";

import { useDeviceId } from "@/hooks/useDeviceId";
import { ScanClient } from "./ScanClient";

export default function ScanPage() {
  const deviceId = useDeviceId();

  if (!deviceId) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 items-center justify-center px-4 py-10">
        <p className="text-lg text-slate-700">준비 중…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <ScanClient deviceId={deviceId} />
    </main>
  );
}
