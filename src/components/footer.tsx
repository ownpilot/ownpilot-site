'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Heart, ArrowRight } from 'lucide-react';
import { Github } from './github-icon';
import { Brand } from './brand';
import { REPO, SITE_REPO, VERSION } from '@/lib/site';
export function Footer() {
  const mark = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = mark.current;
    if (!svg || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => { if(entries.some(e => e.isIntersecting)) { svg.dataset.motion = 'draw'; observer.disconnect(); } }, {threshold: .4});
    observer.observe(svg); return () => observer.disconnect();
  }, []);
  const links = {
    Explore: [['Features','/#features'],['How it works','/#how-it-works'],['Integrations','/integrations/'],['Changelog','/changelog/']],
    Build: [['Get started','/docs/getting-started/'],['Architecture','/docs/architecture/'],['Security & privacy','/docs/security/'],['Brand assets','/brand/']],
    'Open source': [['GitHub',REPO],['Contributing',`${REPO}/blob/main/CONTRIBUTING.md`],['Report an issue',`${REPO}/issues`],['MIT license',`${REPO}/blob/main/LICENSE`]],
  };
  return <footer className="site-footer"><div className="container"><div className="footer-main"><div className="footer-brand"><Brand/><p>A little more intelligence.<br/>A lot more independence.</p><a className="footer-release" href={`${REPO}/releases/tag/v${VERSION}`}><span className="status-dot"/>v{VERSION}<span>Open source. Always yours.</span></a></div>{Object.entries(links).map(([title, items]) => <div className="footer-column" key={title}><h3>{title}</h3>{items.map(([label, href]) => href.startsWith('/') ? <Link key={label} href={href}>{label}</Link> : <a key={label} href={href} target="_blank" rel="noreferrer">{label}<ArrowUpRight size={11}/></a>)}</div>)}</div>
    <div className="studio-card"><a href="https://oxog.net/" aria-label="Visit OXOGNET" target="_blank" rel="noreferrer" className="studio-logo"><svg ref={mark} className="studio-symbol" viewBox="0 0 200 130" fill="none" aria-hidden="true"><path d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103" stroke="var(--oxog-pink)" strokeWidth="12"/><path d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27" stroke="var(--oxog-pink)" strokeWidth="12"/><path d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7" stroke="var(--oxog-purple)" strokeWidth="15" strokeLinecap="round"/><path d="m74 87 54-51" stroke="var(--oxog-pink)" strokeWidth="12" strokeLinecap="square"/></svg></a><div className="studio-copy"><span className="eyebrow">INDEPENDENT MINDS. SHARED CURIOSITY.</span><a className="studio-wordmark" href="https://oxog.net/" target="_blank" rel="noreferrer">oxog<span>net</span><b>.</b><ArrowUpRight size={24}/></a><p>From the OXOGNET ecosystem. AI agents, developer tools, and the infrastructure that connects them.</p></div><a className="studio-explore" href="https://oxog.net/" target="_blank" rel="noreferrer">Meet the makers<ArrowRight size={18}/></a></div>
    <div className="footer-bottom"><span>© 2026 OwnPilot contributors</span><span className="footer-made"><Heart size={12}/> Built for the freedom to build.</span><a href={SITE_REPO} target="_blank" rel="noreferrer"><Github size={13}/>Website source<ArrowUpRight size={11}/></a></div></div></footer>;
}
