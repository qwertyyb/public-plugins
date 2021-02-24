const { ipcRenderer } = require('electron')


var app = new Vue({
  el: '#app',
  data: {
    plugins: []
  },
  created () {
    this.getPlugins()
  },
  methods: {
    getPlugins() {
      console.log(ipcRenderer.invoke('settings:getPlugins'))
    }
  }
})