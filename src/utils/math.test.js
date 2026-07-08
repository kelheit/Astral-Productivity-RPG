import { describe, it, expect } from "vitest";
import {
  calculateMaxHp,
  calculateXpToNext,
  calculateMidnightMath,
  calculateOverdueDamage,
} from "./math";

describe("calculateMaxHp", () => {
  it("returns 100 at level 0", () => {
    expect(calculateMaxHp(0)).toBe(100);
  });
  it("scales exponentially", () => {
    expect(calculateMaxHp(100)).toBe(10000);
    expect(calculateMaxHp(50)).toBe(1000);
    expect(calculateMaxHp(25)).toBe(316);
  });
  it("handles high levels", () => {
    expect(calculateMaxHp(200)).toBe(1000000);
  });
});

describe("calculateXpToNext", () => {
  it("matches calculateMaxHp", () => {
    expect(calculateXpToNext(0)).toBe(100);
    expect(calculateXpToNext(100)).toBe(10000);
  });
});

describe("calculateMidnightMath", () => {
  const maxHp = 1000;
  it("gives 10% regen with no damage", () => {
    const result = calculateMidnightMath(0, maxHp);
    expect(result.damage).toBe(0);
    expect(result.regen).toBe(100); // 10% of 1000
    expect(result.netLoss).toBe(-100);
  });
  it("caps damage at 30% maxHp", () => {
    const result = calculateMidnightMath(500, maxHp);
    expect(result.damage).toBe(300); // capped at 30%
    expect(result.regen).toBe(150); // 50% of 300
  });
  it("caps regen at 20% maxHp", () => {
    const result = calculateMidnightMath(maxHp, maxHp);
    expect(result.damage).toBe(300);
    expect(result.regen).toBe(150); // would be 50% of 300=150 < 200
  });
  it("handles small damage correctly", () => {
    const result = calculateMidnightMath(50, maxHp);
    expect(result.damage).toBe(50);
    expect(result.regen).toBe(25); // 50% of 50
  });
});

describe("calculateOverdueDamage", () => {
  const maxHp = 1000;
  it("returns 0 for non-overdue", () => {
    expect(calculateOverdueDamage(0, maxHp)).toBe(0);
    expect(calculateOverdueDamage(-1, maxHp)).toBe(0);
  });
  it("compounds overdue damage", () => {
    const d1 = calculateOverdueDamage(1, maxHp); // 1%
    expect(d1).toBe(10);
    const d2 = calculateOverdueDamage(2, maxHp); // 1.5%
    expect(d2).toBe(15);
    const d3 = calculateOverdueDamage(3, maxHp); // 2.25%
    expect(d3).toBe(23);
  });
});
