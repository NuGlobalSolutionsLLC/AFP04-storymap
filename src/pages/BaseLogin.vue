<template>
  <section>
    <q-card>
      <h4>AFP4 Web-GIS</h4>
      <q-form :autofocus="true" @submit.prevent="doLogin">
        <a href="https://www.nuglobalsolutions.com/" target="_blank">
          <img src="img/logo.png" class="logo">
        </a>
        <fieldset>
          <q-input filled v-model="username" label="Username" />
          <q-input v-model="password" filled
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
        <div class="buttons">
          <q-btn label="Login" type="submit" color="primary" class="full-width"/>
        </div>
      </q-form>
    </q-card>
  </section>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'BaseLogin',
  setup () {
    const username = ref()
    const password = ref()
    const isPwd = ref(true)

    const doLogin = async () => {
      const url = 'https://app.nuglobalsolutions.com/AFP4/index.php'
      const formData = new FormData();
      formData.append('user', username);
      formData.append('pass', password);
      formData.append('submit', true);
      fetch(url, {
        method: 'POST',
        body: formData
      }).then(response => {
        if (response.ok) return response.text()
      }).then(text => {
        const error = text.split('<span>')[1].split('</span>')[0]
        if (error && error.includes('is Invalid')) {
          console.log(username.value, password.value, 'is invalid')
        }
      })
    }
    return {
      changePasswordvisibility () {
        isPwd.value = !isPwd.value
      },
      doLogin,
      isPwd,
      password,
      username,
    }
  }
})
</script>

<style scoped lang="scss">
section {
  width: 100vw;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('img/bg.jpg') no-repeat;
  background-position: center;
  background-size: cover;
  text-align: center;
  h4 {
    padding: 10px 0px;
    margin: 0px;
    background: #23232e;
    color: #9199aa;
  }
  form {
    padding: 40px;
    background: #2b2b36;
    color: #9199aa;
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
