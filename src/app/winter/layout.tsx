import type { Metadata } from "next";
import { Noto_Sans_KR, Song_Myung } from "next/font/google";
import { WinterShell } from "@/components/winter/WinterShell";

const songMyung = Song_Myung({
  variable: "--font-winter-display",
  weight: "400",
  display: "swap",
});

const notoSans = Noto_Sans_KR({
  variable: "--font-winter-body",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "2027 새해 QR 보물찾기 | 월드킹",
  description: "새해 타임어택 QR 보물찾기! 돌림판으로 시간을 정하고 WK01~WK20을 찾아요.",
  robots: { index: false, follow: false },
};

export default function WinterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${songMyung.variable} ${notoSans.variable}`}>
      <WinterShell>{children}</WinterShell>
    </div>
  );
}
