import type { Metadata } from "next";
import { Creepster, Noto_Serif_KR } from "next/font/google";
import { HalloweenShell } from "@/components/halloween/HalloweenShell";

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const creepster = Creepster({
  variable: "--font-creepster",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "할로윈 QR 퀴즈미션 | 월드킹",
  description: "할로윈 귀신·괴물 퀴즈와 QR 보물찾기! 순서대로 찾으면 20코인!",
  robots: { index: false, follow: false },
};

export default function HalloweenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${notoSerif.variable} ${creepster.variable}`}>
      <HalloweenShell>{children}</HalloweenShell>
    </div>
  );
}
