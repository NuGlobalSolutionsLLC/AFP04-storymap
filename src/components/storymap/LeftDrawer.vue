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
      <div class="fixed-header">
        <q-btn
          v-if="activeSlide.index !== 0"
          size="xl"
          label="previous"
          class="button"
          flat
          icon="keyboard_double_arrow_up"
          @click="previousSlide"
        ></q-btn>
      </div>
      <q-card>
        <h2 v-html="slide.title"></h2>
        <div>
          <p
            v-for="(p, index2) in slide.description"
            :key="index2"
            v-html="p"
          ></p>
          <p>
            <q-btn
              v-for="(button, index) in slide.buttons"
              :key="index"
              :icon="button.icon"
              :label="button.label"
              color="primary"
              rounded
              size="xl"
              class="button"
              @click="buttonClicked(button)"
            ></q-btn>
          </p>
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
      <div class="fixed-footer">
        <q-btn
          v-if="
            activeSlide.index !== 0 && activeSlide.index < slides.length - 1
          "
          size="xl"
          label="next"
          class="button"
          flat
          icon="keyboard_double_arrow_down"
          @click="nextSlide"
        ></q-btn>
      </div>
    </section>
  </q-drawer>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useStorymapStore } from "src/stores/storymap-store";
import { useMapStore } from "src/stores/map-store";

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

    Math.easeInOutQuad = function (currentTime, startTime, change, duration) {
      currentTime /= duration / 2;
      if (currentTime < 1) {
        return (change / 2) * currentTime * currentTime + startTime;
      }
      currentTime--;
      return (-change / 2) * (currentTime * (currentTime - 2) - 1) + startTime;
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

    const buttonClicked = (button) => {
      if (button.label === "Start") {
        scrollToSlide(1);
      }
    };

    const activeSlide = computed(() => {
      return $store.slides.find((slide) => slide.active);
    });

    const nextSlide = () => {
      scrollToSlide(activeSlide.value.index + 1);
    };

    const previousSlide = () => {
      scrollToSlide(activeSlide.value.index - 1);
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
      activeSlide,
      buttonClicked,
      doSlideAction,
      leftDrawerOpen,
      nextSlide,
      previousSlide,
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
  .fixed-footer,
  .fixed-header {
    position: fixed;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .fixed-footer {
    bottom: 5px;
  }
  .fixed-header {
    top: 5px;
  }
  .button {
    padding-right: 30px;
    color: lighten($primary, 30);
  }
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
