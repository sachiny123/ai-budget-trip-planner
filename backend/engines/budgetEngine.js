export function calculateBudget(baseCost, days, travelStyle) {
  const multiplier = {
    budget: 1,
    comfort: 1.4,
    luxury: 2.2,
  };

  return {
    perDay: Math.round(baseCost * multiplier[travelStyle]),
    total: Math.round(baseCost * days * multiplier[travelStyle]),
  };
}
