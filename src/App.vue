<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App'
})
</script>

<style lang="scss">
#q-app, html, body {
  overflow: hidden;
}
/* width */
::-webkit-scrollbar {
  width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #fff;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: $primary;
  // background: lighten($primary, 10%);
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  // background: $primary;
  background: darken($primary, 10%);
}
</style>
