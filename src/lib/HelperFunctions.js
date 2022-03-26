#! /usr/bin/env node

import { readdir, readFile } from "fs/promises"
import { fileTypes, javascriptExt, typescriptExt } from "./types.js"

class HelperFunctions {
  static async getTree(source) {
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
  static getDynamicParam(fileName) {
    const regex = /(?<=\[).*(?=\])/g
    const paramMatch = fileName.match(regex)

    return paramMatch ? paramMatch[0] : null
  }

  static async getRoutesFor(source, dynamicRouteParams = []) {
    const dirFiles = await HelperFunctions.getTree(source)
    let filesRoute = []

    for (const file of dirFiles) {
      if (file.type === fileTypes.directory) {
        if (file.name === "api") continue
        const fileParam = HelperFunctions.getDynamicParam(file.name)

        if (fileParam)
          filesRoute = filesRoute.concat(
            await HelperFunctions.getRoutesFor(`${source}/${file.name}`, [
              ...dynamicRouteParams,
              fileParam,
            ])
          )
        else
          filesRoute = filesRoute.concat(
            await HelperFunctions.getRoutesFor(
              `${source}/${file.name}`,
              dynamicRouteParams
            )
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

        const fileParam = HelperFunctions.getDynamicParam(file.name)

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
  static getComponentName(content) {
    const match = content.match(
      /(?<=export\s*default(\sfunction)?\s*)[A-z][A-z,0-9]*(?=\s*)/g
    )

    return match.reverse()[0]
  }

  static async findPagesPath() {
    const dirFiles = await HelperFunctions.getTree(process.cwd())
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
  static getStandardUrlGetterFunctionBodyString(dynamicParams = [], path) {
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

  static parseParam(param) {
    return param.replace(",", "").replace(" ", "")
  }

  static async getUrlGetterString(manifestPath, pagesPath, route) {
    const fileContent = await readFile(route.path, {
      encoding: "utf-8",
    })
    const componentName = HelperFunctions.getComponentName(fileContent)
    const relativePath = route.path.slice(pagesPath.length)

    const componentPath =
      route.nameWithoutExtension !== "index"
        ? relativePath.slice(
            0,
            relativePath.length - (".".length + route.extension.length)
          )
        : relativePath.slice(0, relativePath.length - route.name.length)
    let jsString = ""
    const urlGetterString =
      HelperFunctions.getStandardUrlGetterFunctionBodyString(
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
        const paramParsed = HelperFunctions.parseParam(param)
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
}

export default HelperFunctions
