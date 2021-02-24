const KEYWORDS = [
  'settings',
  '设置'
]
let win: any = null;

export default (app: any): PublicPlugin => {
  return {
    title: '设置',
    icon: 'https://img.icons8.com/nolan/64/settings--v1.png',
    subtitle: 'Public设置',
    onInput(
      keyword: string,
      setList: (list: CommonListItem[]) => void
    ) {
      keyword = keyword.toLocaleLowerCase()
      if (KEYWORDS.find(full => full.includes(keyword))) {
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
              const { BrowserWindow, ipcMain } = app.getElectron().remote
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
            }
          }
        ])
      }
    }
  }
}