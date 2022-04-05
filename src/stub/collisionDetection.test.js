import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import ManifestGeneratorFactory from "../lib/ManifestGeneration.js"
import { getSortedRouteList } from "./collisionDetection.js"

const pagesPath = process.cwd() + "/__tests__/pages"
const manifestFileName = "routeManifest.js"
const argv = yargs(hideBin(process.argv)).argv
const manifestGenerator = ManifestGeneratorFactory()

/**
 * Gets manifest path
 */
const manifestPath = process.cwd() + "/__tests__/" + manifestFileName

manifestGenerator
  .generateManifest(manifestPath || defaultManifestPath, pagesPath)
  .then(async (_) => {
    const { routesJson, Routes } = await import(
      process.cwd() + "/__tests__/routeManifest.js"
    )
    const pathList = Routes.Test("test").split("/").splice(1, 2)
    console.log(pathList)
    console.log(getSortedRouteList(pathList, routesJson))
  })
  .catch((c) => {
    console.error("unexpected error happened: ", c)
  })
