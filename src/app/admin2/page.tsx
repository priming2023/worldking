import { redirect } from "next/navigation";

/** 예전 주소 — /halloween/admin 으로 이동 */
export default function Admin2RedirectPage() {
  redirect("/halloween/admin");
}
