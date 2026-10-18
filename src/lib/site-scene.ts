import {
  AMBIENT_FIELD as C,
  addFieldPulse,
  createFieldNodes,
  createFieldRelays,
  pruneFieldRelays,
  relayEnvelope,
  pruneFieldEffects,
  pulseRadius,
  stepFieldNode,
  type FieldNode,
  type FieldPulse,
  type FieldTrail,
  type FieldRelay,
} from './ambient-field';

type SceneMotion = { ambient: boolean; interaction: boolean };
export type SiteScene = { setMotion: (motion: SceneMotion) => void; destroy: () => void };
const NS = 'http://www.w3.org/2000/svg';
const colors = ['field-blue', 'field-green', 'field-teal'];
const interactive =
  'a, button, input, select, textarea, label, summary, header, nav, dialog, [role="dialog"], [role="button"], [role="tab"], [contenteditable]';

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
  initial: SceneMotion = { ambient: true, interaction: true },
): SiteScene {
  const layer = svg.parentElement!;
  const group = (name: string) => svg.querySelector<SVGGElement>(`[data-${name}]`)!;
  const nodeLayer = group('nodes'),
    linkLayer = group('links'),
    pulseLayer = group('pulses'),
    trailLayer = group('trails'),
    echoLayer = group('echoes'),
    relayLayer = group('relays'),
    pointerView = group('pointer');
  const routeLayer = group('routes');
  const routeElements = [...routeLayer.querySelectorAll('path')];
  let width = 1,
    height = 1,
    frame = 0,
    previous = 0,
    time = 0,
    entrance = 0;
  let visible = true,
    destroyed = false;
  let ambient = initial.ambient,
    interaction = initial.interaction;
  let listening = false;
  let sceneScroll = scrollY,
    energy = 0.55,
    lastInteraction = -100,
    lastTrail = -1,
    motionTime = 0;
  let pointerInside = false;
  const pointer = { x: -1000, y: -1000, strength: 0 };
  let press: { x: number; y: number; id: number; at: number } | null = null;
  let nodes: {
    model: FieldNode;
    originY: number;
    view: SVGGElement;
    echo: SVGGElement;
    ray: SVGPathElement;
  }[] = [];
  const pulses: FieldPulse[] = [],
    trails: FieldTrail[] = [],
    relays: FieldRelay[] = [];
  const relayViews = Array.from({ length: C.maxRelays }, () => {
    const view = element('g', {
      class: 'field-relay field-teal',
      opacity: 0,
      'data-active': 'false',
    });
    const path = element('path', { pathLength: 1, 'stroke-dasharray': '0.15 1' });
    const ring = element('circle', { r: 0, opacity: 0 });
    view.append(path, ring);
    relayLayer.append(view);
    return { view, path, ring };
  });
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
  function resize() {
    if (destroyed) return;
    const bounds = layer.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    write(svg, 'viewBox', `0 0 ${width} ${height}`);
    nodeLayer.replaceChildren();
    echoLayer.replaceChildren();
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
      const echo = view.cloneNode(true) as SVGGElement;
      write(echo, 'class', `field-echo field-color ${colors[model.kind]}`);
      write(echo, 'opacity', '0');
      const ray = element('path', { class: `field-color ${colors[model.kind]}`, opacity: 0 });
      echoLayer.append(ray, echo);
      return { model, originY: model.homeY, view, echo, ray };
    });
    sceneScroll = ambient ? scrollY : 0;
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
    relays.length = 0;
    pointer.strength = 0;
    pointerInside = false;
    if (!frame) paint(0, !ambient && !interaction);
  }
  const wrap = (y: number) =>
    ((((y + 60) % (height + 120)) + (height + 120)) % (height + 120)) - 60;
  const edge = (x: number, y: number) =>
    Math.max(0, Math.min(1, x / 50, (width - x) / 50, y / 60, (height - y) / 60));

  function paint(dt: number, still = false) {
    const fade = still ? 1 : Math.min(1, entrance / C.entranceTime);
    const opacity = String(Math.round(fade * 100) / 100);
    if (svg.style.opacity !== opacity) svg.style.opacity = opacity;
    const visibleNodes: typeof nodes = [];
    for (const node of nodes) {
      const n = node.model;
      const home = wrap(node.originY - sceneScroll * n.depth * C.parallax);
      if (Math.abs(home - n.homeY) > height * 0.5) n.y = home;
      n.homeY = home;
      if (!still) stepFieldNode(n, time, dt, pointer, pulses, motionTime, relays);
      const alpha = edge(n.x, n.y) * (0.25 + n.depth * 0.5);
      if (alpha <= 0.001) {
        if (node.view.style.display !== 'none') node.view.style.display = 'none';
        write(node.echo, 'opacity', '0');
        write(node.ray, 'opacity', '0');
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
      const distance = Math.hypot(n.x - pointer.x, n.y - pointer.y);
      const proximity = Math.max(0, 1 - distance / C.pointerRadius) ** 2 * pointer.strength;
      let impact = 0;
      if (!still)
        for (const pulse of pulses) {
          const age = time - pulse.born;
          const radius = Math.hypot(n.x - pulse.x, n.y - pulse.y);
          impact = Math.max(
            impact,
            Math.exp(-(((radius - pulseRadius(age)) / 50) ** 2)) *
              Math.max(0, 1 - age / C.pulseLife) *
              Math.max(0, 1 - radius / C.pulseRadius),
          );
        }
      let relayResponse = 0;
      if (!still)
        for (const relay of relays)
          if (relay.node === n) relayResponse = Math.max(relayResponse, relayEnvelope(relay, time));
      const response = still ? 0 : Math.max(proximity, impact, relayResponse);
      set(node.echo, 'opacity', response * alpha * 0.9);
      set(node.ray, 'opacity', still ? 0 : proximity * alpha * 0.28);
      if (response > 0.005) write(node.echo, 'transform', node.view.getAttribute('transform')!);
      if (!still && proximity > 0.005)
        write(
          node.ray,
          'd',
          `M${pointer.x.toFixed(1)} ${pointer.y.toFixed(1)}Q${((pointer.x + n.x) / 2 + 18).toFixed(1)} ${((pointer.y + n.y) / 2 - 18).toFixed(1)} ${n.x.toFixed(1)} ${n.y.toFixed(1)}`,
        );
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
    relayViews.forEach(({ view, path, ring }, i) => {
      const relay = relays[i];
      if (still || !relay || time < relay.start) {
        write(view, 'opacity', '0');
        write(view, 'data-active', 'false');
        return;
      }
      write(view, 'data-active', 'true');
      const age = Math.max(0, time - relay.born);
      const travelling = time < relay.born;
      const response = relayEnvelope(relay, time);
      set(view, 'opacity', travelling ? relay.gain * 0.25 : response * 0.55);
      set(path, 'opacity', travelling ? 1 : 0);
      if (travelling) {
        const x = relay.source?.x ?? relay.sourceX;
        const y = relay.source?.y ?? relay.sourceY;
        write(
          path,
          'd',
          `M${x.toFixed(1)} ${y.toFixed(1)}Q${((x + relay.node.x) / 2 + 14).toFixed(1)} ${((y + relay.node.y) / 2 - 14).toFixed(1)} ${relay.node.x.toFixed(1)} ${relay.node.y.toFixed(1)}`,
        );
        set(
          path,
          'stroke-dashoffset',
          -Math.min(1, (time - relay.start) / (relay.born - relay.start)) * 0.85,
        );
      }
      set(ring, 'opacity', travelling ? 0 : 1);
      if (!travelling) {
        set(ring, 'cx', relay.node.x);
        set(ring, 'cy', relay.node.y);
        set(ring, 'r', 5 + (age / C.relayLife) * 30);
      }
    });
    set(pointerView, 'opacity', still ? 0 : pointer.strength);
    if (!still && pointer.strength > 0.005)
      write(pointerView, 'transform', `translate(${pointer.x.toFixed(1)} ${pointer.y.toFixed(1)})`);
    trailViews.forEach((view, i) => {
      const trail = trails[i];
      if (!trail) {
        write(view, 'opacity', '0');
        return;
      }
      const life = Math.max(0, 1 - (time - trail.born) / C.trailLife);
      set(view, 'cx', trail.x);
      set(view, 'cy', trail.y);
      set(view, 'r', 5 + (1 - life) * 26);
      set(view, 'opacity', life ** 1.5 * 0.45);
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
      `translate(0 ${(Math.sin(sceneScroll * 0.00035 + motionTime * 0.07) * height * 0.025).toFixed(1)})`,
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
    if (ambient) motionTime += dt * energy;
    entrance += dt;
    pointer.strength +=
      ((pointerInside && active ? 1 : 0) - pointer.strength) * (1 - Math.exp(-dt * 6));
    if (ambient) sceneScroll += (scrollY - sceneScroll) * (1 - Math.exp(-dt * 7));
    else sceneScroll = 0;
    pruneFieldEffects(pulses, time, C.pulseLife);
    pruneFieldEffects(trails, time, C.trailLife);
    pruneFieldRelays(relays, time);
    paint(dt);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (destroyed) return;
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    const state =
      !ambient && !interaction
        ? 'reduced'
        : document.hidden
          ? 'hidden'
          : !visible
            ? 'offscreen'
            : interaction
              ? 'running'
              : 'ambient';
    svg.dataset.state = state;
    svg.dataset.mouseEffects = interaction ? 'on' : 'off';
    if (state === 'running' || state === 'ambient') frame = requestAnimationFrame(tick);
    else {
      pulses.length = 0;
      trails.length = 0;
      relays.length = 0;
      pointer.strength = 0;
      pointerInside = false;
      paint(0, true);
    }
  }
  const blocked = () => destroyed || !interaction || document.hidden || !visible;
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
    relays.push(
      ...createFieldRelays(
        nodes.map((node) => node.model),
        event.clientX,
        event.clientY,
        time,
        width <= C.mobileBreakpoint ? C.mobileRelayHops : C.relayHops,
      ),
    );
    const relayLimit = width <= C.mobileBreakpoint ? C.mobileRelays : C.maxRelays;
    if (relays.length > relayLimit) relays.splice(0, relays.length - relayLimit);
    lastInteraction = performance.now() / 1000;
  };
  const scroll = () => {
    // Only cancel a tap during a swipe. Client coordinates stay in the fixed viewport.
    press = null;
    if (pointerInside) lastInteraction = performance.now() / 1000;
    if (!frame) paint(0, true);
  };
  const visibility = () => {
    leave();
    sync();
  };
  function listen(value: boolean) {
    if (listening === value) return;
    listening = value;
    if (value) {
      document.addEventListener('pointermove', move, { passive: true, capture: true });
      document.addEventListener('pointerdown', down, { passive: true, capture: true });
      document.addEventListener('pointerup', up, { passive: true, capture: true });
      document.addEventListener('pointercancel', leave, { passive: true });
      document.documentElement.addEventListener('pointerleave', leave, { passive: true });
    } else {
      document.removeEventListener('pointermove', move, true);
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('pointerup', up, true);
      document.removeEventListener('pointercancel', leave);
      document.documentElement.removeEventListener('pointerleave', leave);
    }
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(layer);
  const dimensions = new ResizeObserver(resize);
  dimensions.observe(layer);
  listen(interaction);
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('blur', leave);
  document.addEventListener('visibilitychange', visibility);
  resize();
  sync();
  return {
    setMotion(next) {
      if (destroyed || (ambient === next.ambient && interaction === next.interaction)) return;
      ambient = next.ambient;
      interaction = next.interaction;
      listen(interaction);
      if (!interaction) {
        pulses.length = 0;
        trails.length = 0;
        relays.length = 0;
        pointer.strength = 0;
        pointerInside = false;
        press = null;
        lastInteraction = -100;
        energy = 0.55;
      }
      paint(0, !ambient && !interaction);
      sync();
    },
    destroy() {
      destroyed = true;
      listen(false);
      cancelAnimationFrame(frame);
      observer.disconnect();
      dimensions.disconnect();
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', leave);
      document.removeEventListener('visibilitychange', visibility);
      pulses.length = 0;
      trails.length = 0;
      relays.length = 0;
      nodes.length = 0;
      press = null;
      write(pointerView, 'opacity', '0');
      nodeLayer.replaceChildren();
      linkLayer.replaceChildren();
      pulseLayer.replaceChildren();
      trailLayer.replaceChildren();
      echoLayer.replaceChildren();
      relayLayer.replaceChildren();
    },
  };
}
