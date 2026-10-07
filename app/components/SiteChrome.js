"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  ["Services", "/services"],
  ["Solutions", "/solutions"],
  ["Work", "/work"],
  ["About", "/about"],
  ["Process", "/process"],
  ["Insights", "/insights"],
];

export default function SiteChrome({ children, active = "" }) {
  const [open, setOpen] = useState(false);
  return (
    <main className="site-page">
      <header className="site-nav">
        <Link className="brand" href="/" aria-label="CEVTEXA home">
          <img src="/logo.webp" alt="" />
          <span>CEVTEXA</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => <Link key={href} className={active === label ? "active" : ""} href={href}>{label}</Link>)}
          <Link className={active === "Contact" ? "active" : ""} href="/contact">Contact</Link>
        </nav>
        <Link className="nav-cta" href="/contact">Start a project <span>↗</span></Link>
        <button className={`mobile-menu-button ${open ? "open" : ""}`} type="button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}><i/><i/></button>
      </header>
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        {links.concat([["Contact", "/contact"]]).map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<span>↗</span></Link>)}
      </div>
      {children}
      <footer className="site-footer site-footer-rich">
        <div><div className="footer-brand"><img src="/logo.webp" alt=""/><span>CEVTEXA</span></div><p>Intelligent digital systems for ambitious businesses.</p></div>
        <div className="footer-links"><div><b>Explore</b><Link href="/services">Services</Link><Link href="/work">Work</Link><Link href="/about">About</Link></div><div><b>Connect</b><Link href="/contact">Start a project</Link><Link href="/careers">Careers</Link><a href="mailto:hello@cevtexa.studio">hello@cevtexa.studio</a></div></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} CEVTEXA. All rights reserved.</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span></div>
      </footer>
    </main>
  );
}
