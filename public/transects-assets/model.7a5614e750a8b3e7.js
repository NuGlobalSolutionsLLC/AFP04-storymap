// Pure display rules; no alteration of source measurements or hidden tie-breaking.
export function selectSamples(samples, mode) {
  if (!['mr', 'max'].includes(mode)) throw new Error('Unknown display mode');
  if (!samples.length) return [];
  const key = mode === 'mr' ? 'date' : 'result';
  const best = samples.reduce((value, row) => row[key] > value ? row[key] : value, samples[0][key]);
  return samples.filter(row => row[key] === best);
}

const LEGENDS = {
  TCE: [[5, '#00ff00', '0–5'], [50, '#00ffc5', '>5–50'], [100, '#e9ffbe', '>50–100'],
    [400, '#ffff00', '>100–400'], [1000, '#ffebaf', '>400–1,000'], [5000, '#ffaa00', '>1,000–5,000'],
    [10000, '#ff0000', '>5,000–10,000'], [Infinity, '#8400a8', '>10,000']],
  CIS12DCE: [[0, '#38A800', '0'], [5, '#8BD100', '>0–5'], [50, '#FFFF00', '>5–50'],
    [500, '#FF8000', '>50–500'], [Infinity, '#FF0000', '>500']],
  VC: [[2, '#00ff00', '0–2'], [20, '#e9ffbe', '>2–20'], [200, '#ffff00', '>20–200'],
    [1000, '#ffebaf', '>200–1,000'], [20000, '#ffaa00', '>1,000–20,000'],
    [100000, '#ff0000', '>20,000–100,000'], [Infinity, '#8400a8', '>100,000']],
};

export function legendFor(analyte) {
  if (!LEGENDS[analyte]) throw new Error('Unknown analyte');
  return LEGENDS[analyte].map(([, color, label]) => ({ color, label }));
}

export function colorFor(analyte, result) {
  if (!Number.isFinite(result) || result < 0 || !LEGENDS[analyte]) throw new Error('Invalid concentration');
  return LEGENDS[analyte].find(([limit]) => result <= limit)[1];
}

export function linear(value, domain, range) {
  if (domain[0] === domain[1]) throw new Error('Degenerate scale');
  return range[0] + (value - domain[0]) * (range[1] - range[0]) / (domain[1] - domain[0]);
}

export function screenBox(coordinates, layout) {
  const [along, top, bottom] = coordinates;
  if (![along, top, bottom].every(Number.isFinite) || top <= bottom) throw new Error('Invalid screen geometry');
  const y = linear(top / layout.elevationExaggeration, layout.yDomain, layout.yRange);
  const end = linear(bottom / layout.elevationExaggeration, layout.yDomain, layout.yRange);
  return { x: linear(along, layout.xDomain, layout.xRange), y, width: 7, height: end - y };
}

export function markersFor(well, analyte, mode, position, layout) {
  if (!['joinedX', 'shape', 'joined'].includes(position)) throw new Error('Unknown geometry source');
  const groups = new Map();
  for (const sample of selectSamples(well.samples[analyte] || [], mode)) {
    for (const coordinates of sample[position]) {
      const key = JSON.stringify(coordinates);
      if (!groups.has(key)) groups.set(key, { coordinates, results: new Set(), dates: new Set() });
      groups.get(key).results.add(sample.result);
      groups.get(key).dates.add(sample.date);
    }
  }
  return [...groups.values()].map(group => ({ ...screenBox(group.coordinates, layout),
    coordinates: group.coordinates, results: [...group.results].sort((a, b) => a - b), dates: [...group.dates].sort() }));
}
