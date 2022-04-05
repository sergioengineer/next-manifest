import ManifestGeneratorFactory from "../lib/ManifestGeneration.js"
import { hasCollided } from "./collisionDetection.js"

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
    const { routesJson, default: Routes } = await import(
      process.cwd() + "/__tests__/routeManifest.js"
    )
    {
      const routeString = Routes.Test("test")
      const pathList = routeString.slice(1, routeString.length - 1).split("/")
      if (!(await hasCollided("Test", pathList, JSON.parse(routesJson))))
        console.error("Collision should be detected")
    }

    {
      const routeString = Routes.Test("test2")
      const pathList = routeString.slice(1, routeString.length - 1).split("/")

      if (await hasCollided("Test", pathList, JSON.parse(routesJson)))
        console.error("Collision shouldn't be detected here")
    }
  })
  .catch((c) => {
    console.error("unexpected error happened: ", c)
  })
