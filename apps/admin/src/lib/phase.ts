import { redirect } from "next/navigation";

// Phase 1 delivery = public site + admin panel limited to blog authoring only
// (write & edit posts). Phase 2+ unlocks Books, Videos, Content, Newsletter,
// Social, Community, Dashboard, Settings. Controlled by the ADMIN_PHASE env
// var on the admin Vercel project; any value other than "1" unlocks everything.
export const PHASE_1 = process.env.ADMIN_PHASE === "1";

// Guard for Phase-2-only pages/routes so a direct URL still redirects even
// when the sidebar tab is hidden.
export function assertPhase2() {
  if (PHASE_1) redirect("/admin");
}
