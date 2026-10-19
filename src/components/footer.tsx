import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import { OxogStudio } from './oxog-studio';
import { REPO, VERSION } from '@/lib/site';
export function Footer() {
  const links = {
    Explore: [
      ['Features', '/#features'],
      ['How it works', '/#how-it-works'],
      ['Integrations', '/integrations/'],
      ['Changelog', '/changelog/'],
    ],
    Build: [
      ['Get started', '/docs/getting-started/'],
      ['Architecture', '/docs/architecture/'],
      ['Security & privacy', '/docs/security/'],
      ['Brand assets', '/brand/'],
    ],
    'Open source': [
      ['GitHub', REPO],
      ['Contributing', `${REPO}/blob/main/CONTRIBUTING.md`],
      ['Report an issue', `${REPO}/issues`],
      ['MIT license', `${REPO}/blob/main/LICENSE`],
    ],
  };
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Brand />
            <p>
              A little more intelligence.
              <br />A lot more independence.
            </p>
            <a className="footer-release" href={`${REPO}/releases/tag/v${VERSION}`}>
              <span className="status-dot" />v{VERSION}
              <span>Open source. Always yours.</span>
            </a>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div className="footer-column" key={title}>
              <h3>{title}</h3>
              {items.map(([label, href]) =>
                href.startsWith('/') ? (
                  <Link key={label} href={href}>
                    {label}
                  </Link>
                ) : (
                  <a key={label} href={href} target="_blank" rel="noreferrer">
                    {label}
                    <ArrowUpRight size={11} />
                  </a>
                ),
              )}
            </div>
          ))}
        </div>
        <OxogStudio />
        <div className="footer-bottom">
          <span>© 2026 OwnPilot contributors.</span>
          <span>MIT · Made to be yours.</span>
          <a href={`${REPO}/releases/tag/v${VERSION}`}>
            v{VERSION}
            <ArrowUpRight size={11} />
          </a>
        </div>
      </div>
    </footer>
  );
}
