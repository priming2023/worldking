"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "worldking_device_id";

function readOrCreate(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function useDeviceId(): string | null {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setId(readOrCreate());
    });
  }, []);

  return id;
}
