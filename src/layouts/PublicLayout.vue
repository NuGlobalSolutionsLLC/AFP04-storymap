<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-blue-1" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <a href="https://www.nuglobalsolutions.com/" target="_blank">
            <img src="~assets/logo_nuglobalsolutions.png" class="header-logo">
          </a>
          WebGIS | AFP4
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref, computed } from 'vue'
// import { useMapStore } from 'src/stores/map-store'

export default {
  name: 'PublicLayout',
  setup () {
    // const $store = useMapStore()
    // console.log($store.user)

    return {
    }
  }
}
</script>

<style lang="scss" scoped>
  body .q-layout {
    height: 100vh;
  }
  .q-page-container {
    height: 100%;
  }
  .header-logo {
    max-height: 30px;
  }
  :deep(header) {
    // background: $background-highlight;
    background: $primary;
  }
  .q-toolbar__title,
  .q-toolbar__title a {
    display: flex;
    align-items: center;
    column-gap: 10px;
  }
  .q-layout, :deep(.q-page-container), .q-page, .leaflet-container {
    overflow: hidden;
  }
</style>
