import { test, expect } from '@playwright/test';
import {
  AMBIENT_FIELD,
  createFieldNodes,
  addFieldPulse,
  pruneFieldEffects,
  pulseRadius,
  stepFieldNode,
  createFieldRelays,
  pruneFieldRelays,
  relayEnvelope,
  type FieldNode,
  type FieldPulse,
} from '../src/lib/ambient-field';

test('field fills wide viewports while mobile and 4K budgets remain bounded', () => {
  for (const [width, height] of [
    [375, 1080],
    [1440, 800],
    [3840, 900],
  ]) {
    const nodes = createFieldNodes(width, height);
    expect(nodes.length).toBeLessThanOrEqual(
      width <= 650 ? AMBIENT_FIELD.mobileNodes : AMBIENT_FIELD.maxNodes,
    );
    expect(Math.min(...nodes.map((n) => n.x))).toBeLessThan(width * 0.2);
    expect(Math.max(...nodes.map((n) => n.x))).toBeGreaterThan(width * 0.8);
    expect(Math.max(...nodes.map((n) => n.y))).toBeGreaterThan(height * 0.7);
  }
});

test('cursor flow keeps orbiting, stays bounded and settles after leaving at different frame rates', () => {
  const base = { homeX: 400, homeY: 400, x: 400, y: 400, depth: 1, phase: 0, kind: 0 };
  const results: FieldNode[] = [];
  for (const hz of [30, 60, 120]) {
    const node = { ...base };
    let midpoint = { ...node };
    for (let i = 1; i <= hz * 4; i++) {
      stepFieldNode(node, i / hz, 1 / hz, { x: 360, y: 400, strength: 1 }, [], 0);
      expect(Math.hypot(node.x - base.x, node.y - base.y)).toBeLessThan(180);
      if (i === hz * 2) midpoint = { ...node };
    }
    expect(Math.hypot(node.x - midpoint.x, node.y - midpoint.y)).toBeGreaterThan(40);
    results.push({ ...node });
    for (let i = 1; i <= hz * 4; i++)
      stepFieldNode(node, 4 + i / hz, 1 / hz, { x: 360, y: 400, strength: 0 }, [], 0);
    expect(Math.hypot(node.x - 400, node.y - 415)).toBeLessThan(0.01);
  }
  expect(Math.hypot(results[0].x - results[2].x, results[0].y - results[2].y)).toBeLessThan(1);
});

test('click chains reach unique neighbours in order, weaken, affect their targets and fully expire', () => {
  const nodes = [40, 130, 220, 310, 900].map((x) => ({
    homeX: x,
    homeY: 100,
    x,
    y: 100,
    depth: 1,
    phase: 0,
    kind: 0,
  }));
  const chain = createFieldRelays(nodes, 0, 100, 0, 1000);
  expect(chain).toHaveLength(AMBIENT_FIELD.relayHops);
  expect(new Set(chain.map((r) => r.node)).size).toBe(chain.length);
  chain.forEach((relay, i) => {
    expect(relay.node).toBe(nodes[i]);
    expect(relay.born).toBeGreaterThan(relay.start);
    expect(relayEnvelope(relay, relay.born - 0.01)).toBe(0);
    expect(relayEnvelope(relay, relay.born + AMBIENT_FIELD.relayLife)).toBe(0);
    if (i) {
      expect(relay.start).toBe(chain[i - 1].born);
      expect(relay.gain).toBeLessThan(chain[i - 1].gain);
    }
  });
  const target = chain[0].node;
  const baseline = { ...target };
  const pointer = { x: 0, y: 0, strength: 0 };
  const time = chain[0].born + AMBIENT_FIELD.relayLife / 2;
  stepFieldNode(target, time, 1 / 60, pointer, [], 0, chain);
  stepFieldNode(baseline, time, 1 / 60, pointer, [], 0);
  expect(Math.hypot(target.x - baseline.x, target.y - baseline.y)).toBeGreaterThan(1);
  const far = { ...nodes[4] },
    farControl = { ...nodes[4] };
  stepFieldNode(far, time, 1 / 60, pointer, [], 0, chain);
  stepFieldNode(farControl, time, 1 / 60, pointer, [], 0);
  expect(far).toEqual(farControl);
  expect(createFieldRelays([nodes[4]], 0, 100, 0)).toEqual([]);
  // Later clicks can arrive before an earlier chain's last hop.
  chain.push(...createFieldRelays(nodes, 0, 100, 0.01));
  pruneFieldRelays(chain, 3);
  expect(chain).toEqual([]);
});

test('rapid clicks stay capped, vary coherently, expire, and never grow beyond their radius', () => {
  const pulses: FieldPulse[] = [];
  for (let i = 0; i < 200; i++) addFieldPulse(pulses, 300, 200, i * 0.01);
  expect(pulses).toHaveLength(AMBIENT_FIELD.maxPulses);
  expect(new Set(pulses.map((p) => p.variant)).size).toBe(3);
  for (const age of [0, 0.1, 1, 2, 100])
    expect(pulseRadius(age)).toBeLessThanOrEqual(AMBIENT_FIELD.pulseRadius);
  pruneFieldEffects(pulses, 4, AMBIENT_FIELD.pulseLife);
  expect(pulses).toHaveLength(0);
});

test('pointer and pulse forces are local and return to the resting field', () => {
  const base = createFieldNodes(1440, 800)[15];
  const baseline = { ...base };
  const influenced = { ...base };
  const far = { ...base };
  for (let i = 1; i <= 120; i++) {
    stepFieldNode(baseline, i / 60, 1 / 60, { x: -1000, y: -1000, strength: 0 }, []);
    stepFieldNode(
      influenced,
      i / 60,
      1 / 60,
      { x: base.homeX - 40, y: base.homeY, strength: 1 },
      [],
    );
    stepFieldNode(far, i / 60, 1 / 60, { x: -1000, y: -1000, strength: 1 }, [
      { x: -1000, y: -1000, born: 0, variant: 0 },
    ]);
  }
  expect(Math.abs(influenced.x - baseline.x)).toBeGreaterThan(2);
  expect(far).toEqual(baseline);
  for (let i = 121; i <= 600; i++) {
    stepFieldNode(baseline, i / 60, 1 / 60, { x: 0, y: 0, strength: 0 }, []);
    stepFieldNode(influenced, i / 60, 1 / 60, { x: 0, y: 0, strength: 0 }, []);
  }
  expect(Math.hypot(influenced.x - baseline.x, influenced.y - baseline.y)).toBeLessThan(0.01);
});

test('motion remains consistent at 60 and 120Hz and clamps a suspended frame', () => {
  const node = createFieldNodes(1440, 800)[5];
  const at60 = { ...node };
  const at120 = { ...node };
  const pointer = { x: 0, y: 0, strength: 0 };
  for (let i = 1; i <= 240; i++) stepFieldNode(at60, i / 60, 1 / 60, pointer, []);
  for (let i = 1; i <= 480; i++) stepFieldNode(at120, i / 120, 1 / 120, pointer, []);
  expect(Math.hypot(at60.x - at120.x, at60.y - at120.y)).toBeLessThan(0.1);
  const before = { ...at60 };
  stepFieldNode(at60, 4, 600, pointer, []);
  expect(Math.hypot(at60.x - before.x, at60.y - before.y)).toBeLessThan(1);
});

test('nearby objects visibly deflect while distant objects remain undisturbed', () => {
  const base = { homeX: 400, homeY: 400, x: 400, y: 400, depth: 1, phase: 0, kind: 0 };
  const resting = { ...base };
  const reacting = { ...base };
  const distant = { ...base };
  for (let i = 1; i <= 120; i++) {
    stepFieldNode(resting, i / 60, 1 / 60, { x: 0, y: 0, strength: 0 }, [], 0);
    stepFieldNode(reacting, i / 60, 1 / 60, { x: 360, y: 400, strength: 1 }, [], 0);
    stepFieldNode(distant, i / 60, 1 / 60, { x: -200, y: 400, strength: 1 }, [], 0);
  }
  expect(Math.hypot(reacting.x - resting.x, reacting.y - resting.y)).toBeGreaterThan(28);
  expect(distant).toEqual(resting);
  const beyond = { ...base };
  const control = { ...base };
  stepFieldNode(
    beyond,
    0,
    1 / 60,
    { x: 400 - AMBIENT_FIELD.pointerRadius - 1, y: 400, strength: 1 },
    [],
    0,
  );
  stepFieldNode(control, 0, 1 / 60, { x: 0, y: 0, strength: 0 }, [], 0);
  expect(beyond).toEqual(control);
});
