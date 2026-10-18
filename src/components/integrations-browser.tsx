'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import { integrations } from '@/lib/docs';
const categories = ['All connections', 'Models', 'Local AI', 'Channels', 'Tools & apps'];
export function IntegrationsBrowser() {
  const [category, setCategory] = useState(categories[0]);
  const [query, setQuery] = useState('');
  const matches = integrations.filter(
    (item) =>
      (category === categories[0] || item.category === category) &&
      `${item.name} ${item.detail}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="integration-toolbar">
        <div role="group" aria-label="Filter integrations">
          {categories.map((c) => (
            <button key={c} aria-pressed={c === category} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <label className="integration-search">
          <Search size={16} />
          <span className="sr-only">Search integrations</span>
          <input
            placeholder="Find a connection…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="integration-count" role="status">
        {matches.length} documented connections
      </p>
      <div className="integration-grid">
        {matches.map((item) => (
          <Link
            key={item.name}
            href={`/docs/${item.category === 'Channels' ? 'channels' : item.category === 'Tools & apps' ? 'tools' : 'providers'}/`}
            className="integration-card"
          >
            <span className="integration-mark">{item.mark}</span>
            <div>
              <h2>{item.name}</h2>
              <p>{item.detail}</p>
            </div>
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </div>
      {!matches.length && (
        <div className="integration-empty">
          <Search size={25} />
          <h2>No matching connections.</h2>
          <p>Try a different name or show all categories.</p>
          <button
            className="button button-secondary"
            onClick={() => {
              setCategory(categories[0]);
              setQuery('');
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </>
  );
}
