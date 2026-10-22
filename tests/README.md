# Storymap regression checks

Run `npm ci`, then `npm test`, `npm run lint`, and `npm run build`.

## Point markers

The marker unit tests exercise the actual marker/style callbacks and store templates.
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

The marker fix does not change data files, layer-to-file mappings, coordinates,
thresholds, chart behavior, or login behavior.

## Login retry (local draft)

`tests/login.test.mjs` adds 29 cases against the actual `BaseLogin.vue` setup
function, with simulated requests, storage, navigation, and time. It never calls
the real authentication service. Coverage includes success, 401/403 credentials
errors, other HTTP errors, malformed/unexpected JSON, network failure, a
15-second request/body timeout, empty inputs, duplicate submission,
session/navigation failures, and successful retry without refresh.

Together with the 17 marker cases, `npm test` runs 46 tests. The equivalent
Private GIS login component also passed an isolated real-browser fixture for
empty inputs, failure/retry, service/network/JSON errors, timeout, and success.
Storymap's own login handler is covered by this repository's unit tests and
production build; its negative login cases were not sent to the live service.

The login changes are parked on `fix/login-retry` for later review. Do not merge
or deploy them without separate approval.
