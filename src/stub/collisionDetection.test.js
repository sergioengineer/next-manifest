import ManifestGeneratorFactory from "../lib/ManifestGeneration.js"
import { getSortedRouteList, hasCollided } from "./collisionDetection.js"

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
        console.error("Test 1 - Collision should be detected")
    }

    {
      const routeString = Routes.Test("test2")
      const pathList = routeString.slice(1, routeString.length - 1).split("/")

      if (await hasCollided("Test", pathList, JSON.parse(routesJson)))
        console.error("Test 2 - Collision shouldn't be detected here")
    }

    {
      const routeString = Routes.Same1()
      const pathList = routeString.slice(1, routeString.length - 1).split("/")
      const routeList = await getSortedRouteList(
        pathList,
        JSON.parse(routesJson)
      )

      const mapped = routeList.flatMap((r) => r.name)
      console.log(routeList)
      const allRight =
        mapped[0] === "same" &&
        mapped[1] === "[same]" &&
        mapped[2] === "[...slug]" &&
        mapped[3] === "[[...slug]]"

      if (!allRight)
        console.error("Test 3 - Priority same folder not correctly ordered")
    }
  })
  .catch((c) => {
    console.error("unexpected error happened: ", c)
  })
