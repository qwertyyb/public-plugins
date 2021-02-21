declare var service: {
  getPlugins: () => PublicPlugin[]
}
declare var PluginManager: {
  getPlugins: () => PublicPlugin[],
  handleInput: (keyword: string, setResult: (plugin: PublicPlugin, list: CommonListItem[]) => void) => void,
  handleEnter: (
    plugin: PublicPlugin,
    args: {
      item: CommonListItem,
      index: number,
      list: CommonListItem[]
    }
  ) => void
}
declare var ipcRenderer: EventEmitter
declare var ResizeObserver: any

interface CommonListItem {
  code?: string,
  title: string,
  subtitle: string,
  icon: string,
  key: string | number,
  onSelect?: () => void,
  onEnter?: (item: CommonListItem, index: number, list: CommonListItem[]) => void,
  [propName: string]: any;
}

interface SetResult {
  (list: CommonListItem[]): void
}

interface PublicPlugin {
  title: string,
  icon: string,
  subtitle: string,
  onInput: (keyword: string, setResult: SetResult) => void
}

interface AppPlugin {
  key: string,
  title: string,
  subtitle: string,
  image: string,
  code: string,
  action?: (plugin: AppPlugin) => void,
  children?: AppPlugin[],
  onCreated?: () => any,
  onInput?: () => any,
}

interface Size {
  width: number,
  height: number
}