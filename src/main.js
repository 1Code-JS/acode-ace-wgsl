import pluginJSON from '../plugin.json'

import * as aceWgslMode from './aceMode.js'

const isWgslFile = e => {
  return /\.wgsl$/i.test(e?.name ?? '')
}

const acodePlugin = self.acodeWGSLPlugin ??= (() => {
  const plugin = {}
  
  let onSwitchFile, _onSwitchFile = ({ ''() {
    if (typeof onSwitchFile !== 'function') return
    return onSwitchFile.apply(this, arguments)
  } })['']
  Object.defineProperty(plugin, 'onSwitchFile', {
    get: () => onSwitchFile,
    set: v => void (onSwitchFile = v),
    enumerable: true,
    configurable: true
  })
  
  editorManager.on("switch-file", _onSwitchFile)
  editorManager.on("rename-file", _onSwitchFile)
  plugin.destroy = () => {
    editorManager.off("switch-file", _onSwitchFile)
    editorManager.off("rename-file", _onSwitchFile)
    _onSwitchFile = onSwitchFile = undefined
  }
  Object.defineProperties(plugin, {
    destroy: { configurable: false, writable: false }
  })
  return plugin
})()

const onSwitchFile = file => {
  // const { editorManager } = globalThis
  try {
    // const { activeFile: file } = editorManager.activeFile
    let t = editorManager?.editor?.container
    if (isWgslFile(file)) {
      const { Mode } = ace.require("ace/mode/wgsl")
      file.session?.setMode(new Mode())
    }
  } catch (e) {
    console.group("AcodeWGSL: 'onSwitchFile' error")
    console.error(e)
    console.groupEnd()
  }
}

class AcodePlugin {
  #style
  async init({ baseUrl, firstInit }) {
    const style = this.#style = document.createElement('style')
    style.textContent = (`
      .file_type_wgsl::before {
        display: inline-block;
        content: '';
        background-image: url("${baseUrl}webgpu-notext.svg");
        background-size: contain;
        background-repeat: no-repeat;
        height: 1em;
        width: 1em;
      }
    `)
    document.head.append(style)
    
    aceWgslMode.define()
    aceWgslMode.add()
    const { Mode } = ace.require('ace/mode/wgsl')
    for (const file of editorManager.files) {
      // setTimeout(() => console.log(file), 1000)
      if (isWgslFile(file)) Promise.try(() => file.session?.setMode(new Mode()))
    }
    
    // document.head.append(this.#style)
    acodeWGSLPlugin.onSwitchFile = onSwitchFile
    
    if (!firstInit) return
    let modeAssociated
    try {
      modeAssociated = JSON.parse(localStorage.modeassoc || "{}")
    } catch (error) {
      modeAssociated = {}
    }
    modeAssociated['.wgsl'] = 'ace/mode/wgsl'
    localStorage.modeassoc = JSON.stringify(modeAssociated)
   // setTimeout(() => location.reload(), 500)
  }

  async destroy() {
    acodeWGSLPlugin.onSwitchFile = undefined
    this.#style.remove()
    aceWgslMode.remove()
    for (const file of editorManager.files) {
      if (isWgslFile(file.name)) file.session.setMode('ace/mode/text')
    }
  }
}

if (window.acode) {
  const acodePlugin = new AcodePlugin();
  acode.setPluginInit(pluginJSON.id, async (baseUrl, $page, options) => {
    if (!baseUrl.endsWith('/')) baseUrl += '/'
    acodePlugin.baseUrl = baseUrl
    await acodePlugin.init({ baseUrl, firstInit: options.firstInit })
  })
  acode.setPluginUnmount(pluginJSON.id, () => {
    acodePlugin.destroy()
  })
}
