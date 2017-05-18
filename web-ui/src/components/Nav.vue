<template>
  <nav class="nav has-shadow">
    <div class="nav-left">
      <a href="/" class="nav-item">
        <i class="fa fa-server nav-icon" aria-hidden="true"></i>
        FTPClient WEB GUI
      </a>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'nav',
  props: [
    'exit'
  ]
}
</script>

