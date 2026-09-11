import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

// Exercise the actual store templates and SFC callbacks without a browser.
const storeSource = readFileSync(
  new URL("../src/stores/storymap-store.js", import.meta.url),
  "utf8"
)
  .replace(/^import .*;\r?\n/gm, "")
  .replace("export const useStorymapStore", "const useStorymapStore");
const store = runInNewContext(`${storeSource}\nuseStorymapStore.state()`, {
  defineStore: (_name, definition) => definition,
  useRouter: () => undefined,
});
const source = readFileSync(
  new URL("../src/pages/storymap/MainMap.vue", import.meta.url),
  "utf8"
);
const style = source.slice(
  source.indexOf("    const getFeatureStyle ="),
  source.indexOf("    const activeLayers =")
);
const options = source.slice(
  source.indexOf("    const makeOptions ="),
  source.indexOf("    const getBounds =")
);
const makeOptions = runInNewContext(`${style}\n${options}\nmakeOptions`, {
  $store: store,
  template: undefined,
  circle: (latLng, markerOptions) => ({
    kind: "circle",
    latLng,
    options: markerOptions,
  }),
  L: {
    marker: (latLng, markerOptions) => ({
      kind: "marker",
      latLng,
      options: markerOptions,
    }),
    divIcon: (iconOptions) => iconOptions,
  },
});

for (const key of ["TCE_2010", "DCE_2010", "VC_2010"]) {
  const layer = store.layers[key];
  for (const result of [
    0,
    1,
    layer.template.limits[0],
    layer.template.limits[0] + 1,
    1000000,
  ]) {
    test(`${key}: result ${result} uses a circle with the unchanged legend color`, () => {
      const pointToLayer = makeOptions(layer, {}).pointToLayer;
      const latLng = [32.77, -97.43];
      const feature = { properties: { Result: result, layer } };
      const before = feature.properties.Result;
      const actual = pointToLayer(feature, latLng);
      const index = layer.template.limits.findIndex((limit) => result <= limit);
      const expectedColor =
        layer.template.colors[
          index < 0 ? layer.template.colors.length - 1 : index
        ];
      assert.equal(actual.kind, "circle");
      assert.equal(actual.latLng, latLng);
      assert.equal(actual.options.fillColor, expectedColor);
      assert.equal(actual.options.riseOnHover, true);
      assert.equal(feature.properties.Result, before);
    });
  }
}

test("non-analytical point layers retain their section styling", () => {
  const layer = { class: "wells", style: () => ({}) };
  const actual = makeOptions(layer, {}).pointToLayer(
    { properties: { Result: 0, layer } },
    [32.77, -97.43]
  );
  assert.equal(actual.kind, "circle");
  assert.equal(actual.options.radius, store.sections.wells.radius);
  assert.equal(actual.options.fillColor, store.sections.wells.fillColor);
});

test("label points retain their invisible styling, including zero results", () => {
  const layer = {
    class: "labels",
    style: () => ({}),
    template: store.layers.TCE_2010.template,
  };
  const actual = makeOptions(layer, {}).pointToLayer(
    { properties: { Result: 0, layer } },
    [32.77, -97.43]
  );
  assert.equal(actual.kind, "circle");
  assert.equal(actual.options.fillOpacity, 0);
  assert.equal(actual.options.opacity, 0);
});
