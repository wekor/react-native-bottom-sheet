/// <reference types="bun" />

import { beforeAll, describe, expect, mock, test } from 'bun:test';

// Just enough of React Native for detent normalization, which only reaches for
// these at call time.
mock.module('react-native', () => ({
  I18nManager: { isRTL: false, doLeftAndRightSwapInRTL: true },
  Platform: { OS: 'ios' },
  processColor: (color: unknown) => color,
  StyleSheet: { flatten: (style: unknown) => style },
}));

let normalizeDetents: typeof import('../bottomSheetUtils').normalizeDetents;

beforeAll(async () => {
  ({ normalizeDetents } = await import('../bottomSheetUtils'));
});

describe('normalizeDetents', () => {
  test('carries maxWidth and placement on every detent, the closed one too', () => {
    const detents = normalizeDetents(
      [0, { value: 300, insets: { left: 16, right: 16 } }, '100%'],
      undefined,
      { maxWidth: 540, placementBias: 1 },
      false,
      false
    );
    for (const detent of detents) {
      expect(detent.maxWidth).toBe(540);
      expect(detent.placementBias).toBe(1);
    }
    // A closed detent's insets are 0, whatever was passed.
    expect(detents[0]!.insetLeft).toBe(0);
  });

  test('flags the card with the tightest side insets as widest', () => {
    const detents = normalizeDetents(
      [
        { value: 200, insets: { left: 40, right: 40 } },
        { value: 400, insets: { left: 8, right: 8 } },
      ],
      undefined,
      { maxWidth: 300, placementBias: 0.5 },
      false,
      false
    );
    expect(detents.map((detent) => detent.widestCard)).toEqual([false, true]);
  });
});
