import Node from "./Node.js"
export default class FileNode extends Node {
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

  serialize() {
    return JSON.stringify(this)
  }
}
