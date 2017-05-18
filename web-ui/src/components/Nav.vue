<template>
  <nav class="nav has-shadow">
    <div class="nav-left">
      <a href="/" class="nav-item">
        <i class="fa fa-server nav-icon" aria-hidden="true"></i>
        FTPClient WEB GUI
      </a>
    </div>
    <div class="nav-right">
      <a class="nav-item is-tab" @click="logout" v-if="exit">
        <i class="fa fa-sign-out" aria-hidden="true"></i>
        退出
      </a>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'nav',
  props: [
    'exit'
  ],
  methods: {
    logout () {
      this.$http.get('logout')
      .then(response => response.json())
      .then(json => {
        if (json.status === 'OK') {
          // success
          this.$router.replace({path: '/'})
        } else {
          // fail
          console.log(json)
        }
      })
    }
  }
}
</script>

