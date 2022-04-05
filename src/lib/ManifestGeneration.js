#! /usr/bin/env node

import { readFile, writeFile } from "fs/promises"
import { getFolderFilesAndDirectories } from "./common.js"
import { FileNode, FolderNode, Node } from "./node/index.js"
import {
  DynamicTypes,
  fileTypes,
  javascriptExt,
  typescriptExt,
} from "./types.js"

/**
 * Creates a new ManifestGenerator instance
 * @param {boolean} forTests - Used only for tests routines
 * @returns
 */
const ManifestGeneratorFactory = (forTests = false) => {
  /**
   * Gets the NodeFolder and all of its children for a given path
   * @param {string} path - path the route's are going to be extracted from
   * @returns {FolderNode} - a root folder node
   */
  async function getFolderNodeTreeFor(path) {
    const self = new FolderNode(undefined, "", false)

    await walkInto(path, self)

    return self

    /**
     * @param {string} path
     * @param {{name:string, type:string}} file
     * @param {FolderNode} rootNode
     */
    async function handleFileRoute(path, file, rootNode) {
      const fileNameStripped = file.name.split(".")
      const fileExtension = fileNameStripped[fileNameStripped.length - 1]

      /**
       * Files that start with a'_' don't generate routes.
       * Also files that are not among the accepted file extensions should be ignored
       */
      if (
        file.name.startsWith("_") ||
        (!typescriptExt.has(fileExtension) && !javascriptExt.has(fileExtension))
      )
        return

      const hasDynamicParent = rootNode.hasDynamicParent || rootNode.dynamic

      const routePath = `${path}/${file.name}`
      const nameWithoutExtension = file.name.slice(
        0,
        file.name.length - (fileExtension.length + ".".length)
      )
      const fileContent = await readFile(routePath, {
        encoding: "utf-8",
      })
      const componentName = getComponentName(fileContent)
      const dynamic = file.name.startsWith("[")

      let dynamicType = null
      if (dynamic) {
        if (file.name.startsWith("[[..."))
          dynamicType = DynamicTypes.optionalSlug
        else if (file.name.startsWith("[..."))
          dynamicType = DynamicTypes.requiredSlug
        else dynamicType = DynamicTypes.requiredDynamic
      }

      const fileNode = new FileNode(
        nameWithoutExtension,
        fileExtension,
        routePath,
        dynamic,
        hasDynamicParent,
        componentName,
        rootNode,
        dynamicType
      )
      rootNode.files.push(fileNode)
    }

    /**
     * Walks into path and generate all children nodes for the rootnode
     * @param {string} path
     * @param {FolderNode} rootNode
     */
    async function walkInto(path, rootNode) {
      const dirFiles = await getFolderFilesAndDirectories(path)
      const allPromises = []

      for (const file of dirFiles) {
        if (file.type === fileTypes.directory) {
          // We don't record routes for api's
          if (file.name === "api") continue
          const dynamic = file.name.startsWith("[")

          const folderNode = new FolderNode(
            rootNode,
            file.name,
            dynamic,
            rootNode.dynamic || rootNode.hasDynamicParent,
            dynamic ? DynamicTypes.requiredDynamic : null
          )
          rootNode.children.push(folderNode)

          allPromises.push(walkInto(`${path}/${file.name}`, folderNode))

          continue
        }
        allPromises.push(handleFileRoute(path, file, rootNode))
      }
      await Promise.allSettled(allPromises)
    }
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
   *
   * @param {Node[]} nodes
   * @returns
   */
  function getStandardUrlGetterFunctionBodyString(nodes) {
    const paramsLength = nodes.length
    const params = []
    const nodesParsed = nodes.map((n) => {
      if (n.dynamic) params.push(n.nameParsed)

      return {
        ...n,
        parent: undefined,
        children: undefined,
        path: undefined,
        files: undefined,
      }
    })

    return `
      const nodes = ${JSON.stringify(nodesParsed)};
      const dynamicParams = [${params.join(",")}]
      const queryLength = Object.keys(query).length
      const componentName = "${nodesParsed.at(-1).componentName}"
      return standardFunctionBody(nodes, dynamicParams, queryLength, componentName, query)
      
      
    `
  }

  /**
   *  Generates a string with the urlGetter function
   * @param {FileNode} fileNode - a file node
   * @returns {string} A string containing the urlGetter function body and detailed comments
   * text
   */
  async function getUrlGetterComponentString(fileNode) {
    let jsString = ""

    const commonJsDocEnding = `@param {Object.<string, string>} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/`

    //Mount jsDocComments
    let paramsParsed = []
    let jsDocStrings = []

    /**
     * @type {Node[]}
     */
    let paramList = []

    await Node.walkOutOf(fileNode, (node) => {
      paramList.push(node)
      if (!node.dynamic) return

      paramsParsed.push(node.nameParsed)
      switch (node.dynamicType) {
        case DynamicTypes.requiredDynamic:
          jsDocStrings.push(`\n@param {String} ${node.nameParsed} - Required`)
          break
        case DynamicTypes.requiredSlug:
          jsDocStrings.push(`\n@param {String[]} ${node.nameParsed} - Required`)
          break
        case DynamicTypes.optionalSlug:
          jsDocStrings.push(
            `\n@param {String[]} [${node.nameParsed}] - optional`
          )
      }
    })

    const urlGetterString = getStandardUrlGetterFunctionBodyString(
      paramList.reverse()
    )

    jsString += `
      /**
       * ${jsDocStrings.reverse().join("\n")}
       * 
       ${commonJsDocEnding}
       ["${fileNode.componentName}"]: function (
       ${paramsParsed.reverse().join(",")}
       ${paramsParsed.length > 0 ? "," : ""}
       query={}){
        ${urlGetterString}
      },`

    return jsString
  }

  /**
   * Generates route manifes
   * @param {String} manifestPath
   * @param {String} pagesPath
   * @param {Object} options
   */
  async function generateManifest(manifestPath, pagesPath, options) {
    console.info("generating manifest...")
    let componentsStrings = []

    if (process.env.NODE_ENV === "production")
      options.disableCollisionDetection = true

    try {
      const rootFolderNode = await getFolderNodeTreeFor(pagesPath) //get all the routes

      /**
       * This array is used to detect duplacated components
       */
      const addedComponents = new Set()
      await FolderNode.walkInto(rootFolderNode, async (node) => {
        if (node instanceof FileNode) {
          //If component name is duplicated.
          // We find a new one by appending an index to it
          if (addedComponents.has(node.componentName)) {
            for (let i = 2; ; i++) {
              const newNameCandidate = `${node.componentName}${i}`
              if (!addedComponents.has(newNameCandidate)) {
                console.warn(
                  `Duplicated component name(${node.componentName}). ${newNameCandidate} was used instead.`,
                  node.path
                )
                node.componentName = newNameCandidate
                break
              }
            }
          }
          addedComponents.add(node.componentName)
          componentsStrings.push(await getUrlGetterComponentString(node))
        }
      })

      await writeFile(
        manifestPath,
        `
        const DynamicTypes = JSON.parse('${JSON.stringify(DynamicTypes)}')
        const Routes = Object.freeze({
          ${componentsStrings.join("\n")}
        })
        const routesJson = '${rootFolderNode.serialize()}'
        export  {
          
          routesJson
        }
        export default Routes
        
        function standardFunctionBody(nodes, dynamicParams, queryLength, componentName, query){
          const pathList = []
          let paramIndex = 0
          for(const node of nodes){
            if(!node.dynamic){
              pathList.push(node.name)
              continue
            }
  
            switch(node.dynamicType){
              case DynamicTypes.requiredDynamic:
                if(!dynamicParams[paramIndex])
                  throw new Error("missing required parameter " + node.nameParsed)
                
                pathList.push(dynamicParams[paramIndex++])
                break
              case DynamicTypes.optionalSlug:
                if(typeof dynamicParams[paramIndex] === typeof [])
                  pathList.push(dynamicParams[paramIndex++].join("/"))
                break
              case DynamicTypes.requiredSlug:
                if(!dynamicParams[paramIndex] || typeof dynamicParams[paramIndex] !== typeof [] || dynamicParams[paramIndex].length < 1)
                  throw new Error("missing required parameter " + node.nameParsed)
                  
                pathList.push(dynamicParams[paramIndex++].join("/"))
                break
            }
          }
          if(pathList.at(-1) === "index"){
          pathList.pop()
          }
          let path = pathList.join("/") + "/"
          
          if(queryLength > 0)
            path += "?"
          for(const param in query){
            path += param + "=" + String(query[param]) + "&"
          }
          if(queryLength > 0)
            path = path.substring(0, path.length-1)
          
          ${
            !!options?.disableCollisionDetection
              ? ""
              : "collisionDetection?.(componentName, pathList.slice(1), JSON.parse(routesJson))"
          }
            
          return path
        }

        ${
          !options?.disableCollisionDetection
            ? getCollisionDetectionString()
            : ""
        }
        `
      )
    } catch (e) {
      console.error(e.message)
    }

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
    getFolderNodeTreeFor,
    getComponentName,
    getStandardUrlGetterFunctionBodyString,
    getUrlGetterComponentString,
    generateManifest,
  }
}
export default ManifestGeneratorFactory

function getCollisionDetectionString() {
  return `
  /**
 * @param {string[]} pathList
 * @param {FolderNode} rootNode
 */
async function getSortedRouteList(pathList, rootNode) {
  /**@type {Node[]} */
  let finalCandidates = []
  /**@type {FolderNode[]} */

  let candidates = [rootNode]
  rootNode.priority = 0

  /**
   * Iterates over every folder and file that might match a given route(pathList)
   * Every candidate route will receive a priority which ranges from 0 to 4.
   *
   * Exact name match - 4 priority value
   * Dynamic name - 3 priority value
   * Required slug name - 2 priority value
   * Optional slug name - 1 priority value
   *
   * Priority discrepancy is more important the earlier it appears in the route tree.
   * Thus it is calculated by appending the new priority numbers to the right of the priovious one
   * using base 5 in order to support longer folder trees.
   */
  for (let i = 0; i < pathList.length; i++) {
    const path = pathList[i]
    const isLastPath = pathList.length - 1 === i
    const reverseIndex = pathList.length - i - 1
    if (!isLastPath) {
      /**
       * When it is not the last path. Final candidates can only be slugs
       * those are going to have a lower priority than the rest
       */
      finalCandidates = finalCandidates.concat(
        candidates.reduce((prev, curr) => {
          const files = curr.files.filter((f) => {
            if (!f?.priority) f.priority = 0

            if (f.dynamicType === DynamicTypes.requiredSlug) {
              f.priority += 2 * 5 ** reverseIndex + curr.priority
            }
            if (f.dynamicType === DynamicTypes.optionalSlug) {
              f.priority += 1 * 5 ** reverseIndex + curr.priority
            }

            return f.priority > 0
          })

          return [...prev, ...files]
        }, [])
      )

      //Here we make sure to advance each and every candidate folder deeper into its tree
      // while setting the aproppriate priority
      candidates = candidates.reduce((prev, curr) => {
        const children = curr.children.filter((c) => {
          if (!c?.priority) c.priority = 0

          if (c.name === path)
            c.priority += 4 * 5 ** reverseIndex + curr.priority

          if (c.dynamicType === DynamicTypes.requiredDynamic) {
            c.priority += 3 * 5 ** reverseIndex + curr.priority
          }

          return c.priority > 0
        })

        return [...prev, ...children]
      }, [])
    } else {
      /**
       * Filter files which have either the exact same name as the last part of the path
       * or dynamic ones
       */
      finalCandidates = finalCandidates.concat(
        candidates.reduce((prev, curr) => {
          const files = curr.files.filter((f) => {
            if (!f?.priority) f.priority = 0

            if (f.name === path) {
              f.priority += 4 * 5 ** reverseIndex + curr.priority
            }
            if (f.dynamicType === DynamicTypes.requiredDynamic) {
              f.priority += 3 * 5 ** reverseIndex + curr.priority
            }
            if (f.dynamicType === DynamicTypes.requiredSlug) {
              f.priority += 2 * 5 ** reverseIndex + curr.priority
            }
            if (f.dynamicType === DynamicTypes.optionalSlug) {
              f.priority += 1 * 5 ** reverseIndex + curr.priority
            }

            return f.priority > 0
          })

          return [...prev, ...files]
        }, [])
      )

      /**
       * Folders which are dynamic or have the same name as the last parameter may also
       *  contain final candidates as long as they are called "index"
       */
      finalCandidates = finalCandidates.concat(
        candidates.reduce((prev, curr) => {
          const files = []
          if (curr.name === path || curr.dynamic) {
            const file = curr.files.find((f) => f.name === "index")
            if (file) {
              if (!file?.priority) file.priority = 0

              if (file.name === path) {
                file.priority += 4 * 5 ** reverseIndex + curr.priority
              }
              if (file.dynamicType === DynamicTypes.requiredDynamic) {
                file.priority += 3 * 5 ** reverseIndex + curr.priority
              }
              if (file.dynamicType === DynamicTypes.requiredSlug) {
                file.priority += 2 * 5 ** reverseIndex + curr.priority
              }
              if (file.dynamicType === DynamicTypes.optionalSlug) {
                file.priority += 1 * 5 ** reverseIndex + curr.priority
              }
              files.push(file)
            }
          }

          return [...prev, ...files]
        }, [])
      )
    }
  }

  return finalCandidates.sort((c1, c2) =>
    c2.priority > c1.priority ? 1 : c1.priority > c2.priority ? -1 : 0
  )
}

/**
 * @param {string[]} pathList
 * @param {FolderNode} rootNode
 * @param {string} expectedComponentName
 */
async function hasCollided(expectedComponentName, pathList, rootNode) {
  const sortedRouteList = await getSortedRouteList(pathList, rootNode)
  if (sortedRouteList[0].componentName !== expectedComponentName) return true

  return false
}

/**
 * @param {string[]} pathList
 * @param {FolderNode} rootNode
 * @param {string} expectedComponentName
 */
async function collisionDetection(expectedComponentName, pathList, rootNode) {
  const sortedRouteList = await getSortedRouteList(pathList, rootNode)
  if (sortedRouteList[0].componentName !== expectedComponentName)
    throw new Error(\`Collision detected! It looks like you were trying to redirect the user to route "\${expectedComponentName}",
     but the generated url will end up in route "\${sortedRouteList[0].componentName}".\`)
}
  `
}
