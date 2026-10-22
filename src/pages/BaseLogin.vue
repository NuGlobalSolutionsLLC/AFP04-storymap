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
        <div class="errors" v-show="errors" role="alert">
          {{ errors }}
        </div>
        <div class="buttons">
          <q-btn
            label="Login"
            type="submit"
            color="primary"
            class="full-width"
            :disabled="loginDisabled"
            :loading="loginDisabled"
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
      if (loginDisabled.value) return;
      errors.value = "";
      const submittedUsername = username.value;
      const submittedPassword = password.value;
      if (!submittedUsername?.trim() || !submittedPassword) {
        errors.value = "Please enter your username and password.";
        return;
      }

      loginDisabled.value = true;
      const errorMessage = "Username and password do not match.";
      const serviceErrorMessage =
        "Unable to sign in right now. Please try again.";
      let response;
      let timeout;
      try {
        const controller = new AbortController();
        timeout = setTimeout(() => controller.abort(), 15000);
        const url = `https://culkcka9db.execute-api.us-east-2.amazonaws.com/Prod/auth?namespace=${$store.AUTH_NAMESPACE}`;
        response = await fetch(url, {
          method: "POST",
          body: JSON.stringify({
            username: submittedUsername,
            password: submittedPassword,
          }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          errors.value = errorMessage;
          return;
        }
        if (!response.ok) {
          errors.value = serviceErrorMessage;
          return;
        }

        const json = await response.json();
        if (json?.success === true) {
          await $store.saveLoginState(submittedUsername);
          await router.push("/");
        } else if (json?.success === false) {
          errors.value = errorMessage;
        } else {
          errors.value = serviceErrorMessage;
        }
      } catch (error) {
        if (error?.name === "AbortError") {
          errors.value = "Login timed out. Please try again.";
        } else {
          errors.value = response
            ? serviceErrorMessage
            : "Could not reach the login service. Check your connection and try again.";
        }
      } finally {
        clearTimeout(timeout);
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
