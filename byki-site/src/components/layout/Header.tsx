"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS } from "@/lib/constants";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "bg-transparent"
          }
        `}
      >
        <div className="mx-auto flex h-28 max-w-[1200px] items-center justify-between px-5 md:px-8 lg:px-12">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center gap-2">
            <Image
              src="/images/brand/byki-logo.png"
              alt="BYKI"
              width={330}
              height={96}
              className="h-24 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  text-[15px] font-normal transition-colors duration-200
                  ${scrolled ? "text-byki-dark-gray hover:text-byki-black" : "text-byki-dark-gray hover:text-byki-black"}
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#download"
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-byki-dark-green to-byki-light-green px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(40,181,95,0.3)]"
            >
              Download BYKI
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-0.5">
                <path d="M1 13L13 1M13 1H3M13 1v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="flex w-5 flex-col gap-[5px]">
              <span
                className={`block h-[1.5px] w-full bg-byki-black transition-all duration-300 origin-center ${
                  mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-byki-black transition-all duration-300 ${
                  mobileOpen ? "opacity-0 scale-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-byki-black transition-all duration-300 origin-center ${
                  mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col pt-20 px-6 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-lg font-normal text-byki-black border-b border-byki-medium-gray/50 transition-colors hover:text-byki-green"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8">
            <Link
              href="#download"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-byki-dark-green to-byki-light-green px-6 py-3.5 text-base font-bold text-white"
            >
              Download BYKI
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
