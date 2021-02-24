const { ipcRenderer } = require('electron')
// const { port1, port2 } = new MessageChannel()
// ipcRenderer.postMessage('port', { hello: 'word' }, [port1])

var app = new Vue({
  el: '#app',
  data: {
    plugins: []
  },
  created() {
    ipcRenderer.on('getPlugins:response', (e, plugins) => {
      this.plugins = plugins
    })
  },
  mounted () {
    this.getPlugins()
  },
  methods: {
    async getPlugins() {
      console.log('ppp')
      const remote = require('electron').remote
      ipcRenderer.sendTo(
        remote.getGlobal('publicApp').window.main.webContents.id,
        'getPlugins'
      )
    }
  }
})