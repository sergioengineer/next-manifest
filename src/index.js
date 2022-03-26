#! /usr/bin/env node

/// regular routes hi.tsx
// regular index routes  index.tsx
// dynamic route files [id].tsx
// dynamic route dir [id]/index.tsx
// dynamic route file+dir [id]/[id2]/[id3]

//TODO: Handle cases when components have duplicated names
//TODO: Handle slug routes([...slug])

import { writeFile } from "fs/promises"
import { dirname } from "path"
import { fileURLToPath } from "url"
import { watchTree } from "watch"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import HelperFunctions from "./lib/HelperFunctions.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const pagesPath = await HelperFunctions.findPagesPath()
const defaultManifestPath = `${process.cwd()}/routeManifest.js`
const argv = yargs(hideBin(process.argv)).argv

async function generateManifest(manifestPath) {
  console.info("generating manifest...")
  const routes = await HelperFunctions.getRoutesFor(pagesPath)

  let componentsString = ""
  for (const route of routes) {
    try {
      componentsString += await HelperFunctions.getUrlGetterString(
        manifestPath,
        pagesPath,
        route
      )
    } catch (e) {
      console.error("skipping route(likely an invalid component name): ", route)
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

let manifestPath = undefined
if (argv.out) {
  manifestPath = argv.out
}

if (argv.watch) {
  watchTree(pagesPath, () => {
    generateManifest(manifestPath || defaultManifestPath).catch((c) => {
      console.error(c)
    })
  })
} else {
  generateManifest(manifestPath || defaultManifestPath).catch((c) => {
    console.error(c)
  })
}
