export function buildItinerary(placeData, days, tripType, travelStyle) {
  const itinerary = [];

  for (let day = 1; day <= days; day++) {
    const data = placeData.days[day];
    if (!data) break;

    itinerary.push({
      day,
      title: data.title,
      plan: data.plans[tripType],
      places: data.places[tripType] || [],
      food: data.food[travelStyle] || [],
      adventure: data.adventure[tripType] || [],
      checklist: buildChecklist(data, tripType),
      essentials: data.essentials,
    });
  }

  return itinerary;
}

function buildChecklist(dayData, tripType) {
  return [
    ...dayData.places[tripType].map(p => `Visit ${p}`),
    ...dayData.food.budget.map(f => `Eat ${f}`),
    ...dayData.adventure[tripType].map(a => `Try ${a}`),
  ];
}
