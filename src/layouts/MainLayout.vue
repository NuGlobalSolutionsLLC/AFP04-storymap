<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-blue-1 text-primary" height-hint="98">
      <q-toolbar>
        <q-btn dense round icon="menu" class="bg-primary text-white" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <a href="https://www.nuglobalsolutions.com/" target="_blank">
            <img src="~assets/logo_nuglobalsolutions.png" class="header-logo">
          </a>
          WebGIS | AFP4
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      >
      <q-list dark padding>
        <q-expansion-item
          v-for="group in groups" :key="group"
          :icon="group.icon"
          :label="group.label"
          :default-opened="true"
          >
          <q-list dense dark separator class="bg-blue-1 text-blue-10">
            <q-item
              v-for="layer in group.childs" :key="layer"
              clickable v-ripple
              >
              <q-item-section>
                <q-checkbox
                  v-model="layer.active"
                  :label="layer.label"
                   @click="click(layer, group)"
                  />
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div>Title</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer> -->

  </q-layout>
</template>

<script>
import { ref, computed } from 'vue'
import { useMapStore } from 'src/stores/map-store'

export default {
  setup () {
    const leftDrawerOpen = ref(false)
    const $store = useMapStore()

    const click = (layer, group) => {
      if (group.mode && group.mode === 'single-select') {
        group.childs.forEach(child => {
          if (child.label !== layer.label) child.active = false
        })
      }
    }

    const groups = computed(() => {
      return $store.layers
    })

    return {
      click,
      groups,
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
  }
  .q-toolbar__title,
  .q-toolbar__title a {
    display: flex;
    align-items: center;
    column-gap: 10px;
  }
  :deep(.q-drawer) {
    background: $primary;
  }
</style>
