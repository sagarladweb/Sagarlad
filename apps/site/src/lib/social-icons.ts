import type { ComponentType, SVGProps } from "react";
import {
  FaYoutube,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
  FaFacebookF,
  FaRedditAlien,
  FaTelegram,
  FaMedium,
  FaPodcast,
  SiSessionize,
} from "./icons";

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export const SOCIAL_ICONS: Record<
  string,
  { icon: IconType; color: string; label: string }
> = {
  youtube: { icon: FaYoutube, color: "#FF0000", label: "YouTube" },
  instagram: { icon: FaInstagram, color: "#E4405F", label: "Instagram" },
  twitter: { icon: FaXTwitter, color: "#000000", label: "X / Twitter" },
  linkedin: { icon: FaLinkedinIn, color: "#0A66C2", label: "LinkedIn" },
  facebook: { icon: FaFacebookF, color: "#1877F2", label: "Facebook" },
  reddit: { icon: FaRedditAlien, color: "#FF4500", label: "Reddit" },
  telegram: { icon: FaTelegram, color: "#229ED9", label: "Telegram" },
  medium: { icon: FaMedium, color: "#000000", label: "Medium" },
  podcast: { icon: FaPodcast, color: "#8B5CF6", label: "Podcast" },
  sessionize: { icon: SiSessionize, color: "#000000", label: "Sessionize" },
};

export function socialIcon(key: string) {
  return SOCIAL_ICONS[key] ?? null;
}