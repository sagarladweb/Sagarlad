"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Menu,
  X,
  ChevronRight,
  BookOpen,
  BookMarked,
  Compass,
  MessageSquareQuote,
  Film,
  FileText,
  Library,
  Mic2,
  User,
  Mail,
  ChevronDown,
} from "lucide-react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa6";

const HEADER_SOCIALS = ["instagram", "linkedin"];

const FALLBACK_BOOKS = [
  {
    title: "The MIND UP Theory: Simple Shift That Will Make You Unshakable",
    tagline: "Mindset",
    image: "https://m.media-amazon.com/images/P/B0GYQ7HBBB.jpg",
    buyUrl: "https://www.amazon.com/dp/B0GYQ7HBBB",
  },
  {
    title: "Level Up with Azure AI Foundry",
    tagline: "Data & AI",
    image: "https://m.media-amazon.com/images/P/B0FHP511FM.jpg",
    buyUrl: "https://www.amazon.com/dp/B0FHP511FM",
  },
  {
    title: "Mastering Databricks Lakehouse Platform",
    tagline: "Data Engineering",
    image: "https://m.media-amazon.com/images/P/9355511396.jpg",
    buyUrl: "https://www.amazon.com/dp/9355511396",
  },
  {
    title: "Hands-On Azure Data Platform",
    tagline: "Data Platform",
    image: "https://m.media-amazon.com/images/P/9355510306.jpg",
    buyUrl: "https://www.amazon.com/dp/9355510306",
  },
  {
    title: "Modern Data Architecture on Azure",
    tagline: "Architecture",
    image: "https://m.media-amazon.com/images/P/1484297598.jpg",
    buyUrl: "https://www.amazon.com/dp/1484297598",
  },
  {
    title: "Azure Security for Critical Workloads",
    tagline: "Security",
    image: "https://m.media-amazon.com/images/P/1484289358.jpg",
    buyUrl: "https://www.amazon.com/dp/1484289358",
  },
];

type NavBook = {
  id: string;
  type: "PUBLISHED" | "READ" | "EBOOK";
  title: string;
  tagline: string | null;
  author: string | null;
  image: string;
  buyUrl: string | null;
  free: boolean;
};

type ApiBook = {
  id: string;
  type: "PUBLISHED" | "READ" | "EBOOK";
  title: string | null;
  tagline: string | null;
  author: string | null;
  imageUrl: string | null;
  image: string | null;
  buyUrl: string | null;
  free: boolean;
};

const FALLBACK_PUBLISHED: NavBook[] = FALLBACK_BOOKS.map((b) => ({
  id: `fb-${b.title}`,
  type: "PUBLISHED",
  title: b.title,
  tagline: b.tagline,
  author: null,
  image: b.image,
  buyUrl: b.buyUrl,
  free: false,
}));

const SOCIAL_ICONS: Record<string, { icon: typeof FaInstagram; label: string }> = {
  instagram: { icon: FaInstagram, label: "Instagram" },
  linkedin: { icon: FaLinkedinIn, label: "LinkedIn" },
};

type HeaderSocialsProps = {
  light?: boolean;
};

function HeaderSocials({ light = false }: HeaderSocialsProps) {
  const [socials, setSocials] = useState<
    { key: string; href: string; icon: typeof FaInstagram }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/socials")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const found = (data.socials ?? [])
          .filter((s: { icon: string }) => HEADER_SOCIALS.includes(s.icon.toLowerCase()))
          .map((s: { icon: string; href: string }) => ({
            key: s.icon,
            href: s.href,
            icon: SOCIAL_ICONS[s.icon.toLowerCase()].icon,
          }));
        setSocials(found);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!socials.length) return null;
  return (
    <div className="flex items-center gap-1">
      {socials.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={SOCIAL_ICONS[s.key].label}
          className={`p-2 rounded-full transition-colors duration-500 ${
            light
              ? "text-white/80 hover:text-white hover:bg-white/15"
              : "text-muted-foreground hover:text-accent-strong hover:bg-muted"
          }`}
        >
          <s.icon className="w-5 h-5" />
        </a>
      ))}
    </div>
  );
}

function SagarLogo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="relative flex items-center shrink-0"
      aria-label="Sagar Lad home"
    >
      <Image
        src="/logos/site-logo-white.png"
        alt=""
        width={272}
        height={179}
        className={`h-11 w-auto transition-opacity duration-500 ${
          light ? "opacity-100" : "opacity-0"
        }`}
        priority
      />
      <Image
        src="/logos/site-logo.png"
        alt="Sagar Lad"
        width={272}
        height={179}
        className={`absolute top-0 left-0 h-11 w-auto transition-opacity duration-500 ${
          light ? "opacity-0" : "opacity-100"
        }`}
        priority
      />
    </Link>
  );
}

type NavLinkProps = {
  href: string;
  label: string;
  external?: boolean;
  active: boolean;
  onClick?: () => void;
  prefetch?: boolean;
  light?: boolean;
};

function NavLink({ href, label, external, active, onClick, prefetch, light = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={onClick}
      prefetch={prefetch}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium shrink-0 whitespace-nowrap transition-colors duration-500 ${
        active
          ? "bg-brand text-white font-semibold"
          : light
            ? "hover:bg-white/15 text-white"
            : "hover:bg-muted/80 text-foreground"
      }`}
    >
      {label}
      {external && (
        <span aria-hidden="true" className="text-[0.65em] leading-none -translate-y-px">
          ↗
        </span>
      )}
    </Link>
  );
}

// Shared "menu item row" used inside Content/Books flyouts
function FlyoutLink({
  href,
  icon,
  title,
  desc,
  onClick,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc?: string;
  onClick?: () => void;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/80 transition-all"
    >
      <span className="shrink-0 text-brand-light/80 group-hover:text-brand-light">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground group-hover:text-accent-strong transition-colors">
          {title}
        </span>
        {desc && (
          <span className="block text-xs text-muted-foreground leading-snug">
            {desc}
          </span>
        )}
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [publishedBooks, setPublishedBooks] = useState<NavBook[]>(FALLBACK_PUBLISHED);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Over the dark full-screen hero (home + speaking), before scroll & with the
  // mobile menu closed, the transparent bar needs light text to stay readable.
  const heroLight = (pathname === "/" || pathname === "/speaking") && !scrolled && !open;

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setMobileOpen(null);
    setHovered(null);
  }

  useLayoutEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Load published books from the DB so admin-added books show in the header flyout.
  useEffect(() => {
    let cancelled = false;
    async function loadBooks() {
      const r = await fetch("/api/books?type=PUBLISHED");
      if (!r.ok) return [];
      const data = await r.json();
      return (data.books as ApiBook[])
        .filter((b) => b.imageUrl || b.image)
        .map((b) => ({
          id: b.id,
          type: b.type,
          title: b.title ?? "",
          tagline: b.tagline ?? "",
          author: b.author ?? "",
          image: b.imageUrl ?? b.image ?? "",
          buyUrl: b.buyUrl ?? null,
          free: b.free ?? false,
        }));
    }
    loadBooks().then((published) => {
      if (cancelled) return;
      if (published.length) setPublishedBooks(published);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load content categories for the Content flyout
  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data.categories)) return;
        setCategories(data.categories);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (href: string) =>
    href.startsWith("/") && pathname === href;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
          scrolled || open
            ? "bg-background/70 backdrop-blur-md border-b border-border shadow-sm"
            : hovered && heroLight
              ? "bg-black/80 backdrop-blur-md border-b border-white/15 text-white"
              : hovered
                ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
                : heroLight
                  ? "bg-gradient-to-b from-black/60 via-black/25 to-transparent"
                  : "bg-transparent"
        }`}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4"
          aria-label="Main navigation"
        >
          <SagarLogo light={heroLight} />

          <div className="hidden lg:flex items-center gap-1">
            {/* Blogs — topics sub-menu on hover; clicking opens /blog */}
            <div
              className="relative"
              onMouseEnter={() => setHovered("Blogs")}
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                href="/blog"
                onClick={() => setHovered(null)}
                className={`menu-trigger flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-500 ${
                  pathname.startsWith("/blog") ||
                  pathname.startsWith("/content") ||
                  pathname.startsWith("/quotes") ||
                  pathname.startsWith("/videos")
                    ? "bg-brand text-white font-semibold"
                    : heroLight
                      ? "hover:bg-white/15 text-white"
                      : "hover:bg-muted/80 text-foreground"
                }`}
              >
                Blogs
                <ChevronDown
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    hovered === "Blogs" ? "rotate-180" : ""
                  }`}
                />
              </Link>

              {hovered === "Blogs" && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-56 z-50">
                  <div className="rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-lg p-2">
                    <FlyoutLink
                      href="/blog"
                      icon={<FileText className="w-4 h-4" />}
                      title="Blog"
                      onClick={() => setHovered(null)}
                    />
                    <FlyoutLink
                      href="/videos"
                      icon={<Film className="w-4 h-4" />}
                      title="Videos"
                      onClick={() => setHovered(null)}
                    />
                    <FlyoutLink
                      href="/quotes"
                      icon={<MessageSquareQuote className="w-4 h-4" />}
                      title="Quotes"
                      onClick={() => setHovered(null)}
                    />

                    <div className="border-t border-border my-1.5" />

                    <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Topics
                    </p>
                    {categories.length > 0 ? (
                      categories.slice(0, 6).map((c) => (
                        <Link
                          key={c.id}
                          href={`/content/${c.slug}`}
                          onClick={() => setHovered(null)}
                          className="block rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/80 hover:text-accent-strong transition-colors"
                        >
                          {c.name}
                        </Link>
                      ))
                    ) : (
                      <p className="px-3 py-1.5 text-sm text-muted-foreground">
                        Topics coming soon.
                      </p>
                    )}
                    <Link
                      href="/blog"
                      onClick={() => setHovered(null)}
                      className="mt-0.5 block rounded-md px-3 py-1.5 text-xs font-semibold text-accent-strong hover:bg-muted/80 transition-colors"
                    >
                      View all →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Books — clicking opens /books; hover shows sub-pages */}
            <div
              className="relative"
              onMouseEnter={() => setHovered("Books")}
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                href="/books"
                onClick={() => setHovered(null)}
                className={`menu-trigger flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-500 ${
                  isActive("/books") || isActive("/books-read") || isActive("/ebooks")
                    ? "bg-brand text-white font-semibold"
                    : heroLight
                      ? "hover:bg-white/15 text-white"
                      : "hover:bg-muted/80 text-foreground"
                }`}
              >
                Books
                <ChevronDown
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    hovered === "Books" ? "rotate-180" : ""
                  }`}
                />
              </Link>

              {hovered === "Books" && (
                <div className="absolute left-0 top-full pt-2 w-72 z-50">
                  <div className="rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-lg p-1.5 space-y-0.5">
                    {/* Published flyout link */}
                    <div className="group/published relative">
                      <Link
                        href="/books"
                        onClick={() => setHovered(null)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-muted/80 transition-colors text-sm font-medium text-foreground"
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-brand-light/80" />
                          <span>Books I Publish</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground transition-transform" />
                      </Link>
                      <div className="absolute left-full top-0 pl-2 w-[420px] z-50 invisible opacity-0 translate-x-1 pointer-events-none transition-all duration-200 group-hover/published:visible group-hover/published:opacity-100 group-hover/published:translate-x-0 group-hover/published:pointer-events-auto">
                        <div className="rounded-xl border border-border bg-background/98 backdrop-blur-xl shadow-2xl p-3 space-y-2 max-h-[82vh] overflow-y-auto no-scrollbar">
                          <div className="px-2 pt-1 pb-2 border-b border-border flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-accent-strong">
                              Published Books by Sagar Lad
                            </span>
                            <Link
                              href="/books"
                              onClick={() => setHovered(null)}
                              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                            >
                              View All →
                            </Link>
                          </div>
                          <div className="space-y-1.5 pt-1">
                            {publishedBooks.map((b) => (
                              <a
                                key={b.id}
                                href={b.buyUrl ?? "/books"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-muted/80 transition-all group/item"
                              >
                                <div className="relative w-11 h-14 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-brand-light/40 to-brand-light/15 border border-border shadow-sm">
                                  <Image
                                    src={b.image}
                                    alt={b.title}
                                    fill
                                    className="object-contain p-1 transition-transform duration-300 group-hover/item:scale-105"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent-strong block">
                                    {b.tagline}
                                  </span>
                                  <h5 className="text-xs font-bold leading-snug line-clamp-2 text-foreground group-hover/item:text-accent-strong transition-colors">
                                    {b.title}
                                  </h5>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 mr-1" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Books I Read — plain link to /books-read */}
                    <FlyoutLink
                      href="/books-read"
                      icon={<BookMarked className="w-4 h-4" />}
                      title="Books I Read"
                      onClick={() => setHovered(null)}
                    />

                    {/* E-books — plain link to /ebooks */}
                    <FlyoutLink
                      href="/ebooks"
                      icon={<Library className="w-4 h-4" />}
                      title="E-books"
                      onClick={() => setHovered(null)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* About — clicking opens /about; hover shows sub-pages */}
            <div
              className="relative"
              onMouseEnter={() => setHovered("About")}
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                href="/about"
                onClick={() => setHovered(null)}
                className={`menu-trigger flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-500 ${
                  isActive("/about") || isActive("/speaking")
                    ? "bg-brand text-white font-semibold"
                    : heroLight
                      ? "hover:bg-white/15 text-white"
                      : "hover:bg-muted/80 text-foreground"
                }`}
              >
                About
                <ChevronDown
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    hovered === "About" ? "rotate-180" : ""
                  }`}
                />
              </Link>

              {hovered === "About" && (
                <div className="absolute left-0 top-full pt-2 w-72 z-50">
                  <div className="rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-lg p-1.5 space-y-0.5">
                    <FlyoutLink
                      href="/about"
                      icon={<User className="w-4 h-4" />}
                      title="About Me"
                      onClick={() => setHovered(null)}
                    />
                    <FlyoutLink
                      href="/speaking"
                      icon={<Mic2 className="w-4 h-4" />}
                      title="Public Speaking"
                      onClick={() => setHovered(null)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact */}
            <div
              className="relative"
              onMouseEnter={() => setHovered("Contact")}
              onMouseLeave={() => setHovered(null)}
            >
              <NavLink href="/contact" label="Contact" active={isActive("/contact")} light={heroLight} />
            </div>

            {/* Mentorship */}
            <div
              className="relative"
              onMouseEnter={() => setHovered("Mentorship")}
              onMouseLeave={() => setHovered(null)}
            >
              <NavLink href="/mentorship" label="Mentorship" active={isActive("/mentorship")} light={heroLight} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HeaderSocials light={heroLight} />
            <button
              type="button"
              className={`lg:hidden p-2 rounded-full transition-colors duration-500 relative z-[110] ${
                heroLight ? "text-white hover:text-white/80 hover:bg-white/15" : "text-foreground hover:bg-muted"
              }`}
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu — expandable panel dropping from the top */}
      {mounted &&
        createPortal(
          <div
            className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${
              open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div
              className={`absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
                open ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              className={`absolute top-0 inset-x-0 origin-top flex flex-col border-b border-border bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out ${
                open ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
              }`}
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-border shrink-0">
                <Image
                  src="/logos/site-logo.png"
                  alt="Sagar Lad"
                  width={272}
                  height={179}
                  className="h-11 w-auto"
                />
                <button
                  type="button"
                  className="btn-premium p-2 rounded-full hover:bg-muted"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain px-4 py-4 space-y-2">
                <div className="space-y-1">
                  <button
                    type="button"
                    className="btn-premium w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl hover:bg-muted"
                    onClick={() => setMobileOpen((c) => (c === "Blogs" ? null : "Blogs"))}
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-light" /> Blogs
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        mobileOpen === "Blogs" ? "rotate-90 text-brand-light" : ""
                      }`}
                    />
                  </button>
                  {mobileOpen === "Blogs" && (
                    <div className="pl-3 space-y-1 border-l-2 border-brand-light/40 ml-3">
                      <Link
                        href="/blog"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground hover:text-accent-strong rounded-md"
                      >
                        <FileText className="w-4 h-4 text-brand-light" /> All Blogs
                      </Link>
                      <Link
                        href="/videos"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground hover:text-accent-strong rounded-md"
                      >
                        <Film className="w-4 h-4 text-brand-light" /> Videos
                      </Link>
                      <Link
                        href="/quotes"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground hover:text-accent-strong rounded-md"
                      >
                        <MessageSquareQuote className="w-4 h-4 text-brand-light" /> Quotes
                      </Link>
                      <div className="border-t border-border/60 my-1" />
                      {categories.slice(0, 4).map((c) => (
                        <Link
                          key={c.id}
                          href={`/content/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="block px-3 py-1.5 text-sm font-medium text-foreground hover:text-accent-strong rounded-md"
                        >
                          {c.name}
                        </Link>
                      ))}
                      <Link
                        href="/blog"
                        onClick={() => setOpen(false)}
                        className="block px-3 py-1.5 text-xs font-semibold text-accent-strong hover:text-accent-strong rounded-md"
                      >
                        All topics →
                      </Link>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    className="btn-premium w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl hover:bg-muted"
                    onClick={() => setMobileOpen((c) => (c === "Books" ? null : "Books"))}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-brand-light" /> Books
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        mobileOpen === "Books" ? "rotate-90 text-brand-light" : ""
                      }`}
                    />
                  </button>
                  {mobileOpen === "Books" && (
                    <div className="pl-3 space-y-1 border-l-2 border-brand-light/40 ml-3">
                      <Link
                        href="/books"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground hover:text-accent-strong rounded-md"
                      >
                        <BookOpen className="w-4 h-4 text-brand-light" />
                        Books I Publish
                      </Link>
                      <Link
                        href="/books-read"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground hover:text-accent-strong rounded-md"
                      >
                        <BookMarked className="w-4 h-4 text-brand-light" />
                        Books I Read
                      </Link>
                      <Link
                        href="/ebooks"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground hover:text-accent-strong rounded-md"
                      >
                        <Library className="w-4 h-4 text-brand-light" />
                        E-books
                      </Link>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    className="btn-premium w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl hover:bg-muted"
                    onClick={() => setMobileOpen((c) => (c === "About" ? null : "About"))}
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-light" /> About
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        mobileOpen === "About" ? "rotate-90 text-brand-light" : ""
                      }`}
                    />
                  </button>
                  {mobileOpen === "About" && (
                    <div className="pl-3 space-y-1 border-l-2 border-brand-light/40 ml-3">
                      <Link
                        href="/about"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground hover:text-accent-strong rounded-md"
                      >
                        <User className="w-4 h-4 text-brand-light" />
                        About Me
                      </Link>
                      <Link
                        href="/speaking"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground hover:text-accent-strong rounded-md"
                      >
                        <Mic2 className="w-4 h-4 text-brand-light" />
                        Public Speaking
                      </Link>
                    </div>
                  )}
                </div>

                <MobileLink href="/contact" icon={<Mail className="w-4 h-4 text-brand-light" />} label="Contact" onClick={() => setOpen(false)} />

                <MobileLink href="/mentorship" icon={<Compass className="w-4 h-4 text-brand-light" />} label="Mentorship" onClick={() => setOpen(false)} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function MobileLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-foreground hover:text-accent-strong rounded-xl hover:bg-muted transition-colors"
    >
      {icon} {label}
    </Link>
  );
}
