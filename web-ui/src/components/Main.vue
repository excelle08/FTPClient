<template>
  <div id="main">
    <nav-bar exit="true"></nav-bar>
    <file-list></file-list>
  </div>
</template>

<script>
import NavBar from '@/components/Nav'
import FileList from '@/components/FileList'

export default {
  components: {
    NavBar,
    FileList
  }
}
</script>
