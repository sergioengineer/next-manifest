#! /usr/bin/env node

import { readFile, writeFile } from "fs/promises"
import { getFolderFilesAndDirectories } from "./common.js"
import { fileTypes, javascriptExt, typescriptExt } from "./types.js"

/**
 * Creates a new ManifestGenerator instance
 * @param {boolean} forTests - Used only for tests routines
 * @returns
 */
const ManifestGeneratorFactory = (forTests = false) => {
  /**
   * Gets the dynamic param that the file name represents when it is parsed by nextjs' router
   * @param {string} fileName
   * @returns
   */
  function getDynamicParam(fileName) {
    const regex = /(?<=\[).*(?=\])/g
    const paramMatch = fileName.match(regex)

    return paramMatch ? paramMatch[0] : null
  }

  /**
   * Returns the route list for each directory inside {path}
   * @param {string} path - path the route's are going to be extracted from
   * @param {Array} [dynamicRouteParams] - list of routes defined by previous calls to this function.
   * This is used iinternally by this function and should be left to default value
   * @returns {[Route]} - An array containing all the routes
   */
  async function getRoutesFor(path, dynamicRouteParams = []) {
    const dirFiles = await getFolderFilesAndDirectories(path)
    let filesRoute = []

    for (const file of dirFiles) {
      if (file.type === fileTypes.directory) {
        if (file.name === "api") continue
        const fileParam = getDynamicParam(file.name)

        if (fileParam)
          filesRoute = filesRoute.concat(
            await getRoutesFor(`${path}/${file.name}`, [
              ...dynamicRouteParams,
              fileParam,
            ])
          )
        else
          filesRoute = filesRoute.concat(
            await getRoutesFor(`${path}/${file.name}`, dynamicRouteParams)
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

        const routePath = `${path}/${file.name}`
        const nameWithoutExtension = file.name.slice(
          0,
          file.name.length - (fileExtension.length + ".".length)
        )
        const routeObject = {
          name: file.name,
          nameWithoutExtension,
          extension: fileExtension,
          path: routePath,
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
   * Gets the name of the component based on it's content string.
   * Works for export deafult function ComponentName and export default ComponentName
   * @param {String} content - file content as string
   * @return {String} - The component name
   */
  function getComponentName(content) {
    const match = content.match(
      /(?<=export\s*default(\sfunction)?\s*)[A-z][A-z,0-9]*(?=\s*)/g
    )
    if (!match || match.length < 1)
      throw new Error("Couldn't find component name")

    return match.reverse()[0]
  }

  /**
   * @param {String[]} dynamicParams
   * @returns {String}
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

  /**
   * Parses param names so that they don't contain characters that might break the javascript code
   * eg. [id1, id2] would break the urlGetter generated code
   *  because they'd end up being interpreted as two different parameters
   * @param {string} param
   * @returns {string} parsed param name
   */
  function parseParam(param) {
    return param.replace(",", "").replace(" ", "")
  }

  /**
   *  Generates a string with the urlGetter function
   * @param {string} pagesPath - Path to nextjs' pages path(either /pages or /src/pages)
   * @param {Route} route - The route the string's going to be generated after
   * @param {string} componentName - name of the component to be created
   * @returns {string} A string containing the urlGetter function body and detailed comments
   * text
   */
  async function getUrlGetterComponentString(pagesPath, route, componentName) {
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

    const commonJsDocEnding = `@param {Object} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/`
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
       ["${componentName}"]: function (
       ${paramBodyString}
       query={}){
        ${urlGetterString}
      },`
    } else {
      jsString += `
        ${commonJsDocEnding}
        ["${componentName}"]: function (query={}){
        ${urlGetterString}
      },`
    }

    return jsString
  }

  /**
   * Generates route manifes
   * @param {String} manifestPath
   * @param {String} pagesPath
   */
  async function generateManifest(manifestPath, pagesPath) {
    console.info("generating manifest...")
    const routes = await getRoutesFor(pagesPath) //get all the routes

    /**
     * clears the added components array
     * This array is used to detect duplacated components
     */
    const addedComponents = new Set()

    let componentsString = ""
    for (const route of routes) {
      try {
        const fileContent = await readFile(route.path, {
          encoding: "utf-8",
        })
        let componentName = getComponentName(fileContent)

        if (addedComponents.has(componentName)) {
          for (let i = 1; ; i++) {
            const newNameCandidate = `${componentName}${i}`
            if (!addedComponents.has(newNameCandidate)) {
              console.warn(
                `Duplicated component name(${componentName}). ${newNameCandidate} was used instead.`,
                route
              )
              componentName = newNameCandidate
              break
            }
          }
        }

        addedComponents.add(componentName)
        componentsString += await getUrlGetterComponentString(
          pagesPath,
          route,
          componentName
        )
      } catch (e) {
        console.error(e.message, route)
      }
    }

    await writeFile(
      manifestPath,
      `
      const Routes = Object.freeze({
        ${componentsString}
      })
      export default Routes`
    )

    console.info("finished generating the manifest.")
  }

  //if this is not a instance that'll be used in unit tests, expose only the generateManifest function
  if (!forTests)
    return {
      generateManifest,
    }

  /**
   * Test instance. Expose every function for unit testing
   */
  return {
    getDynamicParam,
    getRoutesFor,
    getComponentName,
    getStandardUrlGetterFunctionBodyString,
    parseParam,
    getUrlGetterString: getUrlGetterComponentString,
    generateManifest,
  }
}
export default ManifestGeneratorFactory

/**
 * @typedef Route
 * @property {string} name - Name of the file
 * @property {string} nameWithoutExtension - I believe I don't have to explain this one
 * @property {string} extension - Extension of the file
 * @property {string} path - File path
 * @property {boolean} dynamic - True if the route has dynamic params(either in file name or folder structure)
 */

/**
 * @typedef UrlGetterReturn
 * @property {string} jsString - string containing the body of the function to be added
 * @property {string} componentName - name of the component to be added
 */
