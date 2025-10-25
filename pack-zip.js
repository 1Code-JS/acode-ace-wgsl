import * as path from 'path'
import * as fs from 'fs/promises'
import { createWriteStream as fsCreateWriteStream } from 'fs'
import { fileURLToPath } from 'url'
import JSZip from 'jszip'

const __dirname = fileURLToPath(import.meta.resolve( './'))

const iconFile = path.join(__dirname, 'icon.png')
const pluginJSON = path.join(__dirname, 'plugin.json')
const distFolder = path.join(__dirname, 'dist')
const json = JSON.parse(await fs.readFile(pluginJSON, 'utf8'))
let readmeDotMd = json.readme
let changelogDotMd = json.changelogs

readmeDotMd = typeof readmeDotMd === 'string' ? readmeDotMd.trim() : ''
changelogDotMd = typeof changelogDotMd === 'string' ? changelogDotMd.trim() : ''

// create zip file of dist folder
const zip = new JSZip()

zip.file('icon.png', await fs.readFile(iconFile))
zip.file('plugin.json', await fs.readFile(pluginJSON))

let readme, changelog;
[[readme, readmeDotMd], [changelog, changelogDotMd]] = await (async (..._arr) => {
  for (let i = 0; i < 2; i++) {
    const arr = _arr[i]
    let fn = arr[0], ct
    if (fn) {
      ct = await fs.readFile(path.join(__dirname, fn))
      .catch(e => (fn = undefined, console.error(e)))
    } else try {
      fn = arr[1]
      ct = await fs.readFile(path.join(__dirname, fn))
    } catch (e) {
      console.error(e); fn = fn.toLowerCase()
      ct = await fs.readFile(path.join(__dirname, fn))
      .catch(e => (fn = undefined, console.error(e)))
    }
    arr[0] = ct, arr[1] = fn
  }
  return _arr
})([readmeDotMd, 'README.md'], [changelogDotMd, 'CHANGELOG.md'])

if (readme != null) zip.file(readmeDotMd, readme)
if (changelog != null) zip.file(changelogDotMd, changelog)

await loadFile('', distFolder)

zip
  .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  .pipe(fsCreateWriteStream(path.join(__dirname, 'plugin.zip')))
  .on('finish', () => {
    const d = new Date()
    console.log(`${d.toLocaleDateString()} ${d.toLocaleTimeString()}:`, 'Plugin plugin.zip written.')
  })

async function loadFile(root, folder) {
  const distFiles = await fs.readdir(folder)
  for (const file of distFiles) {
    const stat = await fs.stat(path.join(folder, file))
    if (stat.isDirectory()) {
      zip.folder(file)
      await loadFile(path.join(root, file), path.join(folder, file))
      return
    } else if (!/^\/?LICENSE\.txt$/.test(file)) {
      zip.file(path.join(root, file), await fs.readFile(path.join(folder, file)))
    }
  }
}