import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import { ChuseokShell } from "@/components/chuseok/ChuseokShell";

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "추석 QR 보물미션 | 월드킹",
  description: "추석 퀴즈와 QR 보물찾기 미션! 순서대로 찾으면 20코인!",
  robots: { index: false, follow: false },
};

export default function ChuseokLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={notoSerif.variable}>
      <ChuseokShell>{children}</ChuseokShell>
    </div>
  );
}
