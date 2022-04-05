import { FolderNode, Node } from "../lib/node/index.js"
import { DynamicTypes } from "../lib/types.js"

/**
 * @param {string[]} pathList
 * @param {FolderNode} rootNode
 * @param {string} expectedComponentName
 */
export default async function collisionDetection(
  pathList,
  rootNode,
  expectedComponentName
) {
  /**@type {Node[]} */
  let finalCandidates = []
  /**@type {FolderNode[]} */
  let candidates = [rootNode]
  rootNode.priority = BigInt(0)

  for (let i = 0; i < pathList.length; i++) {
    const path = pathList[i]
    const isLastPath = pathList.length - 1 === i
    const reverseIndex = BigInt(pathList.length - i)
    if (!isLastPath) {
      /**
       * When it is not the last path. Final candidates can only be slugs
       * those are going to have a lower priority than the rest
       */
      finalCandidates = finalCandidates.concat(
        candidates.reduce((prev, curr) => {
          const files = curr.files.filter((f) => {
            if (!f?.priority) f.priority = BigInt(0)

            if (f.dynamicType === DynamicTypes.requiredSlug) {
              f.priority += 2n * 5n ** reverseIndex + curr.priority
            }
            if (f.dynamicType === DynamicTypes.optionalSlug) {
              f.priority += 1n * 5n ** reverseIndex + curr.priority
            }

            return f.priority > 0
          })

          return [...prev, ...files]
        }, [])
      )

      //Here we make sure to advance each and every candidate folder deeper into its tree
      candidates = candidates.reduce((prev, curr) => {
        const children = curr.children.filter((c) => {
          if (!c?.priority) c.priority = BigInt(0)

          if (c.name === path)
            c.priority += 4n * 5n ** reverseIndex + curr.priority

          if (c.dynamicType === DynamicTypes.requiredDynamic) {
            c.priority += 3n * 5n ** reverseIndex + curr.priority
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
            if (!f?.priority) f.priority = BigInt(0)

            if (f.name === path) {
              f.priority += 4n * 5n ** reverseIndex + curr.priority
            }
            if (f.dynamicType === DynamicTypes.requiredDynamic) {
              f.priority += 3n * 5n ** reverseIndex + curr.priority
            }
            if (f.dynamicType === DynamicTypes.requiredSlug) {
              f.priority += 2n * 5n ** reverseIndex + curr.priority
            }
            if (f.dynamicType === DynamicTypes.optionalSlug) {
              f.priority += 1n * 5n ** reverseIndex + curr.priority
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
              if (!file?.priority) file.priority = BigInt(0)

              if (file.name === path) {
                file.priority += 4n * 5n ** reverseIndex + curr.priority
              }
              if (file.dynamicType === DynamicTypes.requiredDynamic) {
                file.priority += 3n * 5n ** reverseIndex + curr.priority
              }
              if (file.dynamicType === DynamicTypes.requiredSlug) {
                file.priority += 2n * 5n ** reverseIndex + curr.priority
              }
              if (file.dynamicType === DynamicTypes.optionalSlug) {
                file.priority += 1n * 5n ** reverseIndex + curr.priority
              }
              files.push(file)
            }
          }

          return [...prev, ...files]
        }, [])
      )
    }
  }
  finalCandidates.sort((c1, c2) => c2.priority - c1.priority)

  return finalCandidates[0]
}
