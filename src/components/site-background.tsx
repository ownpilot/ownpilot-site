'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pause, Play } from 'lucide-react';
import { createSiteScene, type SiteScene } from '@/lib/site-scene';

/** One decorative viewport follows the visitor across all routes and sections. */
export function SiteBackground() {
  const id = useId().replaceAll(':', '');
  const surface = useRef<SVGSVGElement>(null);
  const scene = useRef<SiteScene | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [controlHost, setControlHost] = useState<HTMLElement | null>(null);
  const label = reduced ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';

  useEffect(() => {
    if (!surface.current) return;
    scene.current = createSiteScene(surface.current, setReduced);
    const bindControl = () => {
      const slot = document.getElementById('background-motion-slot');
      if (slot?.dataset.ready === 'true') setControlHost(slot);
    };
    // Wait for the navigation boundary to hydrate before adding portal children.
    window.addEventListener('ownpilot:motion-control-ready', bindControl);
    bindControl();
    setReady(true);
    return () => {
      window.removeEventListener('ownpilot:motion-control-ready', bindControl);
      scene.current?.destroy();
      scene.current = null;
    };
  }, []);
  useEffect(() => scene.current?.setPaused(paused), [paused]);

  return (
    <>
      <div className="site-background" aria-hidden="true">
        <svg
          ref={surface}
          className="site-field"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          focusable="false"
        >
          <defs>
            <radialGradient id={`light-${id}`}>
              <stop offset="0" stopColor="currentColor" stopOpacity="0.11" />
              <stop offset="0.4" stopColor="currentColor" stopOpacity="0.05" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g data-ambient="" opacity="0.38" fill="none" stroke="currentColor" strokeWidth="1">
            <g data-routes="" opacity="0.13">
              <path d="M-50 180C280 80 700 300 1050 150" />
              <path d="M-50 540C300 690 640 350 1050 510" />
              <path d="M-50 850C310 660 670 1000 1050 800" />
            </g>
            <g data-links="" />
            <g data-nodes="" />
          </g>
          <g data-interaction="" fill="none" stroke="currentColor" strokeWidth="1.2">
            <g data-pointer="" className="field-teal" opacity="0">
              <circle r="230" fill={`url(#light-${id})`} stroke="none" />
              <circle r="32" opacity="0.2" />
              <path d="M-44 0h10M34 0h10M0-44v10M0 34v10" opacity="0.3" />
            </g>
            <g data-echoes="" />
            <g data-relays="" />
            <g data-trails="" />
            <g data-pulses="" />
          </g>
        </svg>
      </div>
      {ready &&
        controlHost &&
        createPortal(
          <button
            type="button"
            className="site-motion-control"
            aria-label={label}
            aria-pressed={paused || reduced}
            disabled={reduced}
            title={reduced ? 'Background motion follows your device preference' : label}
            onClick={() => setPaused((value) => !value)}
          >
            {paused && !reduced ? <Play size={14} /> : <Pause size={14} />}
          </button>,
          controlHost,
        )}
    </>
  );
}
