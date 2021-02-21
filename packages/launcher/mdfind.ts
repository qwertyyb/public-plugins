import { exec } from 'child_process'
import path from 'path'

const REAL_KEYS = {
  kMDItemDisplayName: 'name',
  kMDItemLastUsedDate: 'lastUsed',
  kMDItemUseCount: 'useCount'
}

const mfindAsync = (args: string) => {
  let process: any
  const stdout = new Promise((resolve, reject) => {
    process = exec(`mdfind ${args}`, (err, result) => {
      if (err) return reject(err)
      const lines = result.split('\0').filter(r => r)
      const results = lines.map(line => parseLine(line))
      return resolve(results)
    })
  })
  return {
    stdout,
    terminate: () => process.kill()
  }
}

/**
 * Parse mdfind result line to JS object
 *
 * @param  {String} line
 * @return {Object}
 */
function parseLine(line: string) {
  const attrs = line.split('   ')
  // First attr is always full path to the item
  const filePath = <string>attrs.shift()
  const result: any = {
    path: filePath,
    filename: path.basename(filePath).replace(/\.app$/, '')
  }
  attrs.forEach(attr => {
    const [key, value] = attr.split(' = ')
    // @ts-ignore
    result[REAL_KEYS[key] || key] = getValue(value)
  })
  return result
}

const getValue = (item: string) => {
  if (!item || item === '(null)') {
    return null
  } else if (item.startsWith('(\n    "') && item.endsWith('"\n)')) {
    const actual = item.slice(7, -3)
    const lines = actual.split('",\n    "')
    return lines
  }
  return item
}

const makeArgs = (array: string[], argName: string) => (
  array.map(item => [argName, item]).flat()
)

export default function mdfind({
  query = '',
  attributes = Object.keys(REAL_KEYS),
  names = [],
  directories = [],
  live = false,
  interpret = false,
  limit = 1024,
} = {}) {
  const dirArgs = makeArgs(directories, '-onlyin')
  const nameArgs = makeArgs(names, '-name')
  const attrArgs = makeArgs(attributes, '-attr')
  const interpretArgs = interpret ? ['-interpret'] : []
  const queryArgs = query ? [query] : []

  const args = ['-0'].concat(
    dirArgs,
    nameArgs,
    attrArgs,
    interpretArgs,
    live ? ['-live', '-reprint'] : [],
    queryArgs
  ).flat().join(' ')

  const process = mfindAsync(`${args}`)
  // @ts-ignore
  process.stdout = process.stdout
  

  return process
}