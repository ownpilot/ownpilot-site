'use client';

import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

const projects = [
  ['AGEZT', 'An agentic operating system'],
  ['WrongStack', 'AI coding orchestration'],
  ['WrongTrace', 'Agent observability'],
  ['UWAS', 'Unified web app server'],
];

export function OxogStudio() {
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = card.current;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    if (!element || motion.matches || !('IntersectionObserver' in window)) return;

    // The server-rendered logo stays visible when JavaScript is unavailable.
    element.dataset.motion = 'waiting';
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.motion = 'draw';
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -80px 0px' },
    );
    observer.observe(element);
    const finish = () => {
      if (motion.matches) {
        delete element.dataset.motion;
        observer.disconnect();
      }
    };
    motion.addEventListener('change', finish);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', finish);
      delete element.dataset.motion;
    };
  }, []);

  return (
    <div ref={card} className="studio-card">
      <a
        href="https://oxog.net/"
        aria-label="Visit OXOGNET"
        target="_blank"
        rel="noreferrer"
        className="studio-logo"
      >
        <svg className="studio-symbol" viewBox="0 0 200 130" fill="none" aria-hidden="true">
          <path
            d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103"
            stroke="var(--oxog-pink)"
            strokeWidth="12"
          />
          <path
            d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27"
            stroke="var(--oxog-pink)"
            strokeWidth="12"
          />
          <path
            d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7"
            stroke="var(--oxog-purple)"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d="m74 87 54-51"
            stroke="var(--oxog-pink)"
            strokeWidth="12"
            strokeLinecap="square"
          />
        </svg>
      </a>
      <div className="studio-copy">
        <p className="studio-credit">OwnPilot is built and maintained by</p>
        <a className="studio-wordmark" href="https://oxog.net/" target="_blank" rel="noreferrer">
          oxog<span>net</span>
          <b>.</b>
          <ArrowUpRight size={20} />
        </a>
        <p className="studio-description">
          A small studio in Estonia building AI agents, developer tools and the infrastructure
          behind them.
        </p>
      </div>
      <ul className="studio-projects" aria-label="More from OXOGNET">
        {projects.map(([name, description]) => (
          <li key={name}>
            <a href="https://oxog.net/projects" target="_blank" rel="noreferrer">
              <span>{name}</span>
              <span>{description}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
