<template>
  <q-page class="flex flex-center" ref="pageRef">
    <div class="debug" v-if="false"></div>
    <l-map
      ref="mapRef"
      :style="`height: ${height};`"
      :zoom="14"
      :center="[32.7713, -97.4366]"
      :min-zoom="12"
      :max-zoom="19"
      :options="mapOptions"
    >
      <l-control-attribution
        position="bottomright"
        :prefix="attributionPrefix"
      />

      <l-tile-layer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="AFP4 WebGIS"
        :maxZoom="22"
      />

      <l-geo-json
        v-for="(geojson, index) in activeLayers"
        :key="index"
        :geojson="geojson"
        :options="geojson.options"
        :style="'z-index: ' + index + ';'"
      />
      <l-geo-json :geojson="selected.feature" v-if="selected" />

      <map-legend :layers="legendLayers" />
    </l-map>

    <LineChart
      ref="chartRef"
      :class="(selected && 'active chart') || 'chart'"
      :height="180"
      :width="getWidth"
      :style="'width:' + getWidth + 'px !important;'"
    />
  </q-page>
</template>

<script>
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import LineChart from "src/components/LineChart.vue";
import MapLegend from "src/components/MapLegend.vue";
import {
  defineComponent,
  onBeforeMount,
  onMounted,
  computed,
  // reactive,
  ref,
  watchEffect,
} from "vue";
import {
  LMap,
  LGeoJson,
  LTileLayer,
  LControlAttribution,
} from "@vue-leaflet/vue-leaflet";
import { useStorymapStore } from "src/stores/storymap-store";
import { useMapStore } from "src/stores/map-store";

export default defineComponent({
  name: "MainMap",
  components: {
    MapLegend,
    LineChart,
    LControlAttribution,
    LMap,
    LGeoJson,
    LTileLayer,
  },
  setup() {
    const $store = useStorymapStore();
    const $mapStore = useMapStore();
    const pageRef = ref(null);
    const mapRef = ref(null);
    const chartRef = ref(null);
    const mapOptions = {
      preferCanvas: true,
      attributionControl: false,
    };
    let geojsonOptions = ref({});
    let height = ref(0);
    let circle;
    let template;
    let map;
    let leftDrawerOpen = true;

    const selected = computed(() => {
      return $mapStore.selectedFeature;
    });

    const refreshChart = () => {
      if (chartRef.value && chartRef.value.chart.value) {
        chartRef.value.chart.updateChart();
      }
    };

    const getWidth = computed(() => {
      if (pageRef.value) {
        const node = pageRef.value.$el.parentNode.parentNode;
        let width = parseInt(getComputedStyle(node).width) - 340;
        if (!$store.leftDrawerOpen) {
          width = parseInt(getComputedStyle(node).width) - 40;
        }
        refreshChart();
        return width;
      }
      return 0;
    });

    const getActiveSlide = () => {
      document.querySelector(".leaflet-tooltip-pane").innerHTML = "";
      return $store.slides.find((slide) => slide.active);
    };

    const getFeatureStyle = (feature) => {
      let defaultParams = Object.assign(
        {},
        $store.sections[feature.properties.layer.class]
      );
      template = feature.properties.layer.template;
      if (template) {
        defaultParams = Object.assign(defaultParams, template);
      }
      if (template && "limits" in template && "colors" in template) {
        const step = template.limits.find((limit) => {
          return feature.properties.Result <= limit;
        });
        const index = template.limits.indexOf(step);
        const color =
          index !== -1
            ? template.colors[index]
            : template.colors[template.colors.length - 1];
        if (feature.properties.layer.class === "labels") {
          return Object.assign(defaultParams, {
            color: "#00000000",
            fillColor: "#00000000",
            fillOpacity: 0,
            opacity: 0,
            radius: 1,
            weight: 1,
          });
        }
        return Object.assign(defaultParams, {
          color: "black",
          fillColor: color,
          fillOpacity: 1,
          radius: 6,
          weight: 1,
        });
      }
      return defaultParams;
    };

    const activeLayers = computed(() => {
      const dependencies = {};
      const layers = geoJsons.value.filter((layer) => {
        if (
          (layer.options.active || layer.active) &&
          "dependencies" in layer &&
          layer.dependencies
        ) {
          layer.dependencies.forEach((dependency) => {
            if (!(dependency in dependencies))
              dependencies[dependency] = $store.layers[dependency].data;
          });
        }
        return layer.options.active || layer.active;
      });
      return [...Object.values(dependencies), ...layers];
    });

    const addTooltip = (feature, leafletLayer) => {
      if (feature.properties.layer.tooltip) {
        let label = feature.properties.layer.tooltip;
        if (typeof label === "function") {
          label = label(feature);
        }

        const tooltip = `
          <span data-id="${
            feature.properties.layer.label
          }" style="position: relative; color: white; -webkit-text-stroke: 1px ${
          feature.properties.layer.style(feature).color
        }">${label}</span>
        `;

        let latLng = leafletLayer._latlng || leafletLayer._latlngs[0];
        while (typeof latLng.length !== "undefined") latLng = latLng[0];
        const obj = map.openTooltip(tooltip, latLng, {
          permanent: true,
          opacity: 1,
          direction: "center",
          offset: new L.Point(...feature.properties.layer.tooltipOffset),
          // file: feature.properties.layer.file,
          file: $store.lastClickedLayer + "",
        });
        // $store.activeTooltips.push(obj);
      }
    };

    const makeOptions = (layer, options) => {
      let params = Object.assign({}, $store.sections[layer.class]);
      if (!options) {
        options = { active: false };
      }
      if (layer.tooltip || layer.style) {
        options.pointToLayer = (feature, latLng) => {
          const params = getFeatureStyle(feature);
          params.riseOnHover = true;
          if (feature.properties.Result === 0) {
            return L.marker(latLng, {
              icon: L.divIcon({ className: "arrow-up" }),
            });
          } else {
            return circle(latLng, params);
          }
        };
        options.onEachFeature = function (feature, leafletLayer) {
          addTooltip(feature, leafletLayer);

          if (
            feature.properties.layer.style &&
            "setStyle" in leafletLayer &&
            feature.geometry.type !== "Point"
          ) {
            leafletLayer.setStyle(feature.properties.layer.style(feature));
          }
          leafletLayer.on("remove", () => {
            map.eachLayer((_layer) => {
              if (
                _layer.options.pane === "tooltipPane" &&
                _layer.options.file === $store.lastRemovedLayer
              ) {
                _layer.removeFrom(map);
              }
            });
          });
          let popup, tooltip;
          leafletLayer.on("mouseover", function (event) {
            // const layer = feature.properties.layer;
            if ("setStyle" in this) {
              params = Object.assign(params, event.target.options);
              const hoverStyle = layer.hoverStyle || params.hoverStyle || null;
              if (hoverStyle) this.setStyle(hoverStyle);
              if (feature.properties.layer.data.options.type !== "baseLayer") {
                if (feature.geometry.type === "Point")
                  event.target.bringToFront();
              } else {
                event.target.bringToBack();
              }
              let tooltipFunc =
                params.tooltip ||
                (feature.properties.layer.options &&
                  feature.properties.layer.options.tooltip);
              if (tooltipFunc) {
                let latlng;
                if (event.target._latlng) latlng = event.target._latlng;
                else latlng = event.target.getCenter();
                tooltip = L.popup({ autoClose: true })
                  .setLatLng(latlng)
                  .setContent(tooltipFunc(event.target))
                  .openOn(map);
              }
            }
          });
          leafletLayer.on("mouseout", function (event) {
            if ("setStyle" in this) {
              const hoverStyle = layer.hoverStyle || params.hoverStyle || null;
              if (hoverStyle) {
                params = Object.assign(params, event.target.options);
                if (
                  feature.properties.layer.options &&
                  feature.properties.layer.options.style
                ) {
                  this.setStyle(
                    feature.properties.layer.options.style(feature)
                  );
                } else {
                  this.setStyle(getFeatureStyle(feature));
                }
              }
              if (params.tooltip) {
                tooltip.close();
              }
            }
          });

          leafletLayer.on("click", function (event) {
            params = Object.assign(params, event.target.options);
            let popupFunc = params.popup;
            if (popupFunc) {
              if (
                feature.properties.layer.template &&
                feature.properties.layer.template.popup
              )
                popupFunc = feature.properties.layer.template.popup;
              const popupOptions = Object.assign(
                {
                  maxWidth: "900",
                  autoPan: true,
                  keepInView: true,
                  closeButton: false,
                  autoClose: false,
                },
                params.popupOptions
              );
              let latlng;
              if (event.target._latlng) latlng = event.target._latlng;
              else latlng = event.target.getCenter();
              popup = L.popup(popupOptions)
                .setLatLng(latlng)
                // .setContent('<button id="close">x</button>' + event.target.options.popup({feature}))
                .setContent(popupFunc({ feature }))
                .openOn(map);
              const px = map.project(latlng);
              px.y -= popup._container.clientHeight / 2;
              map.panTo(map.unproject(px), { animate: true });
              // popup._container.querySelector('#close').addEventListener('pointerup', event => {
              //   popup.close()
              // })
            } else if (
              event.target.feature.properties.layer.template &&
              event.target.feature.properties.layer.template.analyte
            ) {
              if (event.target.feature.properties.Result !== 0) {
                $mapStore.selectedFeature = event.target;
                resizeMap();
                move(300);
              }
            }
          });
        };
      }
      return options;
    };

    const geoJsons = computed(() => {
      const slide = getActiveSlide();
      const layers = [];
      if ("contextLayers" in slide && slide.contextLayers) {
        slide.contextLayers.forEach((layer) => {
          if (layer.data) {
            layer.data.options = makeOptions(layer, {
              active: true,
              label: layer.label,
              type: "baseLayer",
            });
            layers.push(layer.data);
          }
        });
      }
      if ("layers" in slide && slide.layers) {
        slide.layers.forEach((layer) => {
          if ("dependencies" in layer && layer.dependencies) {
            layer.data.dependencies = layer.dependencies;
          }
          if (layer.data) {
            layer.data.options = makeOptions(layer, {
              active: false,
              label: layer.label,
              type: "dataLayer",
            });
            layer.data.class = layer.class;
            layer.data.template = layer.template;
            layers.push(layer.data);
          }
        });
      }
      return layers;
      // const layers = getActiveLayers();
      // const commonParams = {
      //   options: {
      //     pointToLayer: (feature, latLng) => {
      //       const params = getFeatureStyle(feature);
      //       params.riseOnHover = true;
      //       return circle(latLng, params);
      //     },
      //     onEachFeature: function (feature, leafletLayer) {
      //       const layer = feature.properties.layer;
      //       let popup, tooltip;
      //       let params = Object.assign({}, $store.sections[layer.class]);
      //       leafletLayer.on("mouseover", function (event) {
      //         params = Object.assign(params, event.target.options);
      //         this.setStyle(params.hoverStyle);
      //         event.target.bringToFront();
      //         let tooltipFunc =
      //           params.tooltip || (layer.options && layer.options.tooltip);
      //         if (tooltipFunc) {
      //           let latlng;
      //           if (event.target._latlng) latlng = event.target._latlng;
      //           else latlng = event.target.getCenter();
      //           tooltip = L.popup({ autoClose: true })
      //             .setLatLng(latlng)
      //             .setContent(tooltipFunc(event.target))
      //             .openOn(map);
      //         }
      //       });
      //       leafletLayer.on("mouseout", function (event) {
      //         params = Object.assign(params, event.target.options);
      //         if (layer.options && layer.options.style) {
      //           this.setStyle(layer.options.style(feature));
      //         } else if (layer.style) {
      //           this.setStyle(layer.style(feature));
      //         } else {
      //           this.setStyle(getFeatureStyle(feature));
      //         }
      //         if (params.tooltip) {
      //           tooltip.close();
      //         }
      //       });
      //       leafletLayer.on("click", function (event) {
      //         params = Object.assign(params, event.target.options);
      //         let popupFunc = params.popup;
      //         if (popupFunc) {
      //           if (layer.template && layer.template.popup)
      //             popupFunc = layer.template.popup;
      //           const options = Object.assign(
      //             {
      //               maxWidth: "900",
      //               autoPan: true,
      //               keepInView: true,
      //               closeButton: false,
      //               autoClose: false,
      //             },
      //             params.popupOptions
      //           );
      //           let latlng;
      //           if (event.target._latlng) latlng = event.target._latlng;
      //           else latlng = event.target.getCenter();
      //           popup = L.popup(options)
      //             .setLatLng(latlng)
      //             // .setContent('<button id="close">x</button>' + event.target.options.popup({feature}))
      //             .setContent(popupFunc({ feature }))
      //             .openOn(map);
      //           const px = map.project(latlng);
      //           px.y -= popup._container.clientHeight / 2;
      //           map.panTo(map.unproject(px), { animate: true });
      //           // popup._container.querySelector('#close').addEventListener('pointerup', event => {
      //           //   popup.close()
      //           // })
      //         } else if (
      //           event.target.feature.properties.layer.template &&
      //           event.target.feature.properties.layer.template.analyte
      //         ) {
      //           $store.selectedFeature = event.target;
      //           resizeMap();
      //           move(300);
      //         }
      //       });
      //     },
      //   },
      // };
      // return layers
      //   .filter((layer) => layer.class !== "geoimage")
      //   .map((layer, idc) => {
      //     const params = Object.assign({ id: idc }, commonParams);
      //     params.options = Object.assign(params.options, layer.options);
      //     if (layer.style) {
      //       params.options.style = layer.style;
      //     }
      //     if (layer.data) {
      //       return Object.assign(params, layer.data);
      //     } else {
      //       return Object.assign(params, {
      //         type: "FeatureCollection",
      //         features: [],
      //       });
      //     }
      //   });
    });

    const resizeMap = () => {
      if (pageRef.value) {
        let mapHeight = parseInt(getComputedStyle(pageRef.value.$el).height);
        if (selected.value) {
          mapHeight -= 180;
        }
        height.value = mapHeight + "px";
      }
    };

    const legendLayers = computed(() => {
      return activeLayers.value.filter((layer) => {
        let params = Object.assign(
          { colorRampType: "range" },
          $store.sections[layer.class]
        );
        params = Object.assign(params, layer.template);
        return params.legend;
      });
    });

    const getGeoJsons = async () => {
      Object.keys($store.layers)
        .filter((key) => $store.layers[key].class !== "geoimage")
        .forEach(async (key) => {
          const layer = $store.layers[key];
          const url = "data/" + layer.file;
          await fetch(url)
            .then((response) => {
              if (response.ok) return response.json();
              else throw response;
            })
            .then((json) => {
              json.features = json.features.map((feature) => {
                feature.properties.layer = layer;
                return feature;
              });
              layer.data = json;
              return json;
            })
            .catch((error) => {
              console.warn(error);
            });
        });
    };

    onBeforeMount(async () => {
      const { circleMarker } = await import("leaflet/dist/leaflet-src.esm");
      circle = circleMarker;
    });

    onMounted(() => {
      setTimeout(() => {
        resizeMap();
        setTimeout(() => {
          if (mapRef.value) {
            map = mapRef.value.leafletObject;
            map.invalidateSize();
          }
          getGeoJsons();
        }, 400);
      }, 1);
    });

    const move = (duration) => {
      if (map) {
        map.invalidateSize();
      }
      if (duration > 0) {
        setTimeout(() => {
          move(duration - 1);
        }, 1);
      }
    };

    let selectedFeature = null;
    watchEffect(() => {
      if (leftDrawerOpen !== $store.leftDrawerOpen) {
        leftDrawerOpen = $store.leftDrawerOpen;
        move(300);
      }
      if ($mapStore.selectedFeature === null && selectedFeature !== null) {
        selectedFeature = null;
        resizeMap();
        move(300);
      } else {
        selectedFeature = $mapStore.selectedFeature;
      }
    });

    return {
      activeLayers,
      leftDrawerOpen,
      attributionPrefix:
        '<a href="http://www.newfieldsgovernmentservices.com/" title="NewFields Government Services, LLC" target="_blank">NGS</a>',
      chartRef,
      getWidth,
      geoJsons,
      geojsonOptions,
      height,
      legendLayers,
      mapOptions,
      mapRef,
      pageRef,
      selected,
    };
  },
});
</script>

<style type="scss" scoped>
:deep(.arrow-up) {
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 14px solid #910000a1;
}
.q-page-container,
:deep(.q-page-container),
.q-page,
.leaflet-container {
  overflow: hidden;
}
.leaflet-container {
  cursor: default;
  transition: height 0.16s ease-in;
}
.chart {
  height: 0px;
  overflow: hidden;
  transition: height 0.16s ease-out;
}
.chart.active {
  height: 180px;
  transition: height 0.16s ease-in;
}
.debug {
  position: fixed;
  background: black;
  color: white;
  padding: 20px;
  z-index: 99999;
}
:deep(.leaflet-popup) #close {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 40px;
  height: 40px;
  font-size: 2em;
  line-height: 30px;
  font-weight: bold;
  padding: 0px;
  border-top-right-radius: 12px;
  cursor: pointer;
}
:deep(.leaflet-popup) #close:hover {
  background-color: #333;
  color: white;
  transition: all 0.3s ease-in;
}
:deep(.leaflet-popup-content) h6 {
  margin: 5px 0px;
}
:deep(.leaflet-popup.east-parking-lot-transect) p {
  font-size: 1.2em;
  font-family: Roboto;
}
:deep(.leaflet-tooltip) {
  color: rgba(153, 0, 55, 0.9);
  width: 0;
  height: 0;
  background: transparent;
  border: none;
  -webkit-box-shadow: none;
  box-shadow: none;
  text-shadow: 1px 1px 10px #fff, 5px 5px 10px #ccc;
  font-size: 1.6em;
  font-weight: bold;
}
</style>
