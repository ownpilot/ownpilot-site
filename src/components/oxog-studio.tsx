'use client';

import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

export function OxogStudio() {
  const card = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = card.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => {
      element.dataset.motion = visible && !document.hidden && !motion.matches ? 'draw' : 'paused';
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    sync();
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      delete element.dataset.motion;
    };
  }, []);

  return (
    <a ref={card} className="studio-card" href="https://oxog.net">
      <svg className="studio-symbol" viewBox="0 0 200 130" fill="none" aria-hidden="true">
        <path
          d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103"
          stroke="#ed0878"
          strokeWidth="12"
        />
        <path
          d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27"
          stroke="#ed0878"
          strokeWidth="12"
        />
        <path
          d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7"
          stroke="var(--oxog-purple)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path d="m74 87 54-51" stroke="#ed0878" strokeWidth="12" strokeLinecap="square" />
      </svg>
      <div>
        <span className="studio-eyebrow">PART OF A BIGGER PICTURE</span>
        <h2>
          Small studio. <span>Big ideas.</span>
        </h2>
        <p>Explore the tools and infrastructure from Oxog.</p>
      </div>
      <span className="studio-link">
        Meet oxog.net <ArrowUpRight size={18} />
      </span>
    </a>
  );
}
