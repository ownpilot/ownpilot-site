import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Info } from 'lucide-react';
import { docs, docGroups } from '@/lib/docs';
import { CodeBlock } from '@/components/code-block';
import { ArchitectureDiagram } from '@/components/hero-system';
import { VERSION } from '@/lib/site';
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(docs).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = docs[slug];
  return doc ? pageMetadata(doc.title, doc.summary, `/docs/${slug}/`) : {};
}
function anchor(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = docs[slug];
  if (!doc) notFound();
  const ordered = Object.values(docs);
  const index = ordered.findIndex((d) => d.slug === slug);
  return (
    <main id="main" className="container docs-layout">
      <aside className="docs-sidebar">
        <Link className="docs-back" href="/">
          <ArrowLeft size={13} />
          Back to the big picture
        </Link>
        <div className="docs-sidebar-title">
          <BookOpen size={16} />
          FIELD NOTES<span>v{VERSION}</span>
        </div>
        <nav aria-label="Documentation">
          {docGroups.map((group) => (
            <div className="docs-group" key={group}>
              <h2>{group}</h2>
              {ordered
                .filter((d) => d.group === group)
                .map((d) => (
                  <Link
                    key={d.slug}
                    href={`/docs/${d.slug}/`}
                    aria-current={d.slug === slug ? 'page' : undefined}
                  >
                    {d.title}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
      </aside>
      <article className="doc-article">
        <div className="doc-breadcrumb">
          <Link href="/docs/getting-started/">Documentation</Link>
          <span>/</span>
          {doc.group}
        </div>
        <header className="doc-heading">
          <span className="eyebrow">THE OWNPILOT FIELD GUIDE</span>
          <h1>{doc.title}</h1>
          <p>{doc.summary}</p>
          <span className="doc-version">
            <span className="status-dot" />
            OwnPilot v{VERSION} · Source-verified guide
          </span>
        </header>
        <nav className="doc-mobile-toc" aria-label="On this page">
          <details>
            <summary>On this page</summary>
            {doc.sections.map((s) => (
              <a href={`#${anchor(s.title)}`} key={s.title}>
                {s.title}
              </a>
            ))}
          </details>
        </nav>
        {slug === 'architecture' && <ArchitectureDiagram />}
        {doc.sections.map((section) => (
          <section className="doc-section" id={anchor(section.title)} key={section.title}>
            <h2>{section.title}</h2>
            {section.text.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            {section.code && <CodeBlock code={section.code} title={section.codeTitle} />}{' '}
            {section.note && (
              <aside className="doc-callout">
                <Info size={18} />
                <p>{section.note}</p>
              </aside>
            )}
          </section>
        ))}
        <div className="doc-sources">
          <span className="eyebrow">
            <Check size={13} />
            FOLLOW THE SOURCE
          </span>
          <p>
            Based on the product’s documented behavior. Check the source for your deployed version.
          </p>
          {doc.sources.map((s) => (
            <a href={s.href} target="_blank" rel="noreferrer" key={s.href}>
              {s.label}
              <ArrowUpRight size={13} />
            </a>
          ))}
        </div>
        <div className="doc-pagination">
          {index > 0 ? (
            <Link href={`/docs/${ordered[index - 1].slug}/`}>
              <span>
                <ArrowLeft size={12} />
                Previous
              </span>
              <strong>{ordered[index - 1].title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {index < ordered.length - 1 && (
            <Link href={`/docs/${ordered[index + 1].slug}/`}>
              <span>
                Up next
                <ArrowRight size={12} />
              </span>
              <strong>{ordered[index + 1].title}</strong>
            </Link>
          )}
        </div>
      </article>
      <aside className="docs-toc">
        <span className="tiny-label">ON THIS PAGE</span>
        {doc.sections.map((s) => (
          <a href={`#${anchor(s.title)}`} key={s.title}>
            {s.title}
          </a>
        ))}
        <a className="docs-source-link" href={doc.sources[0].href} target="_blank" rel="noreferrer">
          Read the source
          <ArrowUpRight size={12} />
        </a>
      </aside>
    </main>
  );
}
