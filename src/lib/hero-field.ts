/** OwnPilot's compass field. Distances are CSS pixels, times are seconds. */
export const HERO_FIELD = {
  densityArea: 22_000,
  minNodes: 26,
  maxNodes: 100,
  mobileNodes: 22,
  mobileBreakpoint: 650,
  maxDpr: 1.75,
  maxPixels: 3_500_000,
  pointerRadius: 180,
  pointerForce: 38,
  linkRadius: 185,
  driftSpeed: 0.18,
  driftDistance: 15,
  pulseLife: 1.65,
  pulseRadius: 210,
  maxPulses: 6,
  trailLife: 0.7,
  maxTrails: 16,
  idleAfter: 5,
  entranceTime: 1.4,
  dark: ['#59b9e5', '#65d6a3', '#57c8c0'],
  light: ['#2585b2', '#258b62', '#258e91'],
} as const;

export type FieldNode = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  depth: number;
  phase: number;
  kind: number;
};
export type FieldPulse = { x: number; y: number; born: number; variant: number };
export type FieldTrail = { x: number; y: number; born: number };
export type FieldPointer = { x: number; y: number; strength: number };

export function createFieldNodes(width: number, height: number): FieldNode[] {
  const count =
    width <= HERO_FIELD.mobileBreakpoint
      ? HERO_FIELD.mobileNodes
      : Math.min(
          HERO_FIELD.maxNodes,
          Math.max(HERO_FIELD.minNodes, Math.round((width * height) / HERO_FIELD.densityArea)),
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

export function addFieldPulse(pulses: FieldPulse[], x: number, y: number, time: number) {
  const previous = pulses.at(-1);
  const variant = previous && time - previous.born < 0.35 ? (previous.variant + 1) % 3 : 0;
  pulses.push({ x, y, born: time, variant });
  if (pulses.length > HERO_FIELD.maxPulses) pulses.splice(0, pulses.length - HERO_FIELD.maxPulses);
}

export function pruneFieldEffects<T extends { born: number }>(
  items: T[],
  time: number,
  life: number,
) {
  while (items.length && time - items[0].born >= life) items.shift();
}

export function pulseRadius(age: number) {
  const progress = Math.max(0, Math.min(1, age / HERO_FIELD.pulseLife));
  return HERO_FIELD.pulseRadius * (1 - (1 - progress) ** 3);
}

export function stepFieldNode(
  node: FieldNode,
  time: number,
  dt: number,
  pointer: FieldPointer,
  pulses: FieldPulse[],
) {
  const drift = HERO_FIELD.driftDistance * node.depth;
  let targetX = node.homeX + Math.sin(time * HERO_FIELD.driftSpeed + node.phase) * drift;
  let targetY = node.homeY + Math.cos(time * HERO_FIELD.driftSpeed * 0.7 + node.phase) * drift;
  const dx = node.x - pointer.x;
  const dy = node.y - pointer.y;
  const distance = Math.hypot(dx, dy);
  if (distance < HERO_FIELD.pointerRadius && pointer.strength > 0) {
    const force =
      (1 - distance / HERO_FIELD.pointerRadius) ** 2 *
      HERO_FIELD.pointerForce *
      pointer.strength *
      node.depth;
    targetX += (dx / Math.max(1, distance)) * force;
    targetY += (dy / Math.max(1, distance)) * force;
  }
  for (const pulse of pulses) {
    const age = time - pulse.born;
    if (age < 0 || age >= HERO_FIELD.pulseLife) continue;
    const px = node.homeX - pulse.x;
    const py = node.homeY - pulse.y;
    const distance = Math.hypot(px, py);
    if (distance > HERO_FIELD.pulseRadius) continue;
    const wave = Math.exp(-(((distance - pulseRadius(age)) / 30) ** 2));
    const force = wave * 30 * (1 - age / HERO_FIELD.pulseLife) * node.depth;
    targetX += (px / Math.max(1, distance)) * force;
    targetY += (py / Math.max(1, distance)) * force;
  }
  const ease = 1 - Math.exp(-Math.min(dt, 0.05) * 5);
  node.x += (targetX - node.x) * ease;
  node.y += (targetY - node.y) * ease;
}

export function fieldPixelRatio(width: number, height: number, dpr: number) {
  return Math.min(dpr, HERO_FIELD.maxDpr, Math.sqrt(HERO_FIELD.maxPixels / (width * height)));
}
