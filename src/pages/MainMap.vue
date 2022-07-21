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

    <LineChart ref="chartRef"
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
      let defaultParams = Object.assign({}, $store.sections[feature.properties.layer.class])
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
        return Object.assign(defaultParams, {
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
      const commonParams = {
        options: {
          pointToLayer: function (feature, latLng) {
            const params = getFeatureStyle(feature, feature.properties.layer.template)
            params.riseOnHover = true
            return circle(latLng, params);
          },
          onEachFeature: function(feature, leafletLayer) {
            const layer = feature.properties.layer
            let popup, tooltip
            let params = Object.assign({}, $store.sections[layer.class])
            leafletLayer.on('mouseover', function (event) {
              params = Object.assign(params, event.target.options)
              this.setStyle(params.hoverStyle)
              event.target.bringToFront()
              let tooltipFunc = params.tooltip
              if (tooltipFunc) {
                let latlng
                if (event.target._latlng) latlng = event.target._latlng
                else latlng = event.target.getCenter()
                if (layer.template && layer.template.tooltip) tooltipFunc = layer.template.tooltip
                tooltip = L.popup()
                  .setLatLng(latlng)
                  .setContent(tooltipFunc(event.target))
                  .openOn(map)
              }
            })
            leafletLayer.on('mouseout', function (event) {
              params = Object.assign(params, event.target.options)
              if (layer.options && layer.options.style) {
                this.setStyle(layer.options.style(feature))
              } else {
                this.setStyle(getFeatureStyle(feature, layer.template))
              }
              if (params.tooltip) {
                tooltip.close()
              }
            })
            leafletLayer.on('click', function (event) {
              params = Object.assign(params, event.target.options)
              let popupFunc = params.popup
              if (popupFunc) {
                if (layer.template && layer.template.popup) popupFunc = layer.template.popup
                const options = Object.assign({
                  maxWidth: '900',
                  autoPan: true,
                  keepInView: true,
                  closeButton: false,
                  autoClose: false
                }, params.popupOptions)
                let latlng
                if (event.target._latlng) latlng = event.target._latlng
                else latlng = event.target.getCenter()
                popup = L.popup(options)
                  .setLatLng(latlng)
                  // .setContent('<button id="close">x</button>' + event.target.options.popup({feature}))
                  .setContent(popupFunc({feature}))
                  .openOn(map)
                var px = map.project(latlng)
                px.y -= popup._container.clientHeight/2
                map.panTo(map.unproject(px),{ animate: true })

                // popup._container.querySelector('#close').addEventListener('pointerup', event => {
                //   popup.close()
                // })
              } else if (
                    event.target.feature.properties.layer.template
                    && event.target.feature.properties.layer.template.analyte
                  ) {
                $store.selectedFeature = event.target
                resizeMap()
                move(300)
              }
            })
          }
        }
      }
      const geojsons = layers.map((layer, idc) => {
        const params = Object.assign({ id: idc }, commonParams)
        params.options = Object.assign(params.options, layer.options)
        if (layer.data) {
          return Object.assign(params, layer.data)
        } else {
          return Object.assign(params, {
            type: 'FeatureCollection',
            features: []
          })
        }
      })
      return geojsons
    })

    const resizeMap = () => {
      if (pageRef.value) {
        let mapHeight = parseInt(getComputedStyle(pageRef.value.$el).height)
        if (selected.value) {
          mapHeight -= 180
        }
        height.value = mapHeight + 'px'
      }
    }

    const legends = computed(() => {
      const layers = getActiveLayers()
      const html = layers.map(layer => {
        let params = Object.assign({ colorRampType: 'range' }, $store.sections[layer.class])
        params = Object.assign(params, layer.template)
        if (!params.legend) return ''
        if (params.colorRampType === 'category') {
          const categories = params.limits.map((limit, index) => {
            const previous = index === 0 ? 0 : params.limits[index - 1]
            const label = params.labels ? params.labels[index] : limit
            return `<li><span class="sample" style="background: ${layer.template.colors[index]};">&nbsp;</span>${label}</li>`
          })
          const title = `<li class="title">${params.label}</li>`
          return `<ul class="legend">${title}${categories.join("")}</ul>`
        } else {
          const categories = params.limits.map((limit, index) => {
            const previous = index === 0 ? 0 : params.limits[index - 1]
            return `<li><span class="sample" style="background: ${layer.template.colors[index]};">&nbsp;</span> ${previous} - ${limit}</li>`
          })
          categories.push(`
            <li>
            <span class="sample" style="background: ${params.colors[params.colors.length - 1]};">&nbsp;</span>
            > ${params.limits[params.limits.length - 1]}
            </li>
          `)
          const title = `<li class="title">${params.label}</li>`
          const units = `<li>Units: ${params.units}</li>`
          return `<ul class="legend">${title}${units}${categories.join("")}</ul>`
        }
      })
      return html.filter(fragment => fragment.length > 0).join('')
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

    let selectedFeature = null
    watchEffect(() => {
      if (leftDrawerOpen !== $store.leftDrawerOpen) {
        leftDrawerOpen = $store.leftDrawerOpen
        move(300)
      }
      if ($store.selectedFeature === null && selectedFeature !== null) {
        selectedFeature = null
        console.log('asd')
        resizeMap()
        move(300)
      } else {
        selectedFeature = $store.selectedFeature
      }
    })

    return  {
      leftDrawerOpen,
      attributionPrefix: '<a href="http://www.newfieldsgovernmentservices.com/" title="NewFields Government Services, LLC" target="_blank">NGS</a>',
      chartRef,
      getWidth,
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
  transition: height 0.3s ease-out;
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
:deep(.leaflet-popup-content) h6 {
  margin: 5px 0px;
}
:deep(.leaflet-popup.east-parking-lot-transect) p {
  font-size: 1.2em;
}
</style>
