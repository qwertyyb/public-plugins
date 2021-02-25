import fs from 'fs'
import * as path from 'path'
// @ts-ignore
import fileIcon from 'file-icon'
import mdfind from './mdfind'

interface App {
  name: string,
  path: string,
  icon: string,
}

const getApplicationSupportPath = () => {
  const path = require('path')
  const subPath = '/cn.qwertyyb.public/launcher'
  const fullPath = path.join(process.env.HOME + '/Library/Application Support/', subPath);
  return fullPath
}

const macosAppPaths = [
  '/System/Applications', // 系统应用
  '/Applications',  // 安装的应用
]


/**
 * List of supported files
 * @type {Array}
 */
const supportedTypes = [
  'com.apple.application-bundle',
  'com.apple.systempreference.prefpane'
]

/**
 * Build mdfind query
 *
 * @return {String}
 */
const buildQuery = () => (
  supportedTypes.map(type => `kMDItemContentType=${type}`).join('||')
)

class LauncherPlugin implements PublicPlugin {

  icon = 'https://img.icons8.com/fluent/48/000000/apps-tab.png'
  title = '应用启动器'
  subtitle = '快速启动应用'

  app: any

  constructor(app: any) {
    this.app = app
    // @ts-ignore
    window.requestIdleCallback(() => {
      this.getAppList()
    })
  }

  private apps: CommonListItem[] = []

  private getAppList = async () => {
    const { stdout, terminate } = mdfind({
      query: buildQuery(),
      // @ts-ignore
      directories: macosAppPaths,
    })
    const iconDir = path.join(getApplicationSupportPath(), 'launcher-icons')
    if(!await fs.promises.access(iconDir).catch(err => false)) {
      await fs.promises.mkdir(iconDir, { recursive: true })
    }
    let list: any = await stdout
    list = await Promise.all(list.map(async (app: any) => {
      const iconPath = path.join(iconDir, app.name + '.png')
      await fileIcon.file(app.path, {
        destination: iconPath,
        size: 64,
      })
      return {
        ...app,
        icon: 'localfile://' + iconPath,
      }
    }))
    this.apps = list.map((app: App) => ({
      code: app.name,
      subtitle: app.path,
      title: app.name,
      icon: app.icon,
      path: app.path,
      key: app.path,
      onEnter: (app: App) => {
        const { exec } = require('child_process')
        exec(`open -a "${app.path}"`)
      }
    }))
  }

  onInput(
    keyword: string,
    setResult: (list: CommonListItem[]) => void
  ) {
    if (!keyword) return setResult([])
    keyword = keyword.toLocaleLowerCase();
    const pinyinMatch = this.app.getUtils().pinyinMatch
    console.log(this.app)
    setResult(this.apps.filter(item => {
      return item.code?.toLocaleLowerCase().includes(keyword)
        || pinyinMatch(item.title, keyword)
    }))
  }
}

export default (app: any) => new LauncherPlugin(app)
