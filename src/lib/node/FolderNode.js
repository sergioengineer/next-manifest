import FileNode from "./FileNode.js"
import Node from "./Node.js"
export default class FolderNode extends Node {
  /**
   * @type {FileNode[]]}
   */
  files = []

  /**
   * @type {FolderNode[]}
   */
  children = []

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
    super(parent, name, dynamic, hasDynamicParent, dynamicType)
  }

  serialize() {
    return JSON.stringify(this, function (key, value) {
      if (key === "parent") return undefined
      if (key === "path") return undefined
      if (key === "extension") return undefined
      return value
    })
  }

  /**
   *
   * @param {FolderNode} node
   * @param {Promise} callback
   */
  static async walkInto(node, callback) {
    const allPromises = []
    allPromises.push(callback(node))

    for (const folderNode of node.children) {
      allPromises.push(FolderNode.walkInto(folderNode, callback))
    }

    for (const fileNode of node.files) {
      const ret = callback(fileNode)
      if (ret instanceof Promise) allPromises.push(ret)
    }

    await Promise.allSettled(allPromises)
  }
}
