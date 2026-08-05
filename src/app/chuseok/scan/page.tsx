"use client";

import { ChuseokScanClient } from "./ChuseokScanClient";
import { useChuseokDeviceId } from "@/hooks/chuseok/useChuseokDeviceId";

export default function ChuseokScanPage() {
  const deviceId = useChuseokDeviceId();

  if (!deviceId) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
        <p className="text-lg font-semibold text-chuseok-burgundy" role="status">
          기기 정보를 준비하고 있어요…
        </p>
      </main>
    );
  }

  return <ChuseokScanClient deviceId={deviceId} />;
}
