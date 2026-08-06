"use client";

import { HalloweenHome } from "@/components/halloween/HalloweenHome";
import { useHalloweenDeviceId } from "@/hooks/halloween/useHalloweenDeviceId";

export default function HalloweenPage() {
  const deviceId = useHalloweenDeviceId();

  if (!deviceId) {
    return (
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-10">
        <p className="text-lg font-semibold text-halloween-burgundy" role="status">
          기기 정보를 준비하고 있어요…
        </p>
      </main>
    );
  }

  return <HalloweenHome deviceId={deviceId} />;
}
