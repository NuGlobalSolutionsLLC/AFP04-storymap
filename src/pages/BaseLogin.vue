<template>
  <section>
    <q-card dark round>
      <h4>AFP4 Web-GIS</h4>
      <q-form :autofocus="true" @submit.prevent="doLogin">
        <a href="https://www.nuglobalsolutions.com/" target="_blank">
          <img alt="NGS Logo" src="img/logo.png" class="logo" />
        </a>
        <fieldset>
          <legend>Input credentials</legend>
          <q-input filled v-model="username" label="Username" />
          <q-input
            v-model="password"
            filled
            :type="isPwd ? 'password' : 'text'"
            label="Password"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="changePasswordvisibility"
              />
            </template>
          </q-input>
        </fieldset>
        <div class="errors" v-show="errors">
          {{ errors }}
        </div>
        <div class="buttons">
          <q-btn
            label="Login"
            type="submit"
            color="primary"
            class="full-width"
            :disabled="loginDisabled"
          />
        </div>
      </q-form>
    </q-card>
  </section>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useMapStore } from "src/stores/map-store";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "BaseLogin",
  setup() {
    const username = ref();
    const password = ref();
    const isPwd = ref(true);
    const $store = useMapStore();
    const errors = ref("");
    const loginDisabled = ref(false);
    const router = useRouter();

    const sha256 = async (message) => {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    const doLogin = async () => {
      const errorMessage = "Username and password do not match.";
      errors.value = "";
      loginDisabled.value = true;
      // Login using the AFP4 Deta.sh backend
      const url = [
        "https://database.deta.sh/v1",
        $store.DETA_ID,
        $store.DETA_NAME,
        "items",
        username.value,
      ].join("/");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": $store.DETA_KEY,
        },
      });
      if (response.ok) {
        const json = await response.json();
        if (json) {
          sha256(password.value).then((hash) => {
            if (json.password === hash) {
              $store.saveLoginState(username.value);
              router.push("/");
            } else {
              errors.value = errorMessage;
              loginDisabled.value = false;
            }
          });
        } else {
          errors.value = "Unknown error";
          loginDisabled.value = false;
        }
      } else {
        errors.value = "Unknown error";
        loginDisabled.value = false;
      }
    };
    return {
      changePasswordvisibility() {
        isPwd.value = !isPwd.value;
      },
      doLogin,
      errors,
      isPwd,
      loginDisabled,
      password,
      username,
    };
  },
});
</script>

<style scoped lang="scss">
section {
  width: 100vw;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("img/bg.jpg") no-repeat;
  background-position: center;
  background-size: cover;
  text-align: center;
  h4 {
    padding: 10px 0px;
    margin: 0px;
    background: #23232e;
    color: #9199aa;
    border-radius: 4px;
  }
  form {
    padding: 40px;
    border-radius: 4px;
    background: #2b2b36;
    color: #9199aa;
    .errors {
      color: red;
    }
    .buttons {
      padding: 10px;
    }
    .logo {
      max-width: 300px;
    }
    fieldset {
      border: 0px;
      .q-input {
        margin-bottom: 10px;
        :deep(input) {
          color: white;
        }
        :deep(.q-field__label) {
          color: #9199aa;
        }
        :deep(.q-icon) {
          color: #9199aa;
        }
        &:last-of-type {
          margin-bottom: 0px;
        }
      }
    }
  }
}
</style>
