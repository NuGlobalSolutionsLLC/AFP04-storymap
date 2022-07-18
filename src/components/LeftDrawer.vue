<template>
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
</template>

<script>
import { ref, computed } from 'vue'
import { useMapStore } from 'src/stores/map-store'

export default {
  props: {
    open: Boolean
  },
  setup (props) {
    const $store = useMapStore()

    const leftDrawerOpen = computed(() => {
      return props.open
    })

    const click = (layer, group) => {
      if (group.mode && group.mode === 'single-select') {
        group.childs.forEach(child => {
          if (child.label !== layer.label) child.active = false
        })
      }
      // if (!layer.template.analyte) {
      //   $store.selectedFeature = null
      // }
    }

    const groups = computed(() => {
      return $store.layers
    })

    return {
      click,
      groups,
      leftDrawerOpen
    }
  }
}
</script>

<style lang="scss" scoped>
  :deep(.q-drawer) {
    background: $primary;
  }
</style>
