/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

export interface PrideFlag {
  label: string;
  stripes: string[];
}

// Curated catalogue. `label` is what the API stores per member; `stripes` are
// the flag's horizontal bands, top to bottom, rendered as a small swatch.
export const PRIDE_FLAGS: PrideFlag[] = [
  {
    label: "Lesbian",
    stripes: ["#d52d00", "#ff9a56", "#ffffff", "#d362a4", "#a30262"],
  },
  {
    label: "Gay",
    stripes: ["#078d70", "#98e8c1", "#ffffff", "#7bade2", "#3d1a78"],
  },
  {
    label: "Bisexual",
    stripes: ["#d60270", "#9b4f96", "#0038a8"],
  },
  {
    label: "Pansexual",
    stripes: ["#ff218c", "#ffd800", "#21b1ff"],
  },
  {
    label: "Asexual",
    stripes: ["#000000", "#a3a3a3", "#ffffff", "#800080"],
  },
  {
    label: "Aromantic",
    stripes: ["#3da542", "#a7d379", "#ffffff", "#a9a9a9", "#000000"],
  },
  {
    label: "Transgender",
    stripes: ["#5bcefa", "#f5a9b8", "#ffffff", "#f5a9b8", "#5bcefa"],
  },
  {
    label: "Nonbinary",
    stripes: ["#fcf434", "#ffffff", "#9c59d1", "#2c2c2c"],
  },
  {
    label: "Genderfluid",
    stripes: ["#ff75a2", "#ffffff", "#be18d6", "#000000", "#333ebd"],
  },
  {
    label: "Genderqueer",
    stripes: ["#b57edc", "#ffffff", "#4a8123"],
  },
  {
    label: "Agender",
    stripes: ["#000000", "#bcc4c7", "#ffffff", "#b7f684", "#ffffff", "#bcc4c7", "#000000"],
  },
  {
    label: "Intersex",
    stripes: ["#ffd800", "#7a00ac"],
  },
  {
    label: "Demisexual",
    stripes: ["#000000", "#ffffff", "#6e0070", "#d3d3d3"],
  },
  {
    label: "Polyamory",
    stripes: ["#0000ff", "#ff0000", "#000000"],
  },
  {
    label: "Queer",
    stripes: ["#b57edc", "#ffffff", "#4a8123"],
  },
  {
    label: "Rainbow",
    stripes: ["#e40303", "#ff8c00", "#ffed00", "#008026", "#004dff", "#750787"],
  },
];

export function findPrideFlag(label: string): PrideFlag | undefined {
  return PRIDE_FLAGS.find((flag) => flag.label.toLowerCase() === label.toLowerCase());
}

export function prideSwatchGradient(stripes: string[]): string {
  const bandSize = 100 / stripes.length;
  const bands = stripes.map((color, index) => {
    const from = (bandSize * index).toFixed(2);
    const to = (bandSize * (index + 1)).toFixed(2);
    return `${color} ${from}%, ${color} ${to}%`;
  });
  return `linear-gradient(180deg, ${bands.join(", ")})`;
}
