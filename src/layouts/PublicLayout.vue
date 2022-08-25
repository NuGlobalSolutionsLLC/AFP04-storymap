<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-blue-1" height-hint="98">
      <q-toolbar>
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
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "PublicLayout",
  setup() {
    return {};
  },
};
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
  background: $primary;
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
