import { redirect } from "next/navigation";

export default function LegacyFirstTimeGuidePage() {
  redirect("/guides");
}
