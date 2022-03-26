#! /usr/bin/env node

/// regular routes hi.tsx
// regular index routes  index.tsx
// dynamic route files [id].tsx
// dynamic route dir [id]/index.tsx

import { readdir, readFile, writeFile } from "fs/promises"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const typescriptExt = new Set(["ts", "tsx"])
const javascriptExt = new Set(["js", "jsx"])
const fileTypes = Object.freeze({
  file: "file",
  directory: "directory",
})

async function getTree(source) {
  const dir = await readdir(source, { withFileTypes: true })

  return dir
    .filter((f) => f.isDirectory() || f.isFile())
    .map((file) => {
      const type = file.isFile() ? fileTypes.file : fileTypes.directory
      const name = file.name

      return {
        name,
        type,
      }
    })
}

/**
 * @param {String} fileName
 */
function getDynamicParam(fileName) {
  const regex = /(?<=\[).*(?=\])/g
  const paramMatch = fileName.match(regex)

  return paramMatch ? paramMatch[0] : null
}

async function getRoutesFor(source, dynamicRouteParams = []) {
  const dirFiles = await getTree(source)
  let filesRoute = []

  for (const file of dirFiles) {
    if (file.type === fileTypes.directory) {
      if (file.name === "api") continue
      const fileParam = getDynamicParam(file.name)

      if (fileParam)
        filesRoute = filesRoute.concat(
          await getRoutesFor(`${source}/${file.name}`, [
            ...dynamicRouteParams,
            fileParam,
          ])
        )
      else
        filesRoute = filesRoute.concat(
          await getRoutesFor(`${source}/${file.name}`, dynamicRouteParams)
        )

      continue
    }

    const fileNameStripped = file.name.split(".")
    const fileExtension = fileNameStripped[fileNameStripped.length - 1]

    if (
      !file.name.startsWith("_") &&
      (typescriptExt.has(fileExtension) || javascriptExt.has(fileExtension))
    ) {
      const isDynamicRoute =
        file.name.startsWith("[") || dynamicRouteParams.length > 0

      const path = `${source}/${file.name}`
      const nameWithoutExtension = file.name.slice(
        0,
        file.name.length - (fileExtension.length + ".".length)
      )
      const routeObject = {
        name: file.name,
        nameWithoutExtension,
        extension: fileExtension,
        path,
        dynamic: isDynamicRoute,
      }

      const fileParam = getDynamicParam(file.name)

      if (isDynamicRoute) {
        if (fileParam)
          routeObject.dynamicParams = [...dynamicRouteParams, fileParam]
        else routeObject.dynamicParams = [...dynamicRouteParams]
      }

      filesRoute.push(routeObject)
    }
  }

  return filesRoute
}

/**
 *
 * @param {String} content : ;
 */
function getComponentName(content) {
  const match = content.match(
    /(?<=export\s*default(\sfunction)?\s*)[A-z][A-z,0-9]*(?=\s*)/g
  )

  return match.reverse()[0]
}

async function findPagesPath() {
  const dirFiles = await getTree(process.cwd())
  let pageDirFiles = dirFiles.filter(
    (file) => file.type === fileTypes.directory && file.name === "pages"
  )

  return pageDirFiles.length === 0
    ? process.cwd() + "/src/pages"
    : process.cwd() + "/pages"
}

/**
 * @param {String[]} dynamicParams
 * @returns
 */
function getStandardUrlGetterFunctionBodyString(dynamicParams = [], path) {
  const paramsLength = dynamicParams.length

  return `
    let path = "${path}"
    const queryLength = Object.keys(query).length

    for(let i = 0; i < ${paramsLength}; i++){
      path = path.replace(/\\[([^/]+)]/, arguments[i])
    }

    if(queryLength > 0)
      path += "?"
    for(const param in query){
      path += param + "=" + String(query[param]) + "&"
    }
    if(queryLength > 0)
      path = path.substring(0, path.length-1)
    
    return path
  `
}

function parseParam(param) {
  return param.replace(",", "").replace(" ", "")
}

async function getUrlGetterString(manifestPath, pagesPath, route) {
  const fileContent = await readFile(route.path, {
    encoding: "utf-8",
  })
  const componentName = getComponentName(fileContent)
  const relativePath = route.path.slice(pagesPath.length)

  const componentPath =
    route.nameWithoutExtension !== "index"
      ? relativePath.slice(
          0,
          relativePath.length - (".".length + route.extension.length)
        )
      : relativePath.slice(0, relativePath.length - route.name.length)
  let jsString = ""
  const urlGetterString = getStandardUrlGetterFunctionBodyString(
    route.dynamicParams,
    componentPath
  )

  const commonJsDocEnding = `
  \n@param {Object} [query] - An object whose properties are going to be filled as extra parameters
  eg. urlGetter({foo: "bar"}) = url?foo=bar
  \n@returns {String} - a valid relative Url string
  \n**/`
  jsString += "\n/**"

  if (route.dynamic) {
    //Mount jsDocComments
    let paramBodyString = ""

    for (const param of route.dynamicParams) {
      const paramParsed = parseParam(param)
      jsString += `\n@param {String} ${paramParsed} - Required`
      paramBodyString += `${paramParsed},`
    }
    jsString += `
     ${commonJsDocEnding}
     \n["${componentName}"]: function (
     ${paramBodyString}
     query={}){
      ${urlGetterString}
    },`
  } else {
    jsString += `
      ${commonJsDocEnding}
      \n["${componentName}"]: function (query={}){
      ${urlGetterString}
    },`
  }

  return jsString
}

async function generateManifest() {
  const pagesPath = await findPagesPath()
  const routes = await getRoutesFor(pagesPath)
  console.log(routes)
  const manifestPath = `${process.cwd()}/routeManifest.js`

  let componentsString = ""
  for (const route of routes) {
    componentsString += await getUrlGetterString(manifestPath, pagesPath, route)
  }

  await writeFile(
    manifestPath,
    `
    const Routes = Object.freeze({
      ${componentsString}
    })
    export default Routes`
  )
}

generateManifest()
