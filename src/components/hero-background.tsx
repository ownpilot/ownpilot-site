'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import {
  HERO_FIELD,
  addFieldPulse,
  createFieldNodes,
  fieldPixelRatio,
  pruneFieldEffects,
  pulseRadius,
  stepFieldNode,
  type FieldNode,
  type FieldPulse,
  type FieldTrail,
} from '@/lib/hero-field';

type Controller = { setPaused: (paused: boolean) => void; destroy: () => void };
type RGB = [number, number, number];
const rgb = (hex: string): RGB => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const interactive =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="tab"], [contenteditable], .hero-copy, .hero-system';

/** Canvas owns the frame loop; React only renders the optional motion control. */
export function HeroBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<Controller | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const surface = canvas.current;
    const host = surface?.parentElement?.parentElement;
    if (!surface || !host) return;
    controller.current = createScene(surface, host, setReduced);
    setReady(controller.current !== null);
    return () => {
      controller.current?.destroy();
      controller.current = null;
    };
  }, []);

  useEffect(() => controller.current?.setPaused(paused), [paused]);

  return (
    <>
      <div className="hero-background" aria-hidden="true">
        <canvas ref={canvas} className="hero-field" />
      </div>
      {ready && (
        <button
          className="hero-motion-control"
          type="button"
          aria-label={
            reduced
              ? 'Background motion reduced by device preference'
              : paused
                ? 'Play background animation'
                : 'Pause background animation'
          }
          aria-pressed={paused || reduced}
          disabled={reduced}
          onClick={() => setPaused((value) => !value)}
        >
          {paused && !reduced ? <Play size={11} /> : <Pause size={11} />}
          {reduced ? 'Reduced motion' : paused ? 'Motion paused' : 'Pause motion'}
        </button>
      )}
    </>
  );
}

function createScene(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  onPreference: (reduced: boolean) => void,
): Controller | null {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return null;
  const ctx = context;
  const shield = document.createElement('canvas');
  const mask = shield.getContext('2d');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  let width = 1;
  let height = 1;
  let ratio = 1;
  let nodes: FieldNode[] = [];
  const pulses: FieldPulse[] = [];
  const trails: FieldTrail[] = [];
  const pointer = { x: -1000, y: -1000, strength: 0 };
  let pointerInside = false;
  let press: { x: number; y: number; at: number; id: number } | null = null;
  let paused = false;
  let visible =
    host.getBoundingClientRect().bottom > 0 && host.getBoundingClientRect().top < innerHeight;
  let destroyed = false;
  let frame = 0;
  let previousTime = 0;
  let time = 0;
  let entrance = 0;
  let energy = 0.55;
  let lastInteraction = -100;
  let lastTrail = -1;
  let dark = document.documentElement.dataset.color !== 'light';
  let targetPalette = (dark ? HERO_FIELD.dark : HERO_FIELD.light).map(rgb);
  const palette = targetPalette.map((color) => [...color] as RGB);
  const color = (index: number, alpha: number) => {
    const c = palette[index % palette.length];
    return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${alpha})`;
  };
  const edge = (x: number, y: number) =>
    Math.max(0, Math.min(1, x / 55, (width - x) / 55, y / 45, (height - y) / 45));

  function resize() {
    if (destroyed) return;
    const bounds = host.getBoundingClientRect();
    const nextWidth = Math.max(1, bounds.width);
    const nextHeight = Math.max(1, bounds.height);
    const nextRatio = fieldPixelRatio(nextWidth, nextHeight, devicePixelRatio || 1);
    if (width !== nextWidth || height !== nextHeight || ratio !== nextRatio) {
      width = nextWidth;
      height = nextHeight;
      ratio = nextRatio;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      shield.width = canvas.width;
      shield.height = canvas.height;
      nodes = createFieldNodes(width, height);
      pulses.length = 0;
      trails.length = 0;
      pointerInside = false;
      pointer.strength = 0;
    }
    // Cache soft content shields on layout changes, never measure DOM in a frame.
    if (mask) {
      mask.setTransform(ratio, 0, 0, ratio, 0, 0);
      mask.clearRect(0, 0, width, height);
      mask.filter = 'blur(22px)';
      for (const element of host.querySelectorAll('.hero-copy > *, .hero-system')) {
        const box = element.getBoundingClientRect();
        mask.fillStyle = element.matches('.hero-copy') ? 'rgba(0,0,0,.94)' : 'rgba(0,0,0,.8)';
        mask.fillRect(
          box.left - bounds.left - 10,
          box.top - bounds.top - 8,
          box.width + 20,
          box.height + 16,
        );
      }
      mask.filter = 'none';
    }
    if (!frame) paint(0, media.matches || paused);
  }

  function paint(dt: number, still = false) {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const fade = still ? 1 : Math.min(1, entrance / HERO_FIELD.entranceTime);
    ctx.globalAlpha = fade * (dark ? 0.85 : 0.76);
    ctx.lineWidth = 1;
    const mobile = width <= HERO_FIELD.mobileBreakpoint;
    const anchorX = width * (mobile ? 0.66 : 0.73);
    const anchorY = height * (mobile ? 0.68 : 0.48);

    // Compass arcs and routed signals echo the logo and self-hosted gateway.
    for (let ring = 0; ring < 3; ring++) {
      const radius = Math.min(height * (0.29 + ring * 0.19), width * (0.38 + ring * 0.15));
      ctx.strokeStyle = color(ring, dark ? 0.14 : 0.16);
      ctx.setLineDash(ring === 1 ? [2, 9] : []);
      ctx.beginPath();
      ctx.ellipse(anchorX, anchorY, radius * 1.35, radius, -0.18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let tick = 0; tick < 12; tick++) {
        const angle = (tick / 12) * Math.PI * 2 + (still ? 0 : time * 0.012 * (ring % 2 ? -1 : 1));
        const x = anchorX + Math.cos(angle) * radius * 1.35;
        const y = anchorY + Math.sin(angle) * radius;
        ctx.strokeStyle = color(ring, 0.35 * edge(x, y));
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(angle) * 3, y - Math.sin(angle) * 3);
        ctx.lineTo(x + Math.cos(angle) * 3, y + Math.sin(angle) * 3);
        ctx.stroke();
      }
    }
    for (let route = 0; route < (mobile ? 3 : 5); route++) {
      const y = height * (0.1 + route * 0.2);
      const offset = Math.sin(route * 2.1) * height * 0.1;
      ctx.strokeStyle = color(route, 0.11);
      ctx.beginPath();
      ctx.moveTo(-40, y);
      ctx.bezierCurveTo(width * 0.35, y + offset, width * 0.68, y - offset, width + 40, y + 30);
      ctx.stroke();
      if (!still) {
        const t = (time * 0.024 * (route % 2 ? -1 : 1) + route * 0.217 + 1000) % 1;
        const inv = 1 - t;
        const x =
          inv ** 3 * -40 +
          3 * inv ** 2 * t * width * 0.35 +
          3 * inv * t ** 2 * width * 0.68 +
          t ** 3 * (width + 40);
        const sy =
          inv ** 3 * y +
          3 * inv ** 2 * t * (y + offset) +
          3 * inv * t ** 2 * (y - offset) +
          t ** 3 * (y + 30);
        ctx.fillStyle = color(route, 0.8 * edge(x, sy));
        ctx.fillRect(x - 5, sy - 1, 10, 2);
      }
    }

    const linkRadius = mobile ? 125 : HERO_FIELD.linkRadius;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!still) stepFieldNode(node, time, dt, pointer, pulses);
      const alpha = (0.28 + node.depth * 0.48) * edge(node.x, node.y);
      let links = 0;
      for (let j = i + 1; j < nodes.length && links < (mobile ? 1 : 2); j++) {
        const other = nodes[j];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance >= linkRadius) continue;
        links++;
        ctx.strokeStyle = color(node.kind, (1 - distance / linkRadius) * 0.3 * alpha);
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        const middle = (node.x + other.x) / 2;
        ctx.bezierCurveTo(middle, node.y, middle, other.y, other.x, other.y);
        ctx.stroke();
      }
      const near =
        Math.max(
          0,
          1 - Math.hypot(node.x - pointer.x, node.y - pointer.y) / HERO_FIELD.pointerRadius,
        ) * pointer.strength;
      if (near > 0.08) {
        ctx.strokeStyle = color(node.kind, near * 0.28 * alpha);
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.rotate(node.phase * 0.3 + (still ? 0 : time * 0.025));
      ctx.strokeStyle = color(node.kind, alpha + near * 0.2);
      ctx.fillStyle = color(node.kind, alpha * 0.65);
      const size = 2.5 + node.depth * 2;
      ctx.beginPath();
      if (node.kind === 0) {
        ctx.moveTo(0, -size * 1.6);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size * 1.6);
        ctx.lineTo(-size, 0);
        ctx.closePath();
      } else if (node.kind === 1) {
        ctx.rect(-size, -size, size * 2, size * 2);
      } else {
        ctx.arc(0, 0, size, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }

    for (const trail of trails) {
      const life = Math.max(0, 1 - (time - trail.born) / HERO_FIELD.trailLife);
      ctx.strokeStyle = color(2, life * 0.22);
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, 3 + (1 - life) * 17, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const pulse of pulses) {
      const age = time - pulse.born;
      const life = Math.max(0, 1 - age / HERO_FIELD.pulseLife);
      const radius = pulseRadius(age);
      const alpha = Math.sin(Math.min(1, age / 0.1) * Math.PI * 0.5) * life ** 1.5;
      ctx.strokeStyle = color(pulse.variant, alpha * 0.65);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      if (pulse.variant === 1) {
        ctx.strokeStyle = color(2, alpha * 0.3);
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, radius * 0.72, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let spoke = 0; spoke < 8; spoke++) {
        const angle = (spoke / 8) * Math.PI * 2 + (pulse.variant * Math.PI) / 8;
        const x = pulse.x + Math.cos(angle) * radius;
        const y = pulse.y + Math.sin(angle) * radius;
        ctx.strokeStyle = color((spoke + pulse.variant) % 3, alpha * edge(x, y));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * (4 + life * 7), y + Math.sin(angle) * (4 + life * 7));
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    if (mask) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(shield, 0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  function tick(now: number) {
    frame = 0;
    if (destroyed) return;
    const dt = previousTime ? Math.min(0.05, (now - previousTime) / 1000) : 0;
    previousTime = now;
    const active = now / 1000 - lastInteraction < HERO_FIELD.idleAfter;
    energy += ((active ? 1 : 0.55) - energy) * (1 - Math.exp(-dt * 2));
    time += dt * energy;
    entrance += dt;
    pointer.strength += ((pointerInside ? 1 : 0) - pointer.strength) * (1 - Math.exp(-dt * 6));
    pruneFieldEffects(pulses, time, HERO_FIELD.pulseLife);
    pruneFieldEffects(trails, time, HERO_FIELD.trailLife);
    for (let i = 0; i < palette.length; i++)
      for (let c = 0; c < 3; c++)
        palette[i][c] += (targetPalette[i][c] - palette[i][c]) * (1 - Math.exp(-dt * 7));
    paint(dt);
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    if (destroyed) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    const state = media.matches
      ? 'reduced'
      : paused
        ? 'paused'
        : document.hidden
          ? 'hidden'
          : !visible
            ? 'offscreen'
            : 'running';
    canvas.dataset.state = state;
    if (state === 'running') frame = requestAnimationFrame(tick);
    else if (state === 'paused' || state === 'reduced') {
      pulses.length = 0;
      trails.length = 0;
      pointer.strength = 0;
      paint(0, true);
    }
  }
  const blocked = () => paused || media.matches || !visible || document.hidden;
  const point = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const move = (event: PointerEvent) => {
    if (press && press.id === event.pointerId) {
      const current = point(event);
      if (Math.hypot(current.x - press.x, current.y - press.y) > 10) press = null;
    }
    if (blocked() || event.pointerType === 'touch' || coarse.matches) return;
    Object.assign(pointer, point(event));
    pointerInside = true;
    lastInteraction = performance.now() / 1000;
    if (time - lastTrail > 0.045) {
      trails.push({ x: pointer.x, y: pointer.y, born: time });
      if (trails.length > HERO_FIELD.maxTrails) trails.shift();
      lastTrail = time;
    }
  };
  const leave = () => {
    pointerInside = false;
    press = null;
  };
  const down = (event: PointerEvent) => {
    if (
      blocked() ||
      !event.isPrimary ||
      event.button !== 0 ||
      !(event.target instanceof Element) ||
      event.target.closest(interactive)
    )
      return;
    press = { ...point(event), at: performance.now(), id: event.pointerId };
  };
  const up = (event: PointerEvent) => {
    const start = press;
    press = null;
    if (
      !start ||
      blocked() ||
      start.id !== event.pointerId ||
      !(event.target instanceof Element) ||
      event.target.closest(interactive)
    )
      return;
    const end = point(event);
    if (Math.hypot(end.x - start.x, end.y - start.y) > 10 || performance.now() - start.at > 450)
      return;
    addFieldPulse(pulses, end.x, end.y, time);
    lastInteraction = performance.now() / 1000;
  };
  const preference = () => {
    onPreference(media.matches);
    sync();
  };
  const visibility = () => {
    if (document.hidden) leave();
    sync();
  };
  const theme = new MutationObserver(() => {
    dark = document.documentElement.dataset.color !== 'light';
    targetPalette = (dark ? HERO_FIELD.dark : HERO_FIELD.light).map(rgb);
    if (!frame) {
      targetPalette.forEach((color, i) => Object.assign(palette[i], color));
      paint(0, true);
    }
  });
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-color'] });
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) leave();
    sync();
  });
  intersection.observe(host);
  const size = new ResizeObserver(resize);
  size.observe(host);
  host.querySelectorAll('.hero-copy, .hero-system').forEach((element) => size.observe(element));
  host.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerleave', leave, { passive: true });
  host.addEventListener('pointerdown', down, { passive: true });
  host.addEventListener('pointerup', up, { passive: true });
  host.addEventListener('pointercancel', leave, { passive: true });
  media.addEventListener('change', preference);
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  void document.fonts.ready.then(resize);
  resize();
  preference();
  return {
    setPaused(value) {
      paused = value;
      sync();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      size.disconnect();
      intersection.disconnect();
      theme.disconnect();
      media.removeEventListener('change', preference);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('pointerdown', down);
      host.removeEventListener('pointerup', up);
      host.removeEventListener('pointercancel', leave);
    },
  };
}
