"use client";

import { ChuseokHome } from "@/components/chuseok/ChuseokHome";
import { useChuseokDeviceId } from "@/hooks/chuseok/useChuseokDeviceId";

export default function ChuseokPage() {
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

  return <ChuseokHome deviceId={deviceId} />;
}
