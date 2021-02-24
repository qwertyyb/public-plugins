const { exec } = window.require('child_process');
const os = window.require('os')

const COMMAND = 'lock'

const lock = (cb?: () => void, customCommands?: any) => {
  
  const lockCommands = customCommands || {
    darwin: `open -a ScreenSaverEngine`,
    win32: 'rundll32.exe user32.dll, LockWorkStation',
    linux: '(hash gnome-screensaver-command 2>/dev/null && gnome-screensaver-command -l) || (hash dm-tool 2>/dev/null && dm-tool lock)'
  };
  const platform = os.platform()
  if(Object.keys(lockCommands).indexOf(platform) === -1) {
    throw new Error(`lockscreen doesn't support your platform (${platform})`);
  } else {
    exec(lockCommands[platform], (err: string, stdout: string) => {
      console.log('callback', err, stdout)
    });
  }
}

class LockScreenPlugin implements PublicPlugin {
  icon = 'https://img.icons8.com/fluent/48/000000/lock.png'
  title = '锁屏'
  subtitle = '锁定你的电脑'
  onInput(keyword: string, setResult: SetResult) {
    if (COMMAND.includes(keyword) && keyword) {
      setResult([
        {
          code: COMMAND,
          title: '锁屏',
          subtitle: 'Lock',
          key: 'plugin:lockscreen',
          icon: 'https://img.icons8.com/fluent/48/000000/lock.png',
          onEnter: () => {
            lock()
          }
        }
      ])
    } else {
      setResult([])
    }
  }
}

export default () => new LockScreenPlugin()