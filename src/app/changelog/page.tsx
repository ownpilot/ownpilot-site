import { pageMetadata } from '@/lib/metadata';
import { ArrowUpRight, GitCommitHorizontal, Radio } from 'lucide-react';
import { REPO, VERSION } from '@/lib/site';
export const metadata = pageMetadata(
  'A little more capable, every release',
  'Follow OwnPilot releases, the current stable version and the official project changelog.',
  '/changelog/',
);
export default function Changelog() {
  return (
    <main id="main" className="container listing-page changelog-page">
      <header className="page-intro">
        <span className="eyebrow">
          <Radio size={13} /> ALWAYS A LITTLE MORE CAPABLE.
        </span>
        <h1>
          The next chapter.
          <br />
          <span className="text-muted">Written in the open.</span>
        </h1>
        <p>
          Real changes. Public source. Follow the product’s progress, straight from the repository.
        </p>
      </header>
      <article className="release-entry">
        <div>
          <span className="release-version">v{VERSION}</span>
          <span className="release-stable">
            <span className="status-dot" />
            LATEST STABLE
          </span>
          <time dateTime="2026-06-23">June 23, 2026</time>
        </div>
        <div>
          <h2>OwnPilot v{VERSION}</h2>
          <p>
            The current stable product release. The project’s full release notes and changelog
            record the exact changes, fixes and upgrade details.
          </p>
          <p>
            This website covers the documented platform: Claw and Soul agents, multi-provider
            inference, tools, personal data, workflows and communication channels. Feature
            descriptions are based on a verified source snapshot rather than a reconstructed release
            history.
          </p>
          <div className="release-links">
            <a
              className="button button-primary"
              href={`${REPO}/releases/tag/v${VERSION}`}
              target="_blank"
              rel="noreferrer"
            >
              Read official release notes
              <ArrowUpRight size={15} />
            </a>
            <a
              className="text-link"
              href={`${REPO}/blob/main/CHANGELOG.md`}
              target="_blank"
              rel="noreferrer"
            >
              Full changelog
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </article>
      <div className="release-follow">
        <GitCommitHorizontal size={25} />
        <div>
          <h2>Follow what’s taking shape.</h2>
          <p>
            Issues and pull requests show work in progress. Planned work is not a promise of an
            available feature.
          </p>
        </div>
        <a className="text-link" href={`${REPO}/releases`} target="_blank" rel="noreferrer">
          All releases
          <ArrowUpRight size={14} />
        </a>
      </div>
    </main>
  );
}
