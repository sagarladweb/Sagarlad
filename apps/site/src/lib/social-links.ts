import { cache } from "react";
import { prisma } from "@/lib/db";

export type SocialLink = {
  id: string;
  key: string;
  label: string;
  handle: string | null;
  href: string;
  icon: string;
  logoUrl: string | null;
  color: string | null;
  sortOrder: number;
};

export const getSiteSocials = cache(async (): Promise<SocialLink[]> => {
  let rows;
  try {
    rows = await prisma.socialLink.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  } catch (err) {
    // Supabase free tier pauses the DB after inactivity; render the site with
    // static socials instead of crashing the page.
    console.warn("[social-links] DB unavailable, using fallback socials:", (err as Error).message);
    return FALLBACK_SOCIALS;
  }
  return rows
    .filter(
      (r) =>
        r.key.toLowerCase() !== "telegram" &&
        r.label.toLowerCase() !== "telegram" &&
        r.icon.toLowerCase() !== "telegram"
    )
    .map((r) => ({
      id: r.id,
      key: r.key,
      label: r.label,
      handle: r.handle,
      href: r.href,
      icon: r.icon,
      logoUrl: r.logoUrl,
      color: r.color,
      sortOrder: r.sortOrder,
    }));
});

export const FALLBACK_SOCIALS: SocialLink[] = [
  {
    id: "fallback-youtube",
    key: "youtube",
    label: "YouTube",
    handle: "@Sagarlad692",
    href: "https://www.youtube.com/@Sagarlad692",
    icon: "youtube",
    logoUrl: null,
    color: "#FF0000",
    sortOrder: 1,
  },
  {
    id: "fallback-instagram",
    key: "instagram",
    label: "Instagram",
    handle: "@grow_with__sagar",
    href: "https://www.instagram.com/grow_with__sagar/",
    icon: "instagram",
    logoUrl: null,
    color: "#E4405F",
    sortOrder: 2,
  },
  {
    id: "fallback-twitter",
    key: "twitter",
    label: "X / Twitter",
    handle: "@azuresagar",
    href: "https://x.com/azuresagar",
    icon: "twitter",
    logoUrl: null,
    color: "#000000",
    sortOrder: 3,
  },
  {
    id: "fallback-facebook",
    key: "facebook",
    label: "Facebook",
    handle: "sagar.lad.96",
    href: "https://www.facebook.com/sagar.lad.96/",
    icon: "facebook",
    logoUrl: null,
    color: "#1877F2",
    sortOrder: 4,
  },
  {
    id: "fallback-reddit",
    key: "reddit",
    label: "Reddit",
    handle: "u/sagar_lad",
    href: "https://www.reddit.com/user/sagar_lad/",
    icon: "reddit",
    logoUrl: null,
    color: "#FF4500",
    sortOrder: 5,
  },
  {
    id: "fallback-linkedin",
    key: "linkedin",
    label: "LinkedIn",
    handle: "ladsagar",
    href: "https://www.linkedin.com/in/ladsagar",
    icon: "linkedin",
    logoUrl: null,
    color: "#0A66C2",
    sortOrder: 6,
  },
  {
    id: "fallback-medium",
    key: "medium",
    label: "Medium",
    handle: "sagu94271",
    href: "https://sagu94271.medium.com/",
    icon: "medium",
    logoUrl: null,
    color: "#000000",
    sortOrder: 7,
  },
  {
    id: "fallback-sessionize",
    key: "sessionize",
    label: "Sessionize",
    handle: "sagar-lad",
    href: "https://sessionize.com/sagar-lad/",
    icon: "sessionize",
    logoUrl: null,
    color: "#000000",
    sortOrder: 8,
  },
];