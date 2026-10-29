import { Suspense } from "react";
import { BlackfridayScanClient } from "@/components/blackfriday/BlackfridayScanClient";

export default function BlackfridayScanPage() {
  return (
    <Suspense fallback={<p className="px-4 py-8 text-center text-sm text-[#E8C170]">불러오는 중…</p>}>
      <BlackfridayScanClient />
    </Suspense>
  );
}
