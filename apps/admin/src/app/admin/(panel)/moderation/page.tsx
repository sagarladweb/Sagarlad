import { ModerationPanel } from "@/components/admin/ModerationPanel";
import { assertPhase2 } from "@/lib/phase";

export const dynamic = "force-dynamic";

export default function ModerationPage() {
  assertPhase2();
  return <ModerationPanel />;
}
