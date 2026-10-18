'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  X,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Github } from './github-icon';
import { Brand } from './brand';
import { navLinks, REPO } from '@/lib/site';
import { docs } from '@/lib/docs';

type Theme = 'light' | 'dark' | 'system';
const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;
export function ThemePicker() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setTheme((document.documentElement.dataset.theme || 'dark') as Theme);
    const media = matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      if (document.documentElement.dataset.theme === 'system')
        document.documentElement.dataset.color = media.matches ? 'dark' : 'light';
    };
    media.addEventListener('change', sync);
    const storage = (e: StorageEvent) => {
      if (e.key === 'ownpilot-theme')
        apply(
          (['dark', 'light', 'system'].includes(e.newValue || '') ? e.newValue : 'dark') as Theme,
        );
    };
    window.addEventListener('storage', storage);
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('storage', storage);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLInputElement>('input:checked')?.focus();
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  function apply(value: Theme) {
    setTheme(value);
    document.documentElement.dataset.theme = value;
    document.documentElement.dataset.color =
      value === 'system'
        ? matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : value;
    try {
      localStorage.setItem('ownpilot-theme', value);
    } catch {
      /* Selection still works when storage is unavailable. */
    }
  }
  const Icon = options.find((t) => t.value === theme)!.icon;
  return (
    <div className="theme-picker" ref={root}>
      <button
        ref={trigger}
        className="theme-trigger"
        aria-label="Choose color theme"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="theme-panel"
        onClick={() => setOpen(!open)}
      >
        <Icon size={16} />
        <span>{theme[0].toUpperCase() + theme.slice(1)}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div id="theme-panel" className="theme-panel" role="dialog" aria-label="Appearance">
          <strong>Make yourself at home.</strong>
          <p>Your workspace. Your appearance.</p>
          <fieldset>
            <legend className="sr-only">Color theme</legend>
            {options.map(({ value, label, icon: ChoiceIcon }) => (
              <label className="theme-choice" key={value}>
                <input
                  type="radio"
                  name="appearance"
                  value={value}
                  checked={theme === value}
                  onChange={() => apply(value)}
                />
                <span className={`theme-preview preview-${value}`} aria-hidden="true">
                  <span className="preview-sidebar" />
                  <span className="preview-lines">
                    <i />
                    <i />
                    <i />
                  </span>
                  <ChoiceIcon size={13} />
                  {theme === value && <Check className="theme-check" size={13} />}
                </span>
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <small>
            <Icon size={13} />
            {theme === 'system'
              ? 'In sync with your device.'
              : `${theme === 'dark' ? 'A little focus after dark.' : 'A fresh perspective.'}`}
          </small>
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const path = usePathname();
  function openSearch() {
    setMobile(false);
    dialog.current?.showModal();
    input.current?.focus();
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dialog.current?.open ? dialog.current.close() : openSearch();
      }
      if (e.key === 'Escape') {
        setMobile(false);
        if (menuButton.current?.getAttribute('aria-expanded') === 'true')
          menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);
  const results = Object.values(docs).filter((d) =>
    `${d.title} ${d.summary} ${d.sections.map((s) => s.title + s.text.join(' ')).join(' ')}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            {navLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  path === href || (label === 'Docs' && path.startsWith('/docs'))
                    ? 'page'
                    : undefined
                }
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <span id="background-motion-slot" className="background-motion-slot" />
            <button
              className="search-trigger icon-button"
              aria-label="Search documentation"
              onClick={openSearch}
            >
              <Search size={17} />
              <kbd>⌘ K</kbd>
            </button>
            <ThemePicker />
            <span className="header-divider" />
            <a className="header-github" href={REPO} target="_blank" rel="noreferrer">
              <Github size={18} />
              <span>GitHub</span>
              <ArrowUpRight size={13} />
            </a>
            <button
              className="menu-trigger icon-button"
              ref={menuButton}
              aria-label={mobile ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobile}
              aria-controls="mobile-navigation"
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobile && (
          <nav
            id="mobile-navigation"
            className="mobile-navigation container"
            aria-label="Mobile navigation"
          >
            {navLinks.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setMobile(false)}>
                {label}
                <ArrowRight size={16} />
              </Link>
            ))}
            <Link href="/changelog/" onClick={() => setMobile(false)}>
              Changelog
              <ArrowRight size={16} />
            </Link>
          </nav>
        )}
      </header>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-labelledby="search-title"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="search-box">
          <Search size={20} />
          <label id="search-title" className="sr-only" htmlFor="documentation-search">
            Search documentation
          </label>
          <input
            ref={input}
            id="documentation-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your way around…"
            autoComplete="off"
          />
          <button
            className="icon-button"
            aria-label="Close search"
            onClick={() => dialog.current?.close()}
          >
            <X size={18} />
          </button>
        </div>
        <div className="search-results" aria-live="polite">
          {results.length ? (
            results.map((d) => (
              <Link href={`/docs/${d.slug}/`} key={d.slug} onClick={() => dialog.current?.close()}>
                <FileText size={18} />
                <span>
                  <strong>{d.title}</strong>
                  <small>{d.summary}</small>
                </span>
                <ArrowUpRight size={16} />
              </Link>
            ))
          ) : (
            <p className="search-empty">
              No results for “{query}”. Try agents, Docker, MCP or privacy.
            </p>
          )}
        </div>
        <div className="search-footer">
          <span>OWNPILOT DOCUMENTATION</span>
          <span>ESC to close</span>
        </div>
      </dialog>
    </>
  );
}
