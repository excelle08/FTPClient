<template>
  <div id="filelist">
    <div class="columns">
      <div class="column is-10-mobile is-offset-1-mobile is-8-tablet is-offset-2-tablet">
        <table class="table is-striped">
          <thead>
            <tr>
              <th>名称</th>
              <th>大小</th>
              <th>拥有者</th>
              <th>模式</th>
              <th>修改时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in files">
              <td>{{file.filename}}</td>
              <td>{{file.length | size}}</td>
              <td>{{file.owner}}</td>
              <td>{{file.mode}}</td>
              <td>{{file.month}} {{file.day}} {{file.time}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import filesize from 'filesize'

export default {
  name: 'filelist',
  data () {
    return {
      files: []
    }
  },
  methods: {
    get_files () {
      console.log('123')
      this.$http.get(`root/${this.path}`)
      .then(response => response.json())
      .then(json => {
        this.files = json
      })
    }
  },
  created () {
    this.get_files()
  },
  computed: {
    path () {
      if (this.$route.params.path) {
        return this.$route.params.path
      } else {
        return ''
      }
    }
  },
  filters: {
    size (value) {
      return filesize(value)
    }
  }
}
</script>

<style>
#filelist {
  margin-top: 24px;
}
</style>

