#! /usr/bin/env node

/// regular routes hi.tsx
// regular index routes  index.tsx
// dynamic route files [id].tsx
// dynamic route dir [id]/index.tsx
// dynamic route file+dir [id]/[id2]/[id3]

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
  const routes = await HelperFunctions.getRoutesFor(pagesPath)

  let componentsString = ""
  for (const route of routes) {
    componentsString += await HelperFunctions.getUrlGetterString(
      manifestPath,
      pagesPath,
      route
    )
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

let manifestPath = undefined
if (argv.out) {
  manifestPath = argv.out
}

if (argv.watch) {
  watchTree(pagesPath, () => {
    console.log("executing watch tree")
    generateManifest(manifestPath || defaultManifestPath).catch((c) => {
      console.error(c)
    })
  })
}
generateManifest(manifestPath || defaultManifestPath).catch((c) => {
  console.error(c)
})
