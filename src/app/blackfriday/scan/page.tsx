import { BlackfridayClosed } from "@/components/blackfriday/BlackfridayClosed";
import { BlackfridayScanClient } from "@/components/blackfriday/BlackfridayScanClient";
import { isBlackfridayOpen } from "@/lib/blackfriday/period";

export default function BlackfridayScanPage() {
  if (!isBlackfridayOpen()) return <BlackfridayClosed />;
  return <BlackfridayScanClient />;
}
