import {
  AMBIENT_FIELD as C,
  addFieldPulse,
  createFieldNodes,
  pruneFieldEffects,
  pulseRadius,
  stepFieldNode,
  type FieldNode,
  type FieldPulse,
  type FieldTrail,
} from './ambient-field';

export type SiteScene = { setPaused: (paused: boolean) => void; destroy: () => void };
const NS = 'http://www.w3.org/2000/svg';
const colors = ['field-blue', 'field-green', 'field-teal'];
const interactive =
  'a, button, input, select, textarea, label, summary, header, nav, dialog, [role="dialog"], [role="button"], [role="tab"], [contenteditable]';
const protectedContent =
  'main h1, main h2, main h3, main h4, main p, main pre, main table, main article, main button, main a, main input, main summary, main strong, main .eyebrow, main .tiny-label, .hero-trust, .provider-strip, .hero-system, .product-window, .studio-card, .footer-brand, .footer-column, .footer-bottom, .docs-sidebar';

function element<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string | number> = {},
) {
  const node = document.createElementNS(NS, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  return node;
}
function write(node: Element, name: string, value: string) {
  // Unchanged SVG attributes still generate DOM mutation events in browsers.
  if (node.getAttribute(name) !== value) node.setAttribute(name, value);
}
function set(node: Element, name: string, value: number) {
  write(node, name, value.toFixed(2));
}

export function createSiteScene(
  svg: SVGSVGElement,
  onPreference: (value: boolean) => void,
): SiteScene {
  const layer = svg.parentElement!;
  const group = (name: string) => svg.querySelector<SVGGElement>(`[data-${name}]`)!;
  const nodeLayer = group('nodes'),
    linkLayer = group('links'),
    pulseLayer = group('pulses'),
    trailLayer = group('trails'),
    shields = group('shields');
  const routeLayer = group('routes');
  const routeElements = [...routeLayer.querySelectorAll('path')];
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1,
    height = 1,
    frame = 0,
    previous = 0,
    time = 0,
    entrance = 0;
  let paused = false,
    visible = true,
    destroyed = false,
    layoutDirty = true;
  let sceneScroll = scrollY,
    energy = 0.55,
    lastInteraction = -100,
    lastTrail = -1,
    motionTime = 0;
  let pointerInside = false;
  const pointer = { x: -1000, y: -1000, strength: 0 };
  let press: { x: number; y: number; id: number; at: number } | null = null;
  let targets: Element[] = [];
  let nodes: { model: FieldNode; originY: number; view: SVGGElement }[] = [];
  const pulses: FieldPulse[] = [],
    trails: FieldTrail[] = [];
  const links = Array.from({ length: C.maxLinks }, () => {
    const path = element('path', { opacity: 0 });
    linkLayer.append(path);
    return path;
  });
  const pulseViews = Array.from({ length: C.maxPulses }, () => {
    const view = element('g', {
      class: 'field-pulse field-color',
      opacity: 0,
      'data-active': 'false',
    });
    const rings = [element('circle', { r: 0 }), element('circle', { r: 0, opacity: 0.4 })];
    const sparks = Array.from({ length: 8 }, () => element('path'));
    view.append(...rings, ...sparks);
    pulseLayer.append(view);
    return { view, rings, sparks };
  });
  const trailViews = Array.from({ length: C.maxTrails }, () => {
    const view = element('circle', {
      class: 'field-trail field-teal field-color',
      r: 0,
      opacity: 0,
    });
    trailLayer.append(view);
    return view;
  });
  const maskViews: SVGGElement[] = [];

  function refreshTargets() {
    targets = [...document.querySelectorAll(protectedContent)];
    layoutDirty = true;
  }
  function measureShields() {
    layoutDirty = false;
    const boxes = targets
      .map((el) => el.getBoundingClientRect())
      .filter(
        (r) =>
          r.width > 0 &&
          r.height > 0 &&
          r.bottom > 0 &&
          r.top < height &&
          r.right > 0 &&
          r.left < width,
      )
      .sort((a, b) => b.width * b.height - a.width * a.height);
    const kept: DOMRect[] = [];
    for (const box of boxes) {
      if (
        kept.some(
          (b) =>
            box.left >= b.left &&
            box.right <= b.right &&
            box.top >= b.top &&
            box.bottom <= b.bottom,
        )
      )
        continue;
      kept.push(box);
      if (kept.length === 96) break;
    }
    kept.forEach((box, i) => {
      if (!maskViews[i]) {
        const view = element('g');
        for (const opacity of [0.25, 0.5, 0.97])
          view.append(element('rect', { fill: 'black', opacity, rx: 12 }));
        shields.append(view);
        maskViews.push(view);
      }
      const view = maskViews[i];
      view.style.display = '';
      [...view.children].forEach((rect, j) => {
        const pad = [18, 8, 0][j];
        set(rect, 'x', box.left - pad);
        set(rect, 'y', box.top - pad);
        set(rect, 'width', box.width + pad * 2);
        set(rect, 'height', box.height + pad * 2);
      });
    });
    maskViews.slice(kept.length).forEach((v) => {
      v.style.display = 'none';
    });
  }
  function resize() {
    if (destroyed) return;
    const bounds = layer.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    write(svg, 'viewBox', `0 0 ${width} ${height}`);
    nodeLayer.replaceChildren();
    nodes = createFieldNodes(width, height).map((model, i) => {
      const view = element('g', { class: `field-node field-color ${colors[model.kind]}` });
      const size = 2.5 + model.depth * 2;
      view.append(
        element('path', {
          d:
            model.kind === 0
              ? `M0 ${-size * 1.6} ${size} 0 0 ${size * 1.6} ${-size} 0Z`
              : model.kind === 1
                ? `M${-size} ${-size}h${size * 2}v${size * 2}h${-size * 2}Z`
                : `M${-size} 0a${size} ${size} 0 1 0 ${size * 2} 0a${size} ${size} 0 1 0 ${-size * 2} 0`,
          'vector-effect': 'non-scaling-stroke',
        }),
      );
      if (i % 5 === 0)
        view.append(element('path', { d: 'M-9 0h4M5 0h4M0-9v4M0 5v4', opacity: 0.6 }));
      nodeLayer.append(view);
      return { model, originY: model.homeY, view };
    });
    sceneScroll = media.matches ? 0 : scrollY;
    // Keep initial node positions aligned with the visitor's current scroll.
    for (const node of nodes) {
      node.model.homeY = wrap(node.originY - sceneScroll * node.model.depth * C.parallax);
      node.model.y = node.model.homeY;
    }
    routeElements.forEach((path, i) => {
      const y = height * (0.18 + i * 0.32);
      write(
        path,
        'd',
        `M-40 ${y}C${width * 0.3} ${y - height * 0.14} ${width * 0.68} ${y + height * 0.17} ${width + 40} ${y - 30}`,
      );
    });
    pulses.length = 0;
    trails.length = 0;
    pointer.strength = 0;
    pointerInside = false;
    layoutDirty = true;
    if (!frame) paint(0, media.matches || paused);
  }
  const wrap = (y: number) =>
    ((((y + 60) % (height + 120)) + (height + 120)) % (height + 120)) - 60;
  const edge = (x: number, y: number) =>
    Math.max(0, Math.min(1, x / 50, (width - x) / 50, y / 60, (height - y) / 60));

  function paint(dt: number, still = false) {
    if (layoutDirty) measureShields();
    const fade = still ? 1 : Math.min(1, entrance / C.entranceTime);
    const opacity = String(Math.round(fade * 100) / 100);
    if (svg.style.opacity !== opacity) svg.style.opacity = opacity;
    const visibleNodes: typeof nodes = [];
    for (const node of nodes) {
      const n = node.model;
      const home = wrap(node.originY - sceneScroll * n.depth * C.parallax);
      if (Math.abs(home - n.homeY) > height * 0.5) n.y = home;
      n.homeY = home;
      if (!still) stepFieldNode(n, time, dt, pointer, pulses, motionTime);
      const alpha = edge(n.x, n.y) * (0.25 + n.depth * 0.5);
      if (alpha <= 0.001) {
        if (node.view.style.display !== 'none') node.view.style.display = 'none';
        continue;
      }
      if (node.view.style.display) node.view.style.display = '';
      visibleNodes.push(node);
      write(
        node.view,
        'transform',
        `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)}) rotate(${(((n.phase + (still ? 0 : motionTime * 0.035)) * 180) / Math.PI).toFixed(1)})`,
      );
      set(node.view, 'opacity', alpha);
    }
    let used = 0;
    const linkRadius = width <= C.mobileBreakpoint ? 125 : C.linkRadius;
    for (let i = 0; i < visibleNodes.length && used < links.length; i++) {
      const n = visibleNodes[i].model;
      let count = 0;
      for (
        let j = i + 1;
        j < visibleNodes.length &&
        count < (width <= C.mobileBreakpoint ? 1 : 2) &&
        used < links.length;
        j++
      ) {
        const other = visibleNodes[j].model,
          distance = Math.hypot(n.x - other.x, n.y - other.y);
        if (distance >= linkRadius) continue;
        const path = links[used++];
        count++;
        write(
          path,
          'd',
          `M${n.x.toFixed(1)} ${n.y.toFixed(1)}Q${((n.x + other.x) / 2).toFixed(1)} ${(n.y - 12).toFixed(1)} ${other.x.toFixed(1)} ${other.y.toFixed(1)}`,
        );
        set(
          path,
          'opacity',
          (1 - distance / linkRadius) * 0.23 * Math.min(edge(n.x, n.y), edge(other.x, other.y)),
        );
      }
    }
    links.slice(used).forEach((path) => write(path, 'opacity', '0'));
    trailViews.forEach((view, i) => {
      const trail = trails[i];
      if (!trail) {
        write(view, 'opacity', '0');
        return;
      }
      const life = Math.max(0, 1 - (time - trail.born) / C.trailLife);
      set(view, 'cx', trail.x);
      set(view, 'cy', trail.y);
      set(view, 'r', 3 + (1 - life) * 14);
      set(view, 'opacity', life * 0.25);
    });
    pulseViews.forEach(({ view, rings, sparks }, i) => {
      const pulse = pulses[i];
      if (!pulse) {
        write(view, 'opacity', '0');
        write(view, 'data-active', 'false');
        return;
      }
      const age = time - pulse.born,
        life = Math.max(0, 1 - age / C.pulseLife),
        radius = pulseRadius(age);
      write(view, 'data-active', 'true');
      write(view, 'class', `field-pulse field-color ${colors[pulse.variant]}`);
      write(view, 'transform', `translate(${pulse.x} ${pulse.y})`);
      set(view, 'opacity', Math.sin(Math.min(1, age / 0.1) * Math.PI * 0.5) * life ** 1.5 * 0.8);
      set(rings[0], 'r', radius);
      set(rings[1], 'r', radius * (pulse.variant === 1 ? 0.72 : 0.9));
      sparks.forEach((spark, j) => {
        const angle = (j / 8) * Math.PI * 2 + (pulse.variant * Math.PI) / 8;
        const x = Math.cos(angle) * radius,
          y = Math.sin(angle) * radius;
        write(
          spark,
          'd',
          `M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(angle) * (4 + life * 9)).toFixed(1)} ${(Math.sin(angle) * (4 + life * 9)).toFixed(1)}`,
        );
      });
    });
    write(
      routeLayer,
      'transform',
      `translate(0 ${(Math.sin(sceneScroll * 0.00035) * height * 0.05).toFixed(1)})`,
    );
  }
  function tick(now: number) {
    frame = 0;
    if (destroyed) return;
    const active = now / 1000 - lastInteraction < C.idleAfter;
    const fps = width <= C.mobileBreakpoint ? C.mobileFps : active ? C.activeFps : C.idleFps;
    if (previous && now - previous < 1000 / fps - 0.5) {
      frame = requestAnimationFrame(tick);
      return;
    }
    const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0;
    previous = now;
    energy += ((active ? 1 : 0.55) - energy) * (1 - Math.exp(-dt * 2));
    // Effects expire in real seconds; only ambient drift becomes quieter when idle.
    time += dt;
    motionTime += dt * energy;
    entrance += dt;
    pointer.strength += ((pointerInside ? 1 : 0) - pointer.strength) * (1 - Math.exp(-dt * 6));
    sceneScroll += (scrollY - sceneScroll) * (1 - Math.exp(-dt * 7));
    pruneFieldEffects(pulses, time, C.pulseLife);
    pruneFieldEffects(trails, time, C.trailLife);
    paint(dt);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (destroyed) return;
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    const state = media.matches
      ? 'reduced'
      : paused
        ? 'paused'
        : document.hidden
          ? 'hidden'
          : !visible
            ? 'offscreen'
            : 'running';
    svg.dataset.state = state;
    if (state === 'running') frame = requestAnimationFrame(tick);
    else {
      pulses.length = 0;
      trails.length = 0;
      pointer.strength = 0;
      pointerInside = false;
      if (media.matches) sceneScroll = 0;
      paint(0, true);
    }
  }
  const blocked = () => paused || media.matches || document.hidden || !visible;
  const move = (event: PointerEvent) => {
    if (
      press &&
      press.id === event.pointerId &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10
    )
      press = null;
    if (blocked() || event.pointerType === 'touch') return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointerInside = true;
    lastInteraction = performance.now() / 1000;
    if (time - lastTrail > 0.05) {
      trails.push({ x: pointer.x, y: pointer.y, born: time });
      if (trails.length > C.maxTrails) trails.shift();
      lastTrail = time;
    }
  };
  const leave = () => {
    pointerInside = false;
    press = null;
  };
  const down = (event: PointerEvent) => {
    press = null;
    if (
      blocked() ||
      !event.isPrimary ||
      event.button !== 0 ||
      !(event.target instanceof Element) ||
      event.target.closest(interactive) ||
      window.getSelection()?.toString()
    )
      return;
    press = { x: event.clientX, y: event.clientY, id: event.pointerId, at: performance.now() };
  };
  const up = (event: PointerEvent) => {
    const start = press;
    press = null;
    if (
      !start ||
      blocked() ||
      start.id !== event.pointerId ||
      performance.now() - start.at > 450 ||
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10 ||
      !(event.target instanceof Element) ||
      event.target.closest(interactive) ||
      window.getSelection()?.toString()
    )
      return;
    addFieldPulse(
      pulses,
      event.clientX,
      event.clientY,
      time,
      width <= C.mobileBreakpoint ? C.mobilePulses : C.maxPulses,
    );
    lastInteraction = performance.now() / 1000;
  };
  const scroll = () => {
    layoutDirty = true;
    leave();
    if (!frame) {
      paint(0, true);
    }
  };
  const preference = () => {
    onPreference(media.matches);
    sync();
  };
  const visibility = () => {
    leave();
    sync();
  };
  const content = new MutationObserver((records) => {
    if (
      records.some(
        (record) =>
          !(record.target instanceof Element) ||
          (!record.target.closest('.site-background') &&
            !record.target.closest('.site-motion-control')),
      )
    ) {
      refreshTargets();
      if (!frame) paint(0, true);
    }
  });
  content.observe(document.body, { childList: true, characterData: true, subtree: true });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(layer);
  const dimensions = new ResizeObserver(resize);
  dimensions.observe(layer);
  const contentSize = new ResizeObserver(() => {
    layoutDirty = true;
    if (!frame) paint(0, true);
  });
  contentSize.observe(document.body);
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerdown', down, { passive: true });
  document.addEventListener('pointerup', up, { passive: true });
  document.addEventListener('pointercancel', leave, { passive: true });
  document.documentElement.addEventListener('pointerleave', leave, { passive: true });
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  media.addEventListener('change', preference);
  refreshTargets();
  resize();
  preference();
  void document.fonts.ready.then(() => {
    if (!destroyed) {
      refreshTargets();
      if (!frame) paint(0, true);
    }
  });
  return {
    setPaused(value) {
      paused = value;
      sync();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      dimensions.disconnect();
      contentSize.disconnect();
      content.disconnect();
      media.removeEventListener('change', preference);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', leave);
      document.documentElement.removeEventListener('pointerleave', leave);
      nodeLayer.replaceChildren();
      linkLayer.replaceChildren();
      pulseLayer.replaceChildren();
      trailLayer.replaceChildren();
      shields.replaceChildren();
    },
  };
}
