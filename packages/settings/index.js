const { ipcRenderer } = require('electron')

const createKeyEventHandler = (onChange, done) => {
  const key = {
    modifiers: [],
    key: null
  }
  return (event) => {
    event.preventDefault()
    const detectKeys = ['Meta', 'Control', 'Alt', 'Shift']
    // 键名windows和mac不一样，需要转换
    const macLabels = ['Command', 'Control', 'Option', 'Shift']
    const winLabels = ['Windows', 'Control', 'Alt', 'Shift']
    const isWindows = () => /windows|win32/i.test(navigator.userAgent)
    const labels = isWindows() ? winLabels : macLabels
    // 获取修饰按键的状态
    const activeState = detectKeys.map(key => event.getModifierState(key))
    // 根据修饰按键的状态获取平台对应的键名
    const activeLabels = activeState.map((active, index) => active ? labels[index] : null).filter(label => !!label)
    // 排下序，已经按下过的放在前面
    // 先去掉已经抬起的键
    let modifiers = key.modifiers.filter(label => activeLabels.includes(label))
    // 加上本次按下的键
    modifiers = modifiers.concat(...activeLabels.filter(label => !modifiers.includes(label)))
    key.modifiers = modifiers

    if (event.type === 'keydown' && (/^[a-zA-Z]$/.test(event.key) || event.code === 'Space')) {
      const keyLabel = event.code === 'Space' ? 'Space' : event.key
      key.key = keyLabel
      done(key)
    }
    onChange(key)
  }
}

const clearKeyEventHandler = (keyEventHandler) => {
  document.removeEventListener('keydown', keyEventHandler)
  document.removeEventListener('keyup', keyEventHandler)
}

const registerHotkey = (key) => {
  const globalShortcut = require('electron').remote.globalShortcut
  globalShortcut.unregisterAll()
  globalShortcut.register(key, () => {
    require('electron').remote.getGlobal('publicApp').window.main.show()
  })
}

const getLocalSettings = () => {
  const val = localStorage.getItem('settings')
  return val && JSON.parse(val) || {
    autoLaunch: true,
    shortcut: 'CommandOrControl+Space'
  }
}
const saveLocalSettings = (settings) => {
  const oldSettings = getLocalSettings()
  const val = JSON.stringify({ ...oldSettings, ...settings })
  return localStorage.setItem('settings', val)
}

var app = new Vue({
  el: '#app',
  data: {
    views: {
      'common': '通用',
      'plugins': '插件设置',
      'shortcut': '快捷键设置'
    },
    curView: 'common',
    plugins: [],
    settings: getLocalSettings()
  },
  created() {
    console.log(this)
    ipcRenderer.on('getPlugins:response', (e, plugins) => {
      this.plugins = plugins
    })
  },
  mounted () {
    this.getPlugins()
  },
  methods: {
    async getPlugins() {
      const remote = require('electron').remote
      ipcRenderer.sendTo(
        remote.getGlobal('publicApp').window.main.webContents.id,
        'getPlugins'
      )
    },
    async onShortcutBtnClicked() {
      if (this.keyEventHandler) clearKeyEventHandler(this.keyEventHandler)
      const keyEventHandler = createKeyEventHandler(key => {
        console.log(key)
        this.settings.shortcut = [...key.modifiers, key.key].filter(i => i).join('+') || 'CommandOrControl+Space'
      }, (key) => {
        clearKeyEventHandler(keyEventHandler)
        const keyStore = [...key.modifiers, key.key].filter(i => i).join('+')
        registerHotkey(keyStore)
      })
      this.keyEventHandler = keyEventHandler
      document.addEventListener('keydown', keyEventHandler)
      document.addEventListener('keyup', keyEventHandler)
    },
    onAutoLaunchChange (autoLaunch) {
      saveLocalSettings({ autoLaunch })
      this.settings.autoLaunch = autoLaunch
      require('electron').remote.app.setLoginItemSettings({
        openAtLogin: autoLaunch
      })
    },
  }
})