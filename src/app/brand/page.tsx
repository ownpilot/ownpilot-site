import type { Metadata } from 'next';
import { ArrowDownToLine, ArrowUpRight } from 'lucide-react';
import { SOURCE } from '@/lib/site';
export const metadata: Metadata = {
  title: 'The OwnPilot identity',
  description: 'OwnPilot logo assets, colors and source attribution.',
  alternates: { canonical: '/brand/' },
  openGraph: { url: '/brand/', title: 'OwnPilot brand assets' },
};
export default function BrandPage() {
  return (
    <main id="main" className="container listing-page">
      <header className="page-intro">
        <span className="eyebrow">A COMPASS FOR YOUR INTELLIGENCE.</span>
        <h1>
          A familiar mark.
          <br />
          <span className="text-muted">A direction of your own.</span>
        </h1>
        <p>
          The OwnPilot compass, shield, and neural core express guidance, ownership, and
          intelligence. Keep the mark’s proportions and blue-to-green character intact.
        </p>
      </header>
      <div className="brand-assets">
        <div className="brand-asset">
          <div className="brand-asset-preview">
            <img
              src="/logo-mark.svg"
              width="150"
              height="168"
              alt="OwnPilot blue and green compass shield logo"
            />
          </div>
          <h2>The OwnPilot mark</h2>
          <p>
            Clean SVG reconstruction of the product’s raster identity. Transparent and scalable.
          </p>
          <a className="text-link" href="/logo-mark.svg" download>
            Download SVG
            <ArrowDownToLine size={15} />
          </a>
        </div>
        <div className="brand-asset">
          <div className="brand-asset-preview brand-original">
            <img
              src="/brand-original.jpeg"
              width="260"
              height="260"
              alt="Original OwnPilot logo with wordmark"
            />
          </div>
          <h2>The original identity</h2>
          <p>
            The reference raster asset from the product repository. Preserved without modification.
          </p>
          <a className="text-link" href="/brand-original.jpeg" download>
            Download original
            <ArrowDownToLine size={15} />
          </a>
        </div>
        <div className="brand-asset">
          <div className="brand-asset-preview">
            <img
              className="social-preview"
              src="/social-card.png"
              width="1200"
              height="630"
              alt="OwnPilot social sharing card"
            />
          </div>
          <h2>A little introduction</h2>
          <p>The site’s social sharing artwork, with space for the message to breathe.</p>
          <a className="text-link" href="/social-card.png" download>
            Download PNG
            <ArrowDownToLine size={15} />
          </a>
        </div>
      </div>
      <div className="brand-palette">
        <div style={{ background: '#2585b2' }}>
          <strong>Compass blue</strong>
          <code>#2585B2</code>
        </div>
        <div style={{ background: '#43b27d', color: '#101b15' }}>
          <strong>Signal green</strong>
          <code>#43B27D</code>
        </div>
        <div style={{ background: '#ef9365', color: '#251b15' }}>
          <strong>Human warmth</strong>
          <code>#EF9365</code>
        </div>
        <div style={{ background: '#111415' }}>
          <strong>Deep focus</strong>
          <code>#111415</code>
        </div>
      </div>
      <p className="source-note">
        The site’s SVG reconstruction follows{' '}
        <a href={`${SOURCE}/ownpilot_logo.jpeg`} target="_blank" rel="noreferrer">
          the original product asset
          <ArrowUpRight size={12} />
        </a>
        . The product repository also contains older alternate marks; this site consistently uses
        the compass identity.
      </p>
    </main>
  );
}
