import { WgslHighlightRules } from './wgsl_highlight_rules.js'

// console.log("ace/mode/wgsl")
// const { WgslHighlightRules } = ace.require('ace/mode/wgsl_highlight_rules')
const { Mode: TextMode } = ace.require('ace/mode/text')
const { FoldMode } = ace.require('ace/mode/folding/cstyle')

export const Mode = class Mode extends TextMode {
  constructor() {
    super(...arguments)
    this.HighlightRules = WgslHighlightRules
    this.foldingRules = new FoldMode()
    this.$behaviour = this.$defaultBehaviour
  }
  static {
    Object.assign(this.prototype, {
      $id: 'ace/mode/wgsl',
      name: 'ace/mode/wgsl',
      lineCommentStart: '//',
      blockComment: { start: "/*", end: "*/", nestable: true }
    })
  }
}