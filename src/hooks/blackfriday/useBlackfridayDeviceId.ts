"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "worldking_blackfriday_device_id";

export function useBlackfridayDeviceId(): string | null {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    let stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      stored = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, stored);
    }
    setId(stored);
  }, []);

  return id;
}
