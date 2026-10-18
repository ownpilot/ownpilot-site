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
};
export type FieldPulse = { x: number; y: number; born: number; variant: number };
export type FieldTrail = { x: number; y: number; born: number };
export type FieldPointer = { x: number; y: number; strength: number };

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
    // A tangential current and gentle outer pull make the field feel fluid.
    const orbit = falloff * 34 * pointer.strength * node.depth;
    const pull =
      Math.sin((distance / AMBIENT_FIELD.pointerRadius) * Math.PI) ** 2 *
      (distance / AMBIENT_FIELD.pointerRadius) *
      28 *
      pointer.strength *
      node.depth;
    targetX += (-dy / Math.max(1, distance)) * orbit - (dx / Math.max(1, distance)) * pull;
    targetY += (dx / Math.max(1, distance)) * orbit - (dy / Math.max(1, distance)) * pull;
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
