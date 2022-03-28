class Node {
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

class FolderNode extends Node {
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

class FileNode extends Node {
  /**
   * @param {string} name - Name of the file
   * @param {string} extension - Extension of the file
   * @param {string} path - File path
   * @param {boolean} dynamic - True if the route has dynamic params(either in file name or folder structure)
   * @param {boolean} hasDynamicParent - True if one of the parent folders is dynamic
   * @param {string} componentName - Name of the component inside the file represented by this route
   * @param {FolderNode} parent - Name of the component inside the file represented by this route
   * @param {string} dynamicType - See DynamicTypes for possible values
   */
  constructor(
    name,
    extension,
    path,
    dynamic,
    hasDynamicParent,
    componentName,
    parent,
    dynamicType
  ) {
    super(parent, name, dynamic, hasDynamicParent, dynamicType)

    this.extension = extension
    this.path = path
    this.componentName = componentName
  }

  getRelativePath() {
    path = this.name === "index" ? "" : this.name
    let parent = this.parent
    while (parent) {
      path = parent.name + "/" + path
      parent = parent.parent
    }

    return path
  }

  serialize() {
    return JSON.stringify(this)
  }
}

export { Node, FileNode, FolderNode }
