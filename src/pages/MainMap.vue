<template>
  <q-page class="flex flex-center" ref="pageRef">
    <div class="debug" v-if="false">{{ geoJsons }}</div>
    <l-map ref="mapRef"
        :style="`height: ${height};`"
        :zoom="14"
        :center="[32.7713,-97.4366]"
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

      <l-geo-json v-for="geojson, index in geoJsons" :key="index"
          :geojson="geojson" :options="geojson.options"
          />
      <l-geo-json :geojson="selected.feature" v-if="selected" />

      <div class="legends" v-html="legends"></div>

    </l-map>

    <LineChart v-if="selected" ref="chartRef"
        :class="selected && 'active chart' || 'chart'"
        :height="180"
        :width="getWidth"
        :style="'width:' + getWidth + 'px !important;'"
        />

  </q-page>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import LineChart from 'src/components/LineChart.vue'
import { defineComponent, onBeforeMount, onMounted, computed, ref, inject, watchEffect } from 'vue'
import { LMap, LGeoJson, LTileLayer, LControlAttribution } from '@vue-leaflet/vue-leaflet'
import { useMapStore } from 'src/stores/map-store'

export default defineComponent({
  name: 'MainMap',
  components: {
    LineChart,
    LControlAttribution,
    LMap,
    LGeoJson,
    LTileLayer
  },
  setup () {
    const pageRef = ref(null)
    const mapRef = ref(null)
    const chartRef = ref(null)
    const mapOptions = {
      preferCanvas: true,
      attributionControl: false
    }
    const $store = useMapStore()
    let geojsonOptions = ref({})
    let height = ref(0)
    let circle
    let template
    let map
    let leftDrawerOpen = true

    const selected = computed(() => {
      return $store.selectedFeature
    })

    const refreshChart = () => {
      if (chartRef.value) {
        chartRef.value.chart.updateChart()
      }
    }

    const getWidth = computed(() => {
      if (pageRef.value) {
        const node = pageRef.value.$el.parentNode.parentNode
        let width = parseInt(getComputedStyle(node).width) - 340
        if (!$store.leftDrawerOpen) {
          width = parseInt(getComputedStyle(node).width) - 40
        }
        refreshChart()
        return width
      }
      return 0
    })

    const getActiveGroups = () => {
      return $store.layers.map(group => {
        const activeLayers = group.childs.filter(layer => layer.active)
        if (activeLayers.length > 0) {
          const newGroup = Object.assign({}, group)
          newGroup.childs = activeLayers
          return newGroup
        }
        return false
      }).filter(group => group)
    }

    const getActiveLayers = () => {
      return getActiveGroups().reduce((previous, group) => {
        return previous.concat(...group.childs)
      }, [])
    }

    const getFeatureStyle = (feature, template) => {
      let defaultParams = $store.sections[feature.properties.layer.class]
      template = feature.properties.layer.template
      if (template) {
        defaultParams = Object.assign(defaultParams, template)
      }
      if (template && 'limits' in template && 'colors' in template) {
        const step = template.limits.find(limit => {
          return feature.properties.Result <= limit
        })
        const index = template.limits.indexOf(step)
        const color = index !== -1 ? template.colors[index] : template.colors[template.colors.length - 1]
        return Object.assign(template, {
          fillColor: color,
          fillOpacity: 1,
          radius: 6,
          weight: 1
        })
      }
      return defaultParams
    }

    const geoJsons = computed(() => {
      const layers = getActiveLayers()
      const commonFeatures = {
        options: {
          pointToLayer: function (feature, latLng) {
            const params = getFeatureStyle(feature, feature.properties.layer.template)
            params.riseOnHover = true
            return circle(latLng, params);
          },
          onEachFeature: function(feature, leafletLayer) {
            let popup, tooltip
            leafletLayer.on('mouseover', function (event) {
              this.setStyle(event.target.options.hoverStyle)
              event.target.bringToFront()
              if (event.target.options.tooltip) {
                tooltip = L.popup()
                  .setLatLng(event.target._latlng)
                  .setContent(event.target.options.tooltip({feature}))
                  .openOn(map)
              }
            })
            leafletLayer.on('mouseout', function (event) {
              this.setStyle(getFeatureStyle(feature, feature.properties.layer.template))
              if (event.target.options.tooltip) {
                tooltip.close()
              }
            })
            leafletLayer.on('click', function (event) {
              // event.target.layer = layer
              if (event.target.options.popup) {
                popup = L.popup({ maxWidth: 'auto', autoPan: true, keepInView: true, closeButton: false })
                  .setLatLng(event.target._latlng)
                  // .setContent('<button id="close">x</button>' + event.target.options.popup({feature}))
                  .setContent(event.target.options.popup({feature}))
                  .openOn(map)
                var px = map.project(event.target._latlng)
                px.y -= popup._container.clientHeight/2
                map.panTo(map.unproject(px),{ animate: true })
                // setTimeout(() => {
                //   try {
                //   } catch {
                //     setTimeout(() => {
                //       // map.panTo(event.target._latlng)
                //       var px = map.project(event.target._latlng)
                //       px.y -= popup._container.clientHeight/2
                //       map.panTo(map.unproject(px),{ animate: true })
                //     }, 300)
                //   }
                // }, 1)

                // popup._container.querySelector('#close').addEventListener('pointerup', event => {
                //   popup.close()
                // })
              } else if (event.target.feature.properties.layer.template.analyte) {
                $store.selectedFeature = event.target
                resizeMap()
                move(300)
              }
            })
          }
        }
      }
      const geojsons = layers.map(layer => {
        if (layer.data) {
          return Object.assign(commonFeatures, layer.data)
        } else {
          return Object.assign(commonFeatures, {
            type: 'FeatureCollection',
            features: []
          })
        }
      })
      return geojsons
    })

    const resizeMap = () => {
      let mapHeight = parseInt(getComputedStyle(pageRef.value.$el).height)
      if (selected.value) {
        mapHeight -= 180
      }
      height.value = mapHeight + 'px'
    }

    const legends = computed(() => {
      const layers = getActiveLayers()
      const html = layers.map(layer => {
        const classObj = $store.sections[layer.class]
        if (!classObj.legend) return ''
        const categories = layer.template.limits.map((limit, index) => {
          const previous = index === 0 ? 0 : layer.template.limits[index - 1]
          return `<li><span class="sample" style="background: ${layer.template.colors[index]};">&nbsp;</span> ${previous} - ${limit}</li>`
        })
        categories.push(`
          <li>
            <span class="sample" style="background: ${layer.template.colors[layer.template.colors.length - 1]};">&nbsp;</span>
            > ${layer.template.limits[layer.template.limits.length - 1]}
          </li>
        `)
        const title = `<li class="title">${layer.template.label}</li>`
        const units = `<li>Units: ${layer.template.units}</li>`
        return `<ul class="legend">${title}${units}${categories.join("")}</ul>`
      })
      return html
    })

    const getGeoJsons = async () => {
      $store.layers.forEach(group => {
        group.childs.forEach(async layer => {
          const url = 'data/' + layer.file
          const data = await fetch(url).then(response => {
            if (response.ok) return response.json()
            else throw response
          }).then(json => {
            json.features = json.features.map(feature => {
              feature.properties.layer = layer
              return feature
            })
            layer.data = json
            return json
          }).catch(error => {
            console.warn(error)
          })
        })
      })
    }

    onBeforeMount(async () => {
      const { circleMarker } = await import("leaflet/dist/leaflet-src.esm");
      circle = circleMarker
    })

    onMounted(() => {
      setTimeout(() => {
        resizeMap()
        setTimeout(() => {
          map = mapRef.value.leafletObject
          map.invalidateSize()
          getGeoJsons()
        }, 300)
      }, 1)
    })

    const move = (duration) => {
      if (map) {
        map.invalidateSize()
      }
      if (duration > 0) {
        setTimeout(() => {
          move(duration - 1)
        }, 1)
      }
    }

    watchEffect(() => {
      if (leftDrawerOpen !== $store.leftDrawerOpen) {
        leftDrawerOpen = $store.leftDrawerOpen
        move(300)
      }
    })

    return  {
      leftDrawerOpen,
      attributionPrefix: '<a href="http://www.newfieldsgovernmentservices.com/" title="NewFields Government Services, LLC" target="_blank">NGS</a>',
      chartRef,
      getWidth,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
      geoJsons,
      geojsonOptions,
      height,
      legends,
      mapOptions,
      mapRef,
      pageRef,
      selected
    }
  }
})
</script>

<style type="scss" scoped>
.q-page-container, :deep(.q-page-container), .q-page, .leaflet-container {
  overflow: hidden;
}
.leaflet-container {
  cursor: default;
  transition: height 0.3s ease-in;
}
.chart {
  height: 0px;
  overflow: hidden;
}
.chart.active {
  height: 180px;
  transition: height 0.3s ease-in;
}
.debug {
  position: fixed;
  background: black;
  color: white;
  padding: 20px;
  z-index: 99999;
}
.legends {
  position: absolute;
  z-index: 400;
  right: 5px;
  top: 5px;
  transition: none;
}
:deep(.legends) .legend {
  background: white;
  border-radius: 8px;
  margin: 5px;
  padding: 10px;
  transition: opacity 0.3s ease-out;
  opacity: 0.8;
}
:deep(.legends) .legend:hover {
  opacity: 1;
  transition: opacity 0.3s ease-in;
}
:deep(.legends) ul {
  list-style: none;
  transition: none;
}
:deep(.legends) ul li {
  display: flex;
  align-items: center;
  font-size: 1.2em;
  transition: none;
}
:deep(.legends) ul li.title {
  font-weight: bold;
}
:deep(.legends) span {
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 1px solid black;
  border-radius: 50%;
  margin-right: 10px;
  transition: none;
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
</style>
