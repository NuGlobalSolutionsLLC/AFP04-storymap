<template>
  <q-drawer
    ref="root"
    show-if-above
    v-model="leftDrawerOpen"
    side="left"
    :width="500"
    bordered
  >
    <section
      center
      v-for="(slide, index) in slides"
      :key="index"
      :class="'section' + index"
    >
      <q-card>
        <h2 v-html="slide.title"></h2>
        <div>
          <p
            v-for="(p, index2) in slide.description"
            :key="index2"
            v-html="p"
          ></p>
          <ul>
            <li v-for="(layer, index3) in slide.layers" :key="index3">
              <q-checkbox
                :label="layer.label"
                v-model="layer.active"
                @click="toggleLayer(layer)"
              />
            </li>
          </ul>
          <div class="row justify-center" v-if="slide.actions">
            <q-btn
              v-for="(button, index2) in slide.actions"
              :key="index2"
              :label="button.label"
              color="primary"
              @click="doSlideAction(button)"
            />
          </div>
        </div>
      </q-card>
    </section>
  </q-drawer>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useStorymapStore } from "src/stores/storymap-store";
import { useMapStore } from "src/stores/map-store";
// import { emit } from "process";

export default {
  props: {
    open: Boolean,
  },
  emits: ["action", "toggle-layer"],
  setup(props, context) {
    const $store = useStorymapStore();
    const $mapStore = useMapStore();
    const root = ref(null);
    let deactivated = false;

    const leftDrawerOpen = computed(() => {
      return props.open;
    });

    const slides = computed(() => {
      return $store.slides;
    });

    const doSlideAction = (button) => {
      const action = button.action;
      if (typeof action === "object") {
        if (action.type.toLowerCase() === "modal") {
          $mapStore.dialogOpen = true;
          $mapStore.dialog = button;
          context.emit("action", action);
        }
      }
    };

    const scrollToSlide = (slide) => {
      const slideContainer = root.value.$el.querySelector(".q-drawer__content");
      const section = slideContainer.querySelectorAll("section")[slide];
      deactivated = true;
      scrollTo(slideContainer, section.offsetTop, () => {
        deactivated = false;
      });
    };

    const scrollTo = (element, to, callback, duration) => {
      $mapStore.selectedFeature = null;
      let start = element.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;
      if (!duration) duration = 1000;

      const animateScroll = () => {
        currentTime += increment;
        const val = Math.easeInOutQuad(currentTime, start, change, duration);
        element.scrollTop = val;
        if (currentTime < duration) {
          setTimeout(animateScroll, increment);
        } else if (callback) {
          setTimeout(callback, increment);
        }
      };
      animateScroll();
    };

    //t = current time
    //b = start value
    //c = change in value
    //d = duration
    Math.easeInOutQuad = function (t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const toggleLayer = (layer) => {
      $store.lastClickedLayer = layer.file;
      if (!layer.active) {
        $store.lastRemovedLayer = layer.file;
      } else {
        $store.lastRemovedLayer = null;
      }
      layer.data.options.active = layer.active;
    };

    onMounted(() => {
      const slideContainer = root.value.$el.querySelector(".q-drawer__content");
      let active = $store.slides.find((slide, index) => {
        slide.index = index;
        return slide.active;
      });
      let lastScrollTop = 0;
      let conditionIsMet = false;
      let newIndex = null;
      slideContainer.onscroll = function () {
        const slideHeight = slideContainer.children[0].clientHeight;
        let triggerPoint;
        if (slideContainer.scrollTop > lastScrollTop) {
          // downscroll
          triggerPoint = slideHeight * active.index + slideHeight / 2;
          conditionIsMet = slideContainer.scrollTop >= triggerPoint;
          newIndex = active.index + 1;
        } else {
          // upscroll
          triggerPoint = slideHeight * active.index - slideHeight / 2;
          conditionIsMet = slideContainer.scrollTop <= triggerPoint;
          newIndex = active.index - 1;
        }
        if (conditionIsMet) {
          active.active = false;
          $store.slides[newIndex].active = true;
          $store.slides[newIndex].index = newIndex;
          active = $store.slides[newIndex];
          if (deactivated) return;
          deactivated = true;
          scrollTo(slideContainer, slideHeight * newIndex, () => {
            deactivated = false;
          });
        }
        lastScrollTop = slideContainer.scrollTop;
      };
    });

    return {
      doSlideAction,
      leftDrawerOpen,
      root,
      scrollToSlide,
      toggleLayer,
      slides,
    };
  },
};
</script>

<style lang="scss" scoped>
section {
  display: flex;
  align-items: center;
  height: 100%;
}
ul {
  list-style: none;
  margin: 0px;
  padding: 0px;
  li {
    margin: 0px;
    padding: 0px;
  }
}
.section0 {
  background-image: url("img/headerbg-portrait.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  font-size: 1.4em;
  .q-card {
    background-color: #00000050;
    color: $background-highlight;
    p {
      text-align: center;
      color: #e0e0e0;
      :deep(button) {
        background-color: $primary;
        color: $background-highlight;
        padding: 4px 10px;
        border: none;
        border-radius: 60px;
        cursor: pointer;
      }
    }
  }
}

.q-card {
  width: 90%;
  margin: 5%;
  padding: 20px;
  font-size: 1.2em;
}
h2 {
  font-size: 2em;
  line-height: 1em;
  font-weight: bold;
}
.q-drawer {
}
:deep(.q-drawer) {
  background: $primary;
  width: 350px;
}
:deep(.q-item__label) {
  font-weight: bold;
}
/* width */
:deep(::-webkit-scrollbar) {
  width: 6px;
}

/* Track */
:deep(::-webkit-scrollbar-track) {
  background: $primary;
}

/* Handle */
:deep(::-webkit-scrollbar-thumb) {
  background: lighten($primary, 20%);
}

/* Handle on hover */
:deep(::-webkit-scrollbar-thumb:hover) {
  // background: darken($primary, 10%);
  background: lighten($primary, 30%);
}
</style>
