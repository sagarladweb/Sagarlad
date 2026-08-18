import Image from "next/image";

export function SiteLogo({
  light = false,
  className = "h-10 w-auto",
  priority = false,
}: {
  light?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={light ? "/logos/site-logo-white.png" : "/logos/site-logo.png"}
      alt="Sagar Lad"
      width={272}
      height={179}
      className={className}
      priority={priority}
    />
  );
}
