const typescriptExt = new Set(["ts", "tsx"])
const javascriptExt = new Set(["js", "jsx"])
const FileTypes = Object.freeze({
  file: "file",
  directory: "directory",
})

const DynamicTypes = Object.freeze({
  optionalSlug: "optionalSlug",
  requiredSlug: "slug",
  requiredDynamic: "requiredDynamic",
})

export { typescriptExt, javascriptExt, FileTypes as fileTypes, DynamicTypes }
