<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-background-highlight" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <img src="~assets/logo_nuglobalsolutions.png" class="header-logo">
          WebGIS | AFP4
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div>Title</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
import { ref, provide, computed } from 'vue'
import { useMapStore } from 'src/stores/map-store'

export default {
  setup () {
    const leftDrawerOpen = ref(false)
    const $store = useMapStore()

    provide('open', leftDrawerOpen)

    return {
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
        $store.leftDrawerOpen = leftDrawerOpen.value
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .header-logo {
    max-height: 30px;
  }
  header {
    background: $background-highlight;
    color: rgba(0, 0, 0, 0.5);
  }
  .q-toolbar__title {
    display: flex;
    column-gap: 10px;
  }
</style>
