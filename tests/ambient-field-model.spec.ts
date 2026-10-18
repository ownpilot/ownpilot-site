import { test, expect } from '@playwright/test';
import {
  AMBIENT_FIELD,
  createFieldNodes,
  addFieldPulse,
  pruneFieldEffects,
  pulseRadius,
  stepFieldNode,
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
