const KEYWORDS = [
  'public settings',
  '设置'
]

const getLocalSettings = () => {
  const val = localStorage.getItem('settings')
  return val && JSON.parse(val) || {
    autoLaunch: true,
    shortcut: 'CommandOrControl+Space'
  }
}

let win: any = null;

export default (app: any): PublicPlugin => {

  // @ts-ignore 注册快捷键
  window.requestIdleCallback(() => {
    const globalShortcut = require('electron').remote.globalShortcut
    globalShortcut.unregisterAll()
    globalShortcut.register(getLocalSettings().shortcut, () => {
      app.getMainWindow().show()
    })
  })

  // @ts-ignore 注册开机启动
  window.requestIdleCallback(() => {
    require('electron').remote.app.setLoginItemSettings({
      openAtLogin: getLocalSettings().settings
    })
  })
  return {
    title: '设置',
    icon: 'https://img.icons8.com/nolan/64/settings--v1.png',
    subtitle: 'Public设置',
    onInput(
      keyword: string,
      setList: (list: CommonListItem[]) => void
    ) {
      keyword = keyword.toLocaleLowerCase()
      if (app.getUtils().match(KEYWORDS, keyword)) {
        setList([
          {
            title: '设置',
            subtitle: 'Public设置',
            icon: 'https://img.icons8.com/nolan/64/settings--v1.png',
            key: 'public:settings',
            onEnter: () => {
              if (win) {
                win?.show()
                return;
              }
              const path = require('path')
              const { BrowserWindow, getCurrentWindow } = require('electron').remote
              win = new BrowserWindow({
                width: 800,
                height: 600,
                webPreferences: {
                  devTools: true,
                  nodeIntegration: true,
                  enableRemoteModule: true,
                }
              })
              win.webContents.loadFile(path.join(__dirname, './index.html'))
              win.webContents.openDevTools()
              win.on('close', () => {
                win = null
              })
            }
          }
        ])
      } else {
        setList([])
      }
    }
  }
}