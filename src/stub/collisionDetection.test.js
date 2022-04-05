import ManifestGeneratorFactory from "../lib/ManifestGeneration.js"
import { collisionDetection } from "./collisionDetection.js"

const pagesPath = process.cwd() + "/__tests__/pages"
const manifestFileName = "routeManifest.js"
const manifestGenerator = ManifestGeneratorFactory()

/**
 * Gets manifest path
 */
const manifestPath = process.cwd() + "/__tests__/" + manifestFileName

manifestGenerator
  .generateManifest(manifestPath || defaultManifestPath, pagesPath)
  .then(async () => {
    const { routesJson, Routes } = await import(
      process.cwd() + "/__tests__/routeManifest.js"
    )
    const pathList = Routes.Test("test").split("/").splice(1, 2)
    console.log(pathList)
    console.log(collisionDetection("Test", pathList, routesJson))
  })
  .catch((c) => {
    console.error("unexpected error happened: ", c)
  })
