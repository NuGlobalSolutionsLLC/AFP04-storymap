import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useMapStore } from "src/stores/map-store";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  const isValid = (auth) => {
    const expires = new Date(auth.expires);
    const now = new Date();
    if (expires.getTime() > now.getTime()) return true;
    return false;
  };

  router.beforeEach(async (to) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const loginUrl = "/login";
    const publicPages = [loginUrl];
    const authRequired = !publicPages.includes(to.path);
    const $store = useMapStore();

    const user = {
      name: localStorage.getItem("user") || null,
      expires:
        parseInt(localStorage.getItem("expires")) || new Date().getTime(),
    };

    if (authRequired) {
      if (isValid(user)) return;
      if (isValid($store.user)) return;
      return loginUrl;
    }
  });

  return router;
});
