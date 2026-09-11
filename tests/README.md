# Storymap point-marker regression

Run `npm ci`, then `npm test`, `npm run lint`, and `npm run build`.

The unit tests exercise the actual marker/style callbacks and store templates.
They cover zero, positive, threshold, and above-range results for the three
Current Conditions concentration layers, plus ordinary wells and hidden label
points. Values and existing legend colors must remain unchanged.

For an isolated browser check, run `node tests/browser/server.mjs` and open
<http://127.0.0.1:8781/tests/browser/>. This mounts the real Storymap component
with the existing Current Conditions slide, boundaries, and local datasets.
It does not enter the application login flow or change production
authentication, and it is not included in the production build. Basemap
imagery still comes from the existing ArcGIS service.

Choose each concentration layer, then use **Inspect rendered markers**.
All concentration markers, including zero results, should be circles, with
zero triangle icons. **Hover zero-result point** should show the existing
location tooltip. These controls dispatch the real Leaflet hover handler.

This draft does not change data files, layer-to-file mappings, coordinates,
thresholds, chart behavior, or login behavior.
