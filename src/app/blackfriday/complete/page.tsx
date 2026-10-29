import { BlackfridayClosed } from "@/components/blackfriday/BlackfridayClosed";
import { BlackfridayCompleteGate } from "@/components/blackfriday/BlackfridayCompleteGate";
import { isBlackfridayOpen } from "@/lib/blackfriday/period";

export default function BlackfridayCompletePage() {
  if (!isBlackfridayOpen()) return <BlackfridayClosed />;
  return <BlackfridayCompleteGate />;
}
