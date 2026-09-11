import { createApp, h, ref, toRaw, nextTick } from "vue";
import { createPinia } from "pinia";
import {
  Quasar,
  QLayout,
  QPageContainer,
  QPage,
  QCard,
  QCardSection,
  QBtn,
  QSlideTransition,
} from "quasar";
import "quasar/dist/quasar.css";
import MainMap from "../../src/pages/storymap/MainMap.vue";
import { useStorymapStore } from "../../src/stores/storymap-store.js";
import { useMapStore } from "../../src/stores/map-store.js";

const pinia = createPinia();
const store = useStorymapStore(pinia);
const mapStore = useMapStore(pinia);
const keys = ["TCE_2010", "DCE_2010", "VC_2010"];
const slide = store.slides.find(
  (candidate) => candidate.title === "Current Conditions"
);
slide.active = true;
store.slides = [slide];
store.layers = Object.fromEntries(
  Object.entries(store.layers).filter(
    ([, layer]) =>
      slide.layers.includes(layer) || slide.contextLayers.includes(layer)
  )
);
store.leftDrawerOpen = false;

const style = document.createElement("style");
style.textContent = `body{margin:0} .fixture-controls{position:fixed;bottom:0;left:0;right:0;z-index:10000;background:#fff;padding:10px;border-top:2px solid #0875a0;font:14px system-ui} .fixture-controls button{margin:3px;padding:6px} .fixture-controls output{display:block;white-space:pre-wrap} .q-layout{padding-bottom:135px} .q-page{min-height:calc(100vh - 135px)!important}`;
document.head.append(style);

const app = createApp({
  setup() {
    const component = ref(null);
    const status = ref(
      "Local-only component fixture; choose a concentration layer when loaded."
    );
    const errors = ref([]);
    let hovered;
    const getMap = () => toRaw(component.value?.mapRef?.leafletObject);
    const recordError = (error) => {
      errors.value = [...errors.value, String(error?.stack || error)];
    };
    window.addEventListener("error", (event) => recordError(event.error));
    window.addEventListener("unhandledrejection", (event) =>
      recordError(event.reason)
    );
    const points = () => {
      const found = [];
      getMap()?.eachLayer?.((layer) => {
        if (
          layer.feature?.geometry?.type === "Point" &&
          layer.feature.properties.layer?.class === "chemdata"
        )
          found.push(layer);
      });
      return found;
    };
    const inspect = () => {
      const markers = points();
      const zero = markers.filter(
        (layer) => layer.feature.properties.Result === 0
      );
      status.value = `${markers.length} concentration markers; ${
        zero.length
      } zero results; ${
        markers.filter((layer) => typeof layer.setStyle === "function").length
      } circles; ${
        document.querySelectorAll(".arrow-up").length
      } triangle icons; zero-result colors: ${[
        ...new Set(zero.map((layer) => layer.options.fillColor)),
      ].join(", ")}`;
    };
    const activate = async (key) => {
      if (hovered) hovered.fire("mouseout", { target: hovered });
      hovered = null;
      if (!store.layers[key].data) {
        status.value = "Layer still loading";
        return;
      }
      mapStore.selectedFeature = null;
      keys.forEach((candidate) => {
        if (store.layers[candidate].data)
          store.layers[candidate].data.active = candidate === key;
      });
      store.lastClickedLayer = store.layers[key].file;
      await nextTick();
      status.value = `Active: ${store.layers[key].label}`;
    };
    const hoverZero = () => {
      if (hovered) hovered.fire("mouseout", { target: hovered });
      const map = getMap();
      const candidates = points().filter(
        (layer) => layer.feature.properties.Result === 0
      );
      hovered =
        candidates.find((layer) =>
          map.getBounds().contains(layer.getLatLng())
        ) || candidates[0];
      if (!hovered) {
        status.value = "No zero-result point rendered";
        return;
      }
      hovered.fire("mouseover", {
        target: hovered,
        latlng: hovered.getLatLng(),
      });
      status.value =
        "Zero-result point hovered; existing tooltip and circle styling should remain available";
    };
    return () =>
      h(
        QLayout,
        {},
        {
          default: () => [
            h(
              QPageContainer,
              {},
              { default: () => h(MainMap, { ref: component }) }
            ),
            h(
              "section",
              {
                class: "fixture-controls",
                "aria-label": "Local test controls",
              },
              [
                h(
                  "strong",
                  "Local-only Storymap regression fixture — Current Conditions"
                ),
                h(
                  "div",
                  keys.map((key) =>
                    h(
                      "button",
                      { onClick: () => activate(key) },
                      store.layers[key].label
                    )
                  )
                ),
                h("button", { onClick: inspect }, "Inspect rendered markers"),
                h("button", { onClick: hoverZero }, "Hover zero-result point"),
                h("output", { "data-testid": "fixture-status" }, status.value),
                h(
                  "output",
                  { "data-testid": "fixture-errors" },
                  errors.value.join("\n")
                ),
              ]
            ),
          ],
        }
      );
  },
});
app.use(pinia);
app.use(Quasar, {
  components: {
    QLayout,
    QPageContainer,
    QPage,
    QCard,
    QCardSection,
    QBtn,
    QSlideTransition,
  },
});
app.mount("#app");
