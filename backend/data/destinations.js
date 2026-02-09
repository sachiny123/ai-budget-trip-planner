export const destinations = {
  manali: {
    meta: {
      name: "Manali",
      bestSeason: "October – February",
      baseDailyCost: 1800,
    },
    days: {
      1: baseHillDay("Manali"),
      2: adventureHillDay("Solang Valley"),
      3: scenicHillDay("Atal Tunnel & Sissu"),
    },
  },

  shimla: {
    meta: {
      name: "Shimla",
      bestSeason: "October – March",
      baseDailyCost: 1700,
    },
    days: {
      1: baseHillDay("Shimla"),
      2: scenicHillDay("Kufri"),
    },
  },

  leh: {
    meta: {
      name: "Leh Ladakh",
      bestSeason: "June – September",
      baseDailyCost: 2500,
    },
    days: {
      1: scenicHillDay("Leh Palace"),
      2: adventureHillDay("Nubra Valley"),
      3: scenicHillDay("Pangong Lake"),
    },
  },

  goa: {
    meta: {
      name: "Goa",
      bestSeason: "November – March",
      baseDailyCost: 2200,
    },
    days: {
      1: beachDay("North Goa"),
      2: beachDay("South Goa"),
      3: leisureDay("Cruise & Markets"),
    },
  },

  jaipur: {
    meta: {
      name: "Jaipur",
      bestSeason: "October – March",
      baseDailyCost: 1600,
    },
    days: {
      1: heritageDay("Amber Fort"),
      2: heritageDay("City Palace"),
    },
  },

  udaipur: {
    meta: {
      name: "Udaipur",
      bestSeason: "September – March",
      baseDailyCost: 1800,
    },
    days: {
      1: heritageDay("City Palace"),
      2: leisureDay("Lake Pichola"),
    },
  },

  rishikesh: {
    meta: {
      name: "Rishikesh",
      bestSeason: "September – April",
      baseDailyCost: 1500,
    },
    days: {
      1: spiritualDay("Ganga Aarti"),
      2: adventureHillDay("River Rafting"),
    },
  },

  amritsar: {
    meta: {
      name: "Amritsar",
      bestSeason: "October – March",
      baseDailyCost: 1400,
    },
    days: {
      1: heritageDay("Golden Temple"),
      2: patrioticDay("Wagah Border"),
    },
  },

  kerala: {
    meta: {
      name: "Kerala",
      bestSeason: "September – March",
      baseDailyCost: 2100,
    },
    days: {
      1: scenicHillDay("Munnar"),
      2: leisureDay("Alleppey Houseboat"),
    },
  },

  ooty: {
    meta: {
      name: "Ooty",
      bestSeason: "October – June",
      baseDailyCost: 1600,
    },
    days: {
      1: scenicHillDay("Botanical Garden"),
      2: leisureDay("Ooty Lake"),
    },
  },

  darjeeling: {
    meta: {
      name: "Darjeeling",
      bestSeason: "March – May",
      baseDailyCost: 1700,
    },
    days: {
      1: scenicHillDay("Tiger Hill"),
      2: scenicHillDay("Tea Gardens"),
    },
  },

  varanasi: {
    meta: {
      name: "Varanasi",
      bestSeason: "October – March",
      baseDailyCost: 1300,
    },
    days: {
      1: spiritualDay("Ganga Aarti"),
      2: heritageDay("Kashi Vishwanath"),
    },
  },
};

/* =================== DAY TEMPLATES =================== */

function baseHillDay(city) {
  return {
    title: `Explore ${city}`,
    plans: planByTripType(
      "Relaxed exploration",
      "Romantic walk",
      "Fun exploration",
      "Easy sightseeing"
    ),
    places: placesByTripType(
      ["Mall Road"],
      ["View Point"],
      ["Local Market"],
      ["Garden"]
    ),
    food: foodByStyle(),
    adventure: adventureByTripType(),
    essentials: essentialsCommon(),
  };
}

function adventureHillDay(place) {
  return {
    title: `Adventure at ${place}`,
    plans: planByTripType(
      "Light adventure",
      "Scenic adventure",
      "Full adventure",
      "Safe sightseeing"
    ),
    places: placesByTripType(
      [place],
      [place],
      [place],
      [place]
    ),
    food: foodByStyle(),
    adventure: {
      solo: ["Trekking"],
      couple: ["Cable car"],
      friends: ["Paragliding", "Zipline"],
      family: ["Ropeway"],
    },
    essentials: essentialsCommon(),
  };
}

function scenicHillDay(place) {
  return {
    title: `Scenic Day at ${place}`,
    plans: planByTripType(
      "Photography",
      "Scenic moments",
      "Road trip",
      "Relaxed views"
    ),
    places: placesByTripType(
      [place],
      [place],
      [place],
      [place]
    ),
    food: foodByStyle(),
    adventure: adventureByTripType(),
    essentials: essentialsCommon(),
  };
}

function beachDay(area) {
  return {
    title: `${area} Beach Day`,
    plans: planByTripType(
      "Relax",
      "Sunset moments",
      "Beach party",
      "Leisure walk"
    ),
    places: placesByTripType(
      ["Beach"],
      ["Beach"],
      ["Beach"],
      ["Beach"]
    ),
    food: foodByStyle(),
    adventure: {
      solo: [],
      couple: ["Jet ski"],
      friends: ["Parasailing"],
      family: [],
    },
    essentials: ["Sunscreen", "Flip flops"],
  };
}

function leisureDay(activity) {
  return {
    title: activity,
    plans: planByTripType(
      "Free exploration",
      "Leisure time",
      "Fun day",
      "Rest day"
    ),
    places: placesByTripType(
      [activity],
      [activity],
      [activity],
      [activity]
    ),
    food: foodByStyle(),
    adventure: adventureByTripType(),
    essentials: essentialsCommon(),
  };
}

function heritageDay(place) {
  return {
    title: `Heritage Visit: ${place}`,
    plans: planByTripType(
      "Explore history",
      "Cultural visit",
      "Guided tour",
      "Educational trip"
    ),
    places: placesByTripType(
      [place],
      [place],
      [place],
      [place]
    ),
    food: foodByStyle(),
    adventure: adventureByTripType(),
    essentials: ["Carry ID", "Respect dress code"],
  };
}

function spiritualDay(place) {
  return {
    title: `Spiritual Experience`,
    plans: planByTripType(
      "Self reflection",
      "Peaceful moments",
      "Cultural learning",
      "Family prayers"
    ),
    places: placesByTripType(
      [place],
      [place],
      [place],
      [place]
    ),
    food: foodByStyle(),
    adventure: adventureByTripType(),
    essentials: ["Modest clothing", "ID proof"],
  };
}

function patrioticDay(place) {
  return {
    title: place,
    plans: planByTripType(
      "Witness ceremony",
      "Patriotic moment",
      "Group experience",
      "Family visit"
    ),
    places: placesByTripType(
      [place],
      [place],
      [place],
      [place]
    ),
    food: foodByStyle(),
    adventure: adventureByTripType(),
    essentials: ["Arrive early", "Carry ID"],
  };
}

/* ================= HELPERS ================= */

function planByTripType(solo, couple, friends, family) {
  return { solo, couple, friends, family };
}

function placesByTripType(solo, couple, friends, family) {
  return { solo, couple, friends, family };
}

function foodByStyle() {
  return {
    budget: ["Local street food"],
    comfort: ["Local restaurant meal"],
    luxury: ["Premium dining experience"],
  };
}

function adventureByTripType() {
  return { solo: [], couple: [], friends: [], family: [] };
}

function essentialsCommon() {
  return ["Carry ID", "Comfortable shoes", "Water bottle"];
}
