export default class Node {
  nameParsed = ""

  /**
   * @param {FolderNode} [parent]
   * @param {string} name
   * @param {boolean} dynamic
   * @param {boolean} hasDynamicParent
   * @param {String} dynamicType
   */
  constructor(
    parent = null,
    name = "",
    dynamic = false,
    hasDynamicParent = false,
    dynamicType = undefined
  ) {
    this.parent = parent
    this.name = name
    this.dynamic = dynamic
    this.hasDynamicParent = hasDynamicParent
    this.dynamicType = dynamicType
    this.nameParsed = this.parseName(name)
  }

  /**
   *
   * @param {Node} node
   * @param {Promise} callback
   */
  static async walkOutOf(node, callback) {
    let current = node
    while (current) {
      const ret = callback(current)
      if (ret instanceof Promise) await ret
      current = current.parent
    }
  }

  /**
   * Parses param names so that they don't contain characters that might break the javascript code
   * eg. [id1, id2] would break the urlGetter generated code
   *  because they'd end up being interpreted as two different parameters
   * @param {string} name
   * @returns {string} parsed param name
   */
  parseName(name) {
    return name.replace(/[\,,\.,\[\,\s\]]/g, "")
  }
}
