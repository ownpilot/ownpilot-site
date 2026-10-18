import { pageMetadata } from '@/lib/metadata';
import Link from 'next/link';
import { ArrowRight, Plug } from 'lucide-react';
import { IntegrationsBrowser } from '@/components/integrations-browser';
import { REPO } from '@/lib/site';
export const metadata = pageMetadata(
  'Connections without the lock-in',
  'Explore OwnPilot’s documented cloud providers, local model runtimes, channels, MCP, coding agents and app connections.',
  '/integrations/',
);
export default function Integrations() {
  return (
    <main id="main" className="container listing-page">
      <header className="page-intro">
        <span className="eyebrow">
          <Plug size={14} /> BETTER, CONNECTED.
        </span>
        <h1>
          Your favorites.
          <br />
          <span className="text-muted">Working together.</span>
        </h1>
        <p>
          Cloud intelligence or local inference. The tools you trust. The channels you already use.
          OwnPilot brings them into the same conversation.
        </p>
      </header>
      <IntegrationsBrowser />
      <div className="integration-bottom">
        <div>
          <h2>Built for what comes next.</h2>
          <p>
            Connect an OpenAI-compatible endpoint, an external MCP server, or your own extension.
            Credentials, accounts and any provider charges are configured separately.
          </p>
        </div>
        <Link href="/docs/tools/" className="button button-secondary">
          Extend your assistant
          <ArrowRight size={16} />
        </Link>
      </div>
      <p className="source-note">
        Connections are documented in the{' '}
        <a href={`${REPO}/blob/main/README.md`} target="_blank" rel="noreferrer">
          product README
        </a>
        . Availability and capabilities vary by provider and model. Names identify integrations;
        they do not imply a partnership.
      </p>
    </main>
  );
}
