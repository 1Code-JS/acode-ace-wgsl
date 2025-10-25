import * as wgslHRExports from './mode/wgsl_highlight_rules.js'
import * as wgslExports from './mode/wgsl.js'

const { addMode, removeMode } = acode.require('aceModes')

export const
  define = () => {
    /*
    // ace.define("ace/mode/wgsl_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], (acequire, acexports, module) => {
    ace.define("ace/mode/wgsl_highlight_rules", (...[,, acemodule]) => {
      acemodule.exports = wgslHRExports
    })
    // ace.define("ace/mode/wgsl",["require","exports","module","ace/lib/oop","ace/mode/wgsl_highlight_rules"], (acequire, acexports, module) => {
    ace.define("ace/mode/wgsl", (...[,, acemodule]) => {
      acemodule.exports = wgslExports
    })
    */
    // Object.defineProperties(ace.define.modules)
    ace.define("ace/mode/wgsl", wgslExports)
    ace.define("ace/mode/wgsl_highlight_rules", wgslHRExports)
  },
  add = () => {
    if (self.wgslModeExists) return
    removeMode('wgsl')
    addMode('wgsl', ['wgsl'], 'wgsl')
    self.wgslModeExists = true
  },
  remove = () => self.wgslModeExists &&= (removeMode('wgsl'), false)