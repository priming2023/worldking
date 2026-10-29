import { BlackfridayClosed } from "@/components/blackfriday/BlackfridayClosed";
import { BlackfridayHome } from "@/components/blackfriday/BlackfridayHome";
import { isBlackfridayOpen } from "@/lib/blackfriday/period";

export default function BlackfridayPage() {
  if (!isBlackfridayOpen()) return <BlackfridayClosed />;
  return <BlackfridayHome />;
}
