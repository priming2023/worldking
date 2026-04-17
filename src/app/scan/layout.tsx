/** 스캔 페이지 HTML이 오래 캐시되며 구버전 스캐너 UI가 섞이는 것을 줄입니다. */
export const dynamic = "force-dynamic";

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
