"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BlackfridayComplete } from "@/components/blackfriday/BlackfridayComplete";
import { useBlackfridayDeviceId } from "@/hooks/blackfriday/useBlackfridayDeviceId";

export function BlackfridayCompleteGate() {
  const deviceId = useBlackfridayDeviceId();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!deviceId) return;
    let cancelled = false;
    void fetch(`/api/blackfriday/me?deviceId=${deviceId}`)
      .then((res) => res.json())
      .then((data: { missionComplete?: boolean }) => {
        if (cancelled) return;
        if (!data.missionComplete) {
          router.replace("/blackfriday");
          return;
        }
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [deviceId, router]);

  if (!ready) {
    return <p className="px-4 py-8 text-center text-sm text-[#E8C170]">불러오는 중…</p>;
  }
  return <BlackfridayComplete />;
}
