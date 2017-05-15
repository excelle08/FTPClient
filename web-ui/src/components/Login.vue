<template>
  <div id="login">
    <div class="columns">
      <div class="column is-0-mobile is-one-quarter-tablet is-one-quarter-desktop"></div>
      <div class="column is-12-mobile is-one-half-tablet is-one-half-desktop">
        <div class="box has-shadow" id="login-pannel">
          <div class="title-container">
            <h1 class="title">登陆</h1>
          </div>
          <label class="label">服务器 IP</label>
          <input type="text" class="input" v-model="server_ip">
          <label class="label">服务器端口</label>
          <input type="text" class="input" v-model="server_port">
          <label class="label">用户名</label>
          <input type="text" class="input" v-model="username">
          <label class="label">密码</label>
          <input type="password" class="input" v-model="password">
          <div class="button-container block">
            <a class="button is-primary">确认登陆</a>
            <a class="button is-danger" @click="clear">清空</a>
          </div>
        </div>
      </div>
      <div class="column is-0-mobile is-one-quarter-tablet is-one-quarter-desktop"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      server_ip: '',
      server_port: '',
      username: '',
      password: ''
    }
  },
  methods: {
    clear () {
      this.server_ip = ''
      this.server_port = ''
      this.username = ''
      this.password = ''
    }
  }
}
</script>


<style>
#login-pannel{
  margin-top: 24px;
}
.title-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.button-container {
  margin-top: 24px;
}
</style>

