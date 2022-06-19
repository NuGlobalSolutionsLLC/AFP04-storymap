import { defineStore } from 'pinia';

export const useMapStore = defineStore('map-store', {
  state: () => ({
    leftDrawerOpen: true,
  })
  // getters: {
  //   doubleCount: (state) => state.counter * 2,
  // },
  // actions: {
  //   increment() {
  //     this.counter++;
  //   },
  // },
});
