/** OwnPilot's compass field. Distances are CSS pixels, times are seconds. */
export const AMBIENT_FIELD = {
  densityArea: 22_000,
  minNodes: 26,
  maxNodes: 80,
  maxLinks: 80,
  activeFps: 60,
  idleFps: 30,
  mobileFps: 30,
  parallax: 0.08,
  mobileNodes: 22,
  mobileBreakpoint: 650,
  pointerRadius: 280,
  pointerForce: 105,
  linkRadius: 185,
  driftSpeed: 0.18,
  driftDistance: 15,
  pulseLife: 1.8,
  pulseRadius: 300,
  pulseForce: 85,
  maxPulses: 6,
  mobilePulses: 3,
  relayStep: 210,
  relayRadius: 380,
  relaySpeed: 620,
  relayLife: 0.65,
  relayHops: 4,
  mobileRelayHops: 3,
  maxRelays: 24,
  mobileRelays: 9,
  trailLife: 0.9,
  maxTrails: 16,
  idleAfter: 5,
  entranceTime: 1.4,
} as const;

export type FieldNode = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  depth: number;
  phase: number;
  kind: number;
  orbitAngle?: number;
};
export type FieldPulse = { x: number; y: number; born: number; variant: number };
export type FieldTrail = { x: number; y: number; born: number };
export type FieldPointer = { x: number; y: number; strength: number };
export type FieldRelay = {
  node: FieldNode;
  source: FieldNode | null;
  sourceX: number;
  sourceY: number;
  start: number;
  born: number;
  gain: number;
};

/** Schedule a short nearest-neighbour chain once per click, never recursively. */
export function createFieldRelays(
  nodes: FieldNode[],
  x: number,
  y: number,
  time: number,
  hops: number = AMBIENT_FIELD.relayHops,
): FieldRelay[] {
  const relays: FieldRelay[] = [];
  const visited = new Set<FieldNode>();
  let source: FieldNode | null = null;
  let sourceX = x,
    sourceY = y,
    start = time;
  for (let hop = 0; hop < Math.min(hops, AMBIENT_FIELD.relayHops); hop++) {
    let nearest: FieldNode | null = null;
    let distance: number = AMBIENT_FIELD.relayStep;
    for (const node of nodes) {
      if (visited.has(node) || Math.hypot(node.x - x, node.y - y) >= AMBIENT_FIELD.relayRadius)
        continue;
      const gap = Math.hypot(node.x - sourceX, node.y - sourceY);
      if (gap < distance) {
        nearest = node;
        distance = gap;
      }
    }
    if (!nearest) break;
    const born = start + distance / AMBIENT_FIELD.relaySpeed + 0.07;
    relays.push({ node: nearest, source, sourceX, sourceY, start, born, gain: 0.75 * 0.67 ** hop });
    visited.add(nearest);
    source = nearest;
    sourceX = nearest.x;
    sourceY = nearest.y;
    start = born;
  }
  return relays;
}

export function relayEnvelope(relay: FieldRelay, time: number) {
  if (time < relay.born || time >= relay.born + AMBIENT_FIELD.relayLife) return 0;
  const age = (time - relay.born) / AMBIENT_FIELD.relayLife;
  return Math.sin(Math.PI * age) ** 2 * relay.gain;
}

export function pruneFieldRelays(relays: FieldRelay[], time: number) {
  // Chains from successive clicks overlap; arrival times need not be sorted.
  let kept = 0;
  for (const relay of relays)
    if (time < relay.born + AMBIENT_FIELD.relayLife) relays[kept++] = relay;
  relays.length = kept;
}

export function createFieldNodes(width: number, height: number): FieldNode[] {
  const count =
    width <= AMBIENT_FIELD.mobileBreakpoint
      ? AMBIENT_FIELD.mobileNodes
      : Math.min(
          AMBIENT_FIELD.maxNodes,
          Math.max(
            AMBIENT_FIELD.minNodes,
            Math.round((width * height) / AMBIENT_FIELD.densityArea),
          ),
        );
  const columns = Math.ceil(Math.sqrt((count * width) / height));
  const rows = Math.ceil(count / columns);
  // A stable stratified field avoids clumps and hydration-time randomness.
  const noise = (seed: number) => {
    const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  return Array.from({ length: count }, (_, i) => {
    const homeX = (((i % columns) + 0.2 + noise(i + 1) * 0.6) / columns) * width;
    const homeY = ((Math.floor(i / columns) + 0.2 + noise(i + 7) * 0.6) / rows) * height;
    return {
      homeX,
      homeY,
      x: homeX,
      y: homeY,
      depth: 0.35 + noise(i + 19) * 0.65,
      phase: noise(i + 31) * Math.PI * 2,
      kind: i % 3,
    };
  });
}

export function addFieldPulse(
  pulses: FieldPulse[],
  x: number,
  y: number,
  time: number,
  limit: number = AMBIENT_FIELD.maxPulses,
) {
  const previous = pulses.at(-1);
  const variant = previous && time - previous.born < 0.35 ? (previous.variant + 1) % 3 : 0;
  pulses.push({ x, y, born: time, variant });
  if (pulses.length > limit) pulses.splice(0, pulses.length - limit);
}

export function pruneFieldEffects<T extends { born: number }>(
  items: T[],
  time: number,
  life: number,
) {
  while (items.length && time - items[0].born >= life) items.shift();
}

export function pulseRadius(age: number) {
  const progress = Math.max(0, Math.min(1, age / AMBIENT_FIELD.pulseLife));
  return AMBIENT_FIELD.pulseRadius * (1 - (1 - progress) ** 3);
}

export function stepFieldNode(
  node: FieldNode,
  time: number,
  dt: number,
  pointer: FieldPointer,
  pulses: FieldPulse[],
  motionTime: number = time,
  relays: FieldRelay[] = [],
) {
  const drift = AMBIENT_FIELD.driftDistance * node.depth;
  const speed = AMBIENT_FIELD.driftSpeed * (0.65 + node.depth * 0.7);
  let targetX = node.homeX + Math.sin(motionTime * speed + node.phase) * drift;
  let targetY = node.homeY + Math.cos(motionTime * speed * 0.7 + node.phase) * drift;
  const dx = node.x - pointer.x;
  const dy = node.y - pointer.y;
  const distance = Math.hypot(dx, dy);
  if (distance < AMBIENT_FIELD.pointerRadius && pointer.strength > 0) {
    const falloff = (1 - distance / AMBIENT_FIELD.pointerRadius) ** 2;
    const force = falloff * AMBIENT_FIELD.pointerForce * pointer.strength * node.depth;
    targetX += (dx / Math.max(1, distance)) * force;
    targetY += (dy / Math.max(1, distance)) * force;
    // Advect each home vector around the cursor instead of settling at a fixed
    // tangential offset. Depth and a slow breathing current vary the angular speed.
    const hx = node.homeX - pointer.x,
      hy = node.homeY - pointer.y;
    const homeDistance = Math.hypot(hx, hy);
    const influence =
      Math.max(0, 1 - homeDistance / AMBIENT_FIELD.pointerRadius) ** 2 * pointer.strength;
    const angularSpeed = 1.6 + node.depth * 0.8 + Math.sin(motionTime * 0.7 + node.phase) * 0.25;
    node.orbitAngle =
      ((node.orbitAngle ?? 0) + Math.min(dt, 0.05) * angularSpeed * influence) % (Math.PI * 2);
    const angle = Math.atan2(hy, hx) + node.orbitAngle;
    const radius = Math.max(65 + node.depth * 15, homeDistance);
    targetX += (Math.cos(angle) * radius - hx) * influence;
    targetY += (Math.sin(angle) * radius - hy) * influence;
    const orbit = falloff * 16 * pointer.strength * node.depth;
    const pull =
      Math.sin((distance / AMBIENT_FIELD.pointerRadius) * Math.PI) ** 2 *
      (distance / AMBIENT_FIELD.pointerRadius) *
      28 *
      pointer.strength *
      node.depth;
    targetX += (-dy / Math.max(1, distance)) * orbit - (dx / Math.max(1, distance)) * pull;
    targetY += (dx / Math.max(1, distance)) * orbit - (dy / Math.max(1, distance)) * pull;
  }
  for (const relay of relays) {
    if (relay.node !== node) continue;
    const response = relayEnvelope(relay, time);
    if (!response) continue;
    const rx = node.homeX - relay.sourceX,
      ry = node.homeY - relay.sourceY;
    const length = Math.max(1, Math.hypot(rx, ry));
    targetX += ((rx - ry * 0.4) / length) * response * 48 * node.depth;
    targetY += ((ry + rx * 0.4) / length) * response * 48 * node.depth;
  }
  for (const pulse of pulses) {
    const age = time - pulse.born;
    if (age < 0 || age >= AMBIENT_FIELD.pulseLife) continue;
    const px = node.homeX - pulse.x;
    const py = node.homeY - pulse.y;
    const distance = Math.hypot(px, py);
    if (distance > AMBIENT_FIELD.pulseRadius) continue;
    const wave = Math.exp(-(((distance - pulseRadius(age)) / 45) ** 2));
    const force =
      wave *
      AMBIENT_FIELD.pulseForce *
      (1 - age / AMBIENT_FIELD.pulseLife) *
      (1 - distance / AMBIENT_FIELD.pulseRadius) ** 2 *
      node.depth;
    targetX += (px / Math.max(1, distance)) * force;
    targetY += (py / Math.max(1, distance)) * force;
  }
  const ease = 1 - Math.exp(-Math.min(dt, 0.05) * 5);
  node.x += (targetX - node.x) * ease;
  node.y += (targetY - node.y) * ease;
}
