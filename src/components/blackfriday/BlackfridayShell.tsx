"use client";

import { useEffect } from "react";

const FONT = 'system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

export function BlackfridayShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const body = document.body;
    const previous = {
      background: body.style.background,
      color: body.style.color,
      fontFamily: body.style.fontFamily,
    };
    body.style.background = "#000000";
    body.style.color = "#ffffff";
    body.style.fontFamily = FONT;
    return () => {
      body.style.background = previous.background;
      body.style.color = previous.color;
      body.style.fontFamily = previous.fontFamily;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-black text-white" style={{ fontFamily: FONT }}>
      {children}
    </div>
  );
}
