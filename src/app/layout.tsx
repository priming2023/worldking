import type { Metadata, Viewport } from "next";
import { Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "월드킹 보물찾기",
  description: "키즈카페 보물 QR을 찾아 모으는 즐거운 미션!",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "월드킹 보물찾기",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/worldking-icon.svg",
    apple: "/worldking-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbbf24",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${nunito.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-900">{children}</body>
    </html>
  );
}
