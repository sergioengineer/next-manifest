const typescriptExt = new Set(["ts", "tsx"])
const javascriptExt = new Set(["js", "jsx"])
const fileTypes = Object.freeze({
  file: "file",
  directory: "directory",
})

export { typescriptExt, javascriptExt, fileTypes }
