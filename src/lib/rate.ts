/*
 * https://github.com/formulajs/formulajs/blob/master/lib/financial.js#L778
 */

function monthlyRate(periods: number, payment: number, present: number, future = 0, type = 0, guess = 0.01) {
  const epsMax = 1e-10;
  const iterMax = 20;
  let rate = guess;

  type = type ? 1 : 0;
  for (let i = 0; i < iterMax; i++) {
    let y;
    let f;
    if (Math.abs(rate) < epsMax) {
      y = present * (1 + periods * rate) + payment * (1 + rate * type) * periods + future;
    } else {
      f = (1 + rate) ** periods;
      y = present * f + payment * (1 / rate + type) * (f - 1) + future;
    }
    if (Math.abs(y) < epsMax) {
      return rate;
    }
    let dy;
    if (Math.abs(rate) < epsMax) {
      dy = present * periods + payment * type * periods;
    } else {
      f = (1 + rate) ** periods;
      const df = periods * (1 + rate) ** (periods - 1);
      dy = present * df + payment * (1 / rate + type) * df + payment * (-1 / (rate * rate)) * (f - 1);
    }
    rate -= y / dy;
  }

  return rate;
}

export function rate(periods: number, payment: number, principle: number) {
  return (monthlyRate(periods, payment * -1, principle) * 12).toFixed(5);
}
