"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { getLenisInstance } from "@/lib/lenis-instance";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
  { href: "#publications", label: "Publications" },
  { href: "#achievements", label: "Achievements" },
  { href: "#contact", label: "Contact" },
];

export function SiteNav() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y > lastY.current && y > 120) {
        setHidden(true);
        setMenuOpen(false);
      } else {
        setHidden(false);
      }
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#") || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    setMenuOpen(false);

    const lenis = getLenisInstance();
    if (lenis) {
      lenis.scrollTo(target as HTMLElement, {
        offset: -84,
        duration: 1.4,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
    } else {
      const top =
        target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 py-4 transition-colors duration-300 ${
          scrolled
            ? "bg-background/70 backdrop-blur-md border-b border-border/60"
            : "bg-transparent"
        }`}
      >
        <Link
          href="#"
          className={`font-heading text-lg font-semibold tracking-tight ${
            scrolled ? "" : "text-white"
          }`}
        >
          Ahmedh<span className="text-brand">.</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`text-sm transition-colors ${
                scrolled
                  ? "text-foreground/70 hover:text-foreground"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <ThemeToggle
            className={
              scrolled ? undefined : "border-white/25 text-white/80"
            }
          />
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.03]"
          >
            Let&apos;s talk
          </a>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle
            className={
              scrolled ? undefined : "border-white/25 text-white/80"
            }
          />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border ${
              scrolled ? "border-border/60" : "border-white/25 text-white"
            }`}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mx-4 mb-4 flex flex-col gap-1 rounded-2xl border border-border/60 bg-background/95 p-4 backdrop-blur-md lg:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-secondary"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
