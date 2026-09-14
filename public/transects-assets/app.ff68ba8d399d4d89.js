import { selectSamples, colorFor, legendFor, linear, markersFor } from './model.7a5614e750a8b3e7.js';

const ns = 'http://www.w3.org/2000/svg';
const el = id => document.getElementById(id);
const number = value => new Intl.NumberFormat('en-US', { maximumSignificantDigits: 10 }).format(value);
function svgNode(tag, attrs = {}, text) {
  const node = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
}
function cell(row, value) {
  const td = document.createElement('td');
  if (value instanceof Node) td.append(value); else td.textContent = value;
  row.append(td);
}
function dateSummary(samples) {
  const dates = [...new Set(samples.map(s => s.date))].sort();
  if (dates.length <= 2) return dates.join(' / ');
  return `${dates.length} dates: ${dates[0]} – ${dates.at(-1)}`;
}
const coordinateKey = markers => markers.map(m => JSON.stringify(m.coordinates)).sort().join('|');

async function start() {
  const response = await fetch(document.body.dataset.source, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Data request failed (${response.status})`);
  const data = await response.json();
  if (data.section !== document.body.dataset.section || !data.wells?.length) throw new Error('Unexpected transect data');
  const mode = document.body.dataset.mode;
  const screens = svgNode('g', { id: 'screens' });
  el('profile').append(screens);
  let chosenWell = null;
  const queryAnalyte = new URL(location.href).searchParams.get('analyte');
  if (Object.hasOwn(data.labels, queryAnalyte)) el('analyte').value = queryAnalyte;
  el('mode').addEventListener('change', () => {
    const target = new URL(`s2${data.section.toLowerCase()}_${el('mode').value}.html`, location.href);
    if (el('analyte').value) target.searchParams.set('analyte', el('analyte').value);
    location.assign(target.href);
  });

  function history(well) {
    chosenWell = well;
    const analyte = el('analyte').value;
    const samples = well.samples[analyte] || [];
    const chart = el('history');
    chart.replaceChildren();
    chart.removeAttribute('data-latest');
    chart.removeAttribute('data-samples');
    chart.setAttribute('aria-label', 'Sample history chart');
    el('history-body').replaceChildren();
    el('history-records').hidden = !samples.length;
    el('history-title').textContent = `${well.id} — ${data.labels[analyte]}`;
    for (const group of screens.children) group.classList.toggle('selected', group.dataset.well === well.id);
    if (!samples.length) {
      el('detail').textContent = 'No source measurements for this well and analyte.';
      return;
    }
    const dates = samples.map(s => Date.parse(`${s.date}T00:00:00Z`));
    const minimumDate = Math.min(...dates), maximumDate = Math.max(...dates);
    const pad = minimumDate === maximumDate ? 183 * 86400000 : 0;
    const timeDomain = [minimumDate - pad, maximumDate + pad];
    const maxValue = Math.max(...samples.map(s => s.result));
    const x = date => linear(date, timeDomain, [70, 1170]);
    const y = value => linear(value, [0, maxValue || 1], [180, 25]);
    chart.dataset.latest = samples.at(-1).date;
    chart.dataset.samples = String(samples.length);
    chart.setAttribute('aria-label', `${well.id}, ${data.labels[analyte]}, ${samples.length} plotted measurements, ${samples[0].date} through ${samples.at(-1).date}`);
    chart.append(svgNode('title', {}, chart.getAttribute('aria-label')));
    chart.append(svgNode('path', { d: 'M70,25V180H1170', class: 'chart-axis' }));
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue || 1) * i / 5;
      chart.append(svgNode('line', { x1: 70, x2: 1170, y1: y(value), y2: y(value), class: 'grid' }));
      chart.append(svgNode('text', { x: 62, y: y(value) + 4, 'text-anchor': 'end', class: 'axis-text' }, number(value)));
      const date = timeDomain[0] + (timeDomain[1] - timeDomain[0]) * i / 5;
      chart.append(svgNode('text', { x: x(date), y: 202, 'text-anchor': 'middle', class: 'axis-text' }, new Date(date).toISOString().slice(0, 10)));
    }
    chart.append(svgNode('text', { x: 6, y: 15, class: 'axis-text' }, 'µg/L'));
    const path = samples.map((s, i) => `${i ? 'L' : 'M'}${x(dates[i])},${y(s.result)}`).join(' ');
    chart.append(svgNode('path', { d: path, class: 'history-line' }));
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      const point = svgNode('circle', { cx: x(dates[i]), cy: y(sample.result), r: 3.5,
        fill: colorFor(analyte, sample.result), stroke: '#555', 'data-date': sample.date, 'data-result': sample.result });
      point.append(svgNode('title', {}, `${sample.date}: ${number(sample.result)} µg/L`));
      chart.append(point);
      const row = document.createElement('tr');
      cell(row, sample.date); cell(row, number(sample.result));
      el('history-body').append(row);
    }
    const values = selectSamples(samples, mode);
    el('detail').textContent = `${well.id} · ${data.labels[analyte]} · ${mode === 'mr' ? 'Latest' : 'Maximum'}: ${[...new Set(values.map(s => s.result))].map(number).join(' / ')} µg/L (${dateSummary(values)}). History: ${samples.length} distinct date/result measurements through ${samples.at(-1).date}.`;
  }

  function render() {
    const analyte = el('analyte').value;
    const position = el('position').value;
    screens.replaceChildren(); el('legend').replaceChildren(); el('results').replaceChildren();
    el('history').replaceChildren(); el('history-body').replaceChildren();
    el('history').removeAttribute('data-latest');
    el('history').removeAttribute('data-samples');
    el('history').setAttribute('aria-label', 'Sample history chart');
    el('history-records').hidden = true;
    el('history-title').textContent = 'Well history';
    el('detail').textContent = 'Choose an analyte, then click a screen or a well in the table.';
    el('warning').hidden = true;
    el('status').textContent = `${data.wells.length} wells · Source data through ${data.latest}${analyte ? ` · ${data.labels[analyte]}` : ''}`;
    if (!analyte) return;
    const affected = [];
    for (const well of data.wells) {
      const samples = selectSamples(well.samples[analyte] || [], mode);
      const markers = markersFor(well, analyte, mode, position, data.layout);
      const corrected = markersFor(well, analyte, mode, 'joinedX', data.layout);
      const joined = markersFor(well, analyte, mode, 'joined', data.layout);
      const elevationDifference = coordinateKey(corrected) !== coordinateKey(joined);
      const originalXDifference = position === 'shape' && coordinateKey(markers) !== coordinateKey(corrected);
      const review = markers.length > 1 || elevationDifference || originalXDifference;
      if (review) affected.push(well.id);
      for (const marker of markers) {
        const group = svgNode('g', { tabindex: 0, role: 'button', 'data-well': well.id,
          'aria-label': `${well.id}: ${marker.results.map(number).join(' / ')} micrograms per liter; show sample history`,
          class: `well-screen${review ? ' needs-review' : ''}` });
        marker.results.forEach((result, i) => group.append(svgNode('rect', {
          x: marker.x + i * marker.width / marker.results.length, y: marker.y,
          width: marker.width / marker.results.length, height: marker.height,
          fill: colorFor(analyte, result), 'data-result': result,
        })));
        group.append(svgNode('title', {}, `${well.id}: ${marker.results.map(number).join(' / ')} µg/L; ${marker.dates.join(', ')}${review ? '; position needs review' : ''}`));
        group.addEventListener('mouseenter', () => history(well));
        group.addEventListener('focus', () => history(well));
        group.addEventListener('click', () => history(well));
        group.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); history(well); } });
        screens.append(group);
      }
      const row = document.createElement('tr');
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'well-link'; button.textContent = well.id;
      button.addEventListener('click', () => history(well));
      cell(row, button); cell(row, samples.length ? dateSummary(samples) : 'No samples');
      cell(row, [...new Set(samples.map(s => s.result))].map(number).join(' / ') || '—');
      const xs = [...new Set(markers.map(m => m.coordinates[0]))].sort((a, b) => a - b);
      const intervals = new Set(markers.map(m => JSON.stringify(m.coordinates.slice(1))));
      const checks = markers.length ? [`${position === 'shape' ? 'First X' : 'X_1'}: ${xs.map(number).join(' / ')}`] : ['No source coordinates'];
      if (xs.length > 1) checks.push(`${xs.length} horizontal positions`);
      if (intervals.size > 1) checks.push(`${intervals.size} screen intervals`);
      if (elevationDifference) checks.push('screen-elevation fields differ');
      if (originalXDifference) checks.push('first X differs from confirmed X_1');
      cell(row, checks.join('; '));
      el('results').append(row);
    }
    for (const item of legendFor(analyte)) {
      const label = document.createElement('span');
      const swatch = document.createElement('i'); swatch.style.backgroundColor = item.color;
      label.append(swatch, document.createTextNode(`${item.label} µg/L`)); el('legend').append(label);
    }
    el('profile').dataset.markerCount = String(screens.children.length);
    el('profile').dataset.wellCount = String(data.wells.length);
    if (affected.length) {
      el('warning').textContent = `Position checks: ${affected.join(', ')}. The default uses the confirmed second X field with unchanged exported screen elevations. Multiple positions and elevation differences remain visible; the other views are comparisons only.`;
      el('warning').hidden = false;
    }
    if (chosenWell) history(chosenWell);
  }
  el('analyte').addEventListener('change', () => { chosenWell = null; render(); });
  el('position').addEventListener('change', render);
  render();
  document.body.dataset.ready = 'true';
}

start().catch(error => {
  el('status').textContent = `Unable to load this transect: ${error.message}. Please reload or contact support.`;
  el('status').setAttribute('role', 'alert');
  document.body.dataset.ready = 'error';
});
