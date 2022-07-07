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
    </l-map>

  </q-page>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import { defineComponent, onBeforeMount, onMounted, computed, ref, inject, watchEffect } from 'vue'
import { LMap, LGeoJson, LTileLayer, LControlAttribution } from '@vue-leaflet/vue-leaflet'
import { useMapStore } from 'src/stores/map-store'

export default defineComponent({
  name: 'MainMap',
  components: {
    LControlAttribution,
    LMap,
    LGeoJson,
    LTileLayer
  },
  setup () {
    const pageRef = ref(null)
    const mapRef = ref(null)
    let geojsonOptions = ref({})
    let height = ref(0)
    let circle
    let template
    const $store = useMapStore()
    let map = null
    let leftDrawerOpen = true
    const mapOptions = {
      // preferCanvas: true,
      attributionControl: false
    }

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

    const getFeatureStyle = (feature, template) => {
      const step = template.limits.find(limit => {
        return feature.properties.Result < limit
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

    const geoJsons = computed(() => {
      const layers = getActiveGroups().reduce((previous, group) => {
        return previous.concat(...group.childs)
      }, [])
      const geojsons = layers.map(layer => {
        if (layer.data) {
          return Object.assign({}, layer.data)
        } else {
          return {
            type: 'FeatureCollection',
            features: [],
            options: {
              pointToLayer: function (feature, latLng) {
                const params = getFeatureStyle(feature, layer.template)
                params.riseOnHover = true
                return circle(latLng, params);
              },
              onEachFeature: function(feature, leafletLayer) {
                let popup
                leafletLayer.on('mouseover', function (event) {
                  // console.log(event.target)
                  this.setStyle(event.target.options.hoverStyle)
                  event.target.bringToFront()
                  popup = L.popup()
                    .setLatLng(event.target._latlng)
                    .setContent(event.target.options.tooltip({feature}))
                    .openOn(map)
                })
                leafletLayer.on('mouseout', function (event) {
                  this.setStyle(getFeatureStyle(feature, layer.template))
                  popup.close()
                })
                // leafletLayer.bindTooltip(layer.template.tooltip)
                leafletLayer.on('click', function () {
                  // Let's say you've got a property called url in your geojsonfeature:
                  window.location = feature.properties.url
                })
              }
            }
          }
        }
      })
      return geojsons
    })

    const getGeoJsons = async () => {
      $store.layers.forEach(group => {
        group.childs.forEach(layer => {
          const url = 'data/' + layer.file
          fetch(url).then(response => {
            if (response.ok) return response.json()
            else throw response
          }).then(json => {
            layer.data = json
          }).catch(error => {
            // console.log(error)
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
        height.value = getComputedStyle(pageRef.value.$el).height
        setTimeout(() => {
          map = mapRef.value.leafletObject
          map.invalidateSize()
          getGeoJsons()
        }, 100)
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
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
      geoJsons,
      geojsonOptions,
      height,
      mapOptions,
      mapRef,
      pageRef
    }
  }
})
</script>

<style type="scss" scoped>
.debug {
  position: fixed;
  background: black;
  color: white;
  padding: 20px;
  z-index: 99999;
}
</style>
