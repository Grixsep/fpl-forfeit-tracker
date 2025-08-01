// New shared utility file for FPL functions
export interface Period {
  start: number;
  end: number;
}

export const forfeits = [
  { weeks: "1-4", description: "Stare at wall for 30 minutes without music" },
  {
    weeks: "5-8",
    description: "Ghost Chilli, or teaspoon of Carolina Reaper sauce",
  },
  {
    weeks: "9-12",
    description:
      "Presentation on why you lost, 5 minute PowerPoint live with us",
  },
  {
    weeks: "13-16",
    description: "Ball to balls (lie down, spread legs, someone drops it)",
  },
  { weeks: "17-20", description: "Ice bucket Outside (no towel for 1 min)" },
  {
    weeks: "21-24",
    description:
      "Chug 2l of milk in 2 min (if fail then add 20 GBP to prize pool)",
  },
  {
    weeks: "25-28",
    description: "Makeup Tutorial (3 min vid, solo, serious and real makeup)",
  },
  {
    weeks: "29-32",
    description:
      "Raw egg (1 egg in a glass to be swallowed, if fail then 20 GBP)",
  },
  {
    weeks: "33-38",
    description: "Depressing Meal (Others pick from a list of food)",
  },
];

export function getCurrentPeriod(gameweek: number): Period {
  if (gameweek <= 4) return { start: 1, end: 4 };
  if (gameweek <= 8) return { start: 5, end: 8 };
  if (gameweek <= 12) return { start: 9, end: 12 };
  if (gameweek <= 16) return { start: 13, end: 16 };
  if (gameweek <= 20) return { start: 17, end: 20 };
  if (gameweek <= 24) return { start: 21, end: 24 };
  if (gameweek <= 28) return { start: 25, end: 28 };
  if (gameweek <= 32) return { start: 29, end: 32 };
  return { start: 33, end: 38 };
}

export function getForfeitByPeriod(period: Period) {
  const periodIndex = Math.floor((period.start - 1) / 4);
  return forfeits[periodIndex] || forfeits[0];
}
