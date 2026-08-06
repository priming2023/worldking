import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "할로윈 미션 관리 | 월드킹",
  robots: { index: false, follow: false },
};

export default function Admin2Layout({ children }: { children: React.ReactNode }) {
  return children;
}
