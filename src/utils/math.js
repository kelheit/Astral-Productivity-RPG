export function calculateMaxHp(level) {
  return Math.round(100 * Math.pow(100, level / 100));
}

export function calculateXpToNext(level) {
  return Math.round(100 * Math.pow(100, level / 100));
}

export function calculateMidnightMath(damageDealt, maxHp) {
  const cappedDamage = Math.min(damageDealt, maxHp * 0.30);
  let regen;
  if (cappedDamage === 0) {
    regen = maxHp * 0.10;
  } else {
    regen = Math.min(cappedDamage * 0.50, maxHp * 0.20);
  }
  return {
    damage: Math.round(cappedDamage),
    regen: Math.round(regen),
    netLoss: Math.round(cappedDamage - regen),
  };
}

export function calculateOverdueDamage(daysOverdue, maxHp) {
  if (daysOverdue <= 0) return 0;
  const damagePct = 0.01 * Math.pow(1.5, daysOverdue - 1);
  return Math.round(maxHp * damagePct);
}
