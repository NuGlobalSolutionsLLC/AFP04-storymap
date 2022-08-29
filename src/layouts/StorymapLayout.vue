<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-blue-1 text-primary" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <a href="https://www.nuglobalsolutions.com/" target="_blank">
            <img
              alt="NGS Logo"
              src="~assets/logo_nuglobalsolutions.png"
              class="header-logo"
            />
          </a>
          <div>
            <div class="title">Air Force Plan 4</div>
            <div class="subtitle">NuGlobal Solutions, LLC</div>
          </div>
        </q-toolbar-title>

        <q-btn-dropdown
          color="primary"
          no-caps
          icon="folder"
          :label="stripHTML(activeSlide.title)"
        >
          <q-list dense>
            <q-item
              clickable
              v-close-popup
              @click="jumpToSlide(index)"
              v-for="(slide, index) in slides"
              :key="index"
              :class="activeSlide.index === index && 'active'"
            >
              <q-item-section avatar>
                <q-avatar
                  v-if="slide.icon"
                  :color="(activeSlide.index === index && 'primary') || ''"
                  :icon="slide.icon"
                ></q-avatar>
                <q-avatar v-else>{{ index }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label :data-id="index">
                  {{ stripHTML(slide.title) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- <q-btn
          align="between"
          label="Explore"
          class="btn-fixed-width"
          color="primary"
          icon="travel_explore"
          push
          flat
          @click="goMap"
        /> -->

        <q-btn
          align="between"
          label="logout"
          class="btn-fixed-width"
          color="accent"
          icon="logout"
          push
          flat
          @click="doLogout"
        />
      </q-toolbar>
    </q-header>

    <left-drawer ref="slider" :open="leftDrawerOpen" @action="doAction" />

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog
      class="dialog"
      v-model="dialogOpen"
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-primary text-white" v-if="dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialog.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />
        <div v-for="(content, index) in dialog.action.content" :key="index">
          <q-img :src="content.img" v-if="content && content.img" />
          <p v-else v-html="content" />
        </div>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { computed, onMounted, reactive, ref } from "vue";
import { useStorymapStore } from "src/stores/storymap-store";
import { useMapStore } from "src/stores/map-store";
import { useRouter } from "vue-router";
import LeftDrawer from "src/components/storymap/LeftDrawer.vue";

export default {
  components: {
    LeftDrawer,
  },
  setup() {
    const $store = useStorymapStore();
    const $mapStore = useMapStore();
    const slider = ref(null);
    const leftDrawerOpen = computed(() => $store.leftDrawerOpen);
    const router = useRouter();
    const maximizedToggle = ref(false);
    const dialogOpen = ref(false);
    const routerView = ref(null);

    const dialog = computed(() => {
      return $mapStore.dialog;
    });

    const doAction = (action) => {
      if (action.type.toLowerCase() === "modal") {
        dialogOpen.value = true;
      }
    };

    const goMap = () => {
      router.push("/");
    };

    const jumpToSlide = (index) => {
      $store.slides.forEach((slide) => {
        slide.active = false;
      });
      $store.slides[index].active = true;
      slider.value.scrollToSlide(index);
    };

    const slides = reactive($store.slides);

    const activeSlide = computed(() => {
      return $store.slides.find((slide) => slide.active);
    });

    const doLogout = () => {
      $store.saveLogoutState();
      router.push("/login");
    };

    const stripHTML = (value) => {
      const div = document.createElement("div");
      div.innerHTML = value;
      return div.textContent || div.innerText || "";
    };

    onMounted(() => {
      setTimeout(() => {
        jumpToSlide(activeSlide.value.index);
      }, 100);
    });

    return {
      activeSlide,
      dialog,
      dialogOpen,
      doAction,
      doLogout,
      goMap,
      jumpToSlide,
      leftDrawerOpen,
      maximizedToggle,
      routerView,
      slider,
      slides,
      stripHTML,
    };
  },
};
</script>

<style lang="scss" scoped>
.header-logo {
  max-height: 30px;
}
header {
  background: $background-highlight;
  .q-btn {
    margin-left: 10px;
  }
}
.q-toolbar__title,
.q-toolbar__title a {
  display: flex;
  align-items: center;
  column-gap: 20px;
  font-size: 2em;
  font-weight: bold;
  line-height: 1em;
}
.subtitle {
  font-size: 0.6em;
  line-height: 0.8em;
}
.q-layout,
:deep(.q-page-container),
.q-page,
.leaflet-container {
  overflow: hidden;
}
#q-app,
html,
body {
  overflow: hidden;
}
.q-item {
  padding-top: 4px;
  padding-bottom: 4px;
}
.q-item.active {
  background-color: #e3f2fd;
}
.q-item .q-avatar {
  background-color: #e3f2fd;
  color: $primary;
  font-size: 30px;
  font-weight: bold;
  display: flex;
  align-items: center;
}
.q-item.active .q-avatar {
  background-color: $primary;
  color: white;
}
.dialog .q-card {
  width: 100vw;
  max-width: 100vw;
}
</style>
