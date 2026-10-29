import type { Metadata, Viewport } from "next";
import { BlackfridayShell } from "@/components/blackfriday/BlackfridayShell";

export const metadata: Metadata = {
  title: "월드킹 블랙프라이데이 보물찾기",
  description: "블랙프라이데이 QR 보물찾기. 10개를 모두 찾으면 코인 20개.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function BlackfridayLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlackfridayShell>{children}</BlackfridayShell>
  );
}
