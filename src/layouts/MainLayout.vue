<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-blue-1 text-primary" height-hint="98">
      <q-toolbar>
        <q-btn
          dense
          round
          icon="menu"
          class="bg-primary text-white"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <a href="https://www.nuglobalsolutions.com/" target="_blank">
            <img
              alt="NGS Logo"
              src="~assets/logo_nuglobalsolutions.png"
              class="header-logo"
            />
          </a>
          WebGIS | AFP4
        </q-toolbar-title>

        <q-btn
          align="between"
          label="logout"
          class="btn-fixed-width"
          color="accent"
          icon="logout"
          @click="doLogout"
        />
      </q-toolbar>
    </q-header>

    <left-drawer :open="leftDrawerOpen" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { computed } from "vue";
import { useMapStore } from "src/stores/map-store";
import { useRouter } from "vue-router";
import LeftDrawer from "src/components/LeftDrawer.vue";

export default {
  components: {
    LeftDrawer,
  },
  setup() {
    const $store = useMapStore();
    const leftDrawerOpen = computed(() => $store.leftDrawerOpen);
    const router = useRouter();

    const doLogout = () => {
      $store.saveLogoutState();
      router.push("/login");
    };

    return {
      doLogout,
      leftDrawerOpen,
      toggleLeftDrawer() {
        $store.leftDrawerOpen = !$store.leftDrawerOpen;
      },
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
}
.q-toolbar__title,
.q-toolbar__title a {
  display: flex;
  align-items: center;
  column-gap: 20px;
  font-size: 2em;
  font-weight: bold;
}
.q-layout,
:deep(.q-page-container),
.q-page,
.leaflet-container {
  overflow: hidden;
}
</style>
