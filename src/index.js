#! /usr/bin/env node

/// regular routes hi.tsx
// regular index routes  index.tsx
// dynamic route files [id].tsx
// dynamic route dir [id]/index.tsx
// dynamic route file+dir [id]/[id2]/[id3]

//TODO: Handle cases when components have duplicated names
//TODO: Handle slug routes([...slug])

import { mkdir } from "fs/promises"
import { watchTree } from "watch"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { findPagesPath } from "./lib/common.js"
import ManifestGeneratorFactory from "./lib/ManifestGeneration.js"

const pagesPath = await findPagesPath()
const manifestFileName = "routeManifest.js"
const defaultManifestPath = `${process.cwd()}/${manifestFileName}`
const argv = yargs(hideBin(process.argv)).argv
const manifestGenerator = ManifestGeneratorFactory()

/**
 * Gets manifest path
 */
let manifestPath = undefined
if (argv.out) {
  manifestPath = argv.out
  if (!manifestPath.startsWith(process.cwd())) {
    manifestPath = process.cwd() + "/" + manifestPath
  }
  manifestPath += "/" + manifestFileName
  manifestPath = manifestPath.replace("//", "/")
} else {
  manifestPath = defaultManifestPath
}

//Makes sure the folder tree exists
await mkdir(manifestPath.replace(manifestFileName, ""), { recursive: true })

//Gerate manifest either through watch or just once
if (argv.watch) {
  watchTree(pagesPath, () => {
    manifestGenerator
      .generateManifest(manifestPath || defaultManifestPath, pagesPath)
      .catch((c) => {
        console.error("unexpected error happened: ", c)
      })
  })
} else {
  manifestGenerator
    .generateManifest(manifestPath || defaultManifestPath, pagesPath)
    .catch((c) => {
      console.error("unexpected error happened: ", c)
    })
}
