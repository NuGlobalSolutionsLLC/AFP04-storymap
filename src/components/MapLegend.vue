<template>
  <div class="legends">
    <q-card v-for="(legend, index) in legends" :key="index" class="legend">
      <q-card-section
        class="bg-primary card-title"
        @click="expanded[index] = !expanded[index]"
      >
        <h6 class="title text-white">{{ legend.title }}</h6>
        <span class="hint text-white">Toggle this legend</span>
        <q-btn
          round
          flat
          dense
          :icon="expanded[index] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </q-card-section>

      <q-slide-transition>
        <div v-show="expanded[index]">
          <q-card-section>
            <ul class="legend">
              <li class="units" v-if="legend.units">
                Units: {{ legend.units }}
              </li>
              <li v-for="(category, index2) in legend.categories" :key="index2">
                <span class="sample" :style="`background: ${category.color};`"
                  >&nbsp;</span
                >
                {{ category.label }}
              </li>
            </ul>
          </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from "vue";
import { useMapStore } from "src/stores/map-store";

export default defineComponent({
  name: "LayerLeged",
  props: {
    layers: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const $store = useMapStore();

    const legends = computed(() => {
      return props.layers
        .map((layer) => {
          let params = Object.assign(
            { colorRampType: "range" },
            $store.sections[layer.class]
          );
          params = Object.assign(params, layer.template);
          if (!params.legend) return null;
          if (params.colorRampType === "category") {
            const categories = params.limits.map((limit, index) => {
              return {
                color: layer.template.colors[index],
                label: params.labels ? params.labels[index] : limit,
              };
            });
            return {
              title: params.label,
              categories: categories,
            };
          } else {
            const categories = params.limits.map((limit, index) => {
              const previous = index === 0 ? 0 : params.limits[index - 1];
              return {
                color: layer.template.colors[index],
                label: `${previous} - ${limit}`,
              };
            });
            categories.push({
              color: params.colors[params.colors.length - 1],
              label: params.limits[params.limits.length - 1],
            });
            return {
              title: params.label,
              units: params.units,
              categories: categories,
            };
          }
        })
        .filter((legend) => !!legend);
    });

    return {
      expanded: ref([]),
      legends,
    };
  },
});
</script>

<style scoped lang="scss">
.legends {
  position: absolute;
  z-index: 400;
  right: 5px;
  top: 5px;
  transition: none;
}
.legends .legend {
  transition: opacity 0.3s ease-out;
  opacity: 0.8;
  margin-bottom: 4px;
}
.legends .legend:hover {
  opacity: 1;
  transition: opacity 0.3s ease-in;
}
.legends .legend .card-title:hover .q-btn {
  color: white;
  transition: color 0.3s ease-in;
}
.q-card__section {
  position: relative;
}
.q-card .q-btn {
  position: absolute;
  bottom: 0px;
  right: 0px;
  color: transparent;
  transition: color 0.3s ease-out;
}
.q-card .card-title {
  cursor: pointer;
}
.title {
  padding: 0px;
  margin: 0px;
  font-size: 1.2em;
  font-weight: bold;
}
.hint {
  font-size: 0.9em;
  font-style: italic;
}
ul {
  list-style: none;
  transition: none;
  margin: 0px;
  padding: 0px;
}
li {
  display: flex;
  align-items: center;
  font-size: 1.2em;
  transition: none;
}
.legend li span {
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 1px solid black;
  border-radius: 50%;
  margin-right: 10px;
  transition: none;
}
</style>
