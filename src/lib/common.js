import { readdir } from "fs/promises"
import { fileTypes } from "./types.js"

/**
 * Gettes the current folder files
 * @param {string} folderPath -
 * @returns
 */
async function getFolderFilesAndDirectories(folderPath) {
  const dir = await readdir(folderPath, { withFileTypes: true })

  return dir
    .filter((f) => f.isDirectory() || f.isFile())
    .map((file) => {
      const type = file.isFile() ? fileTypes.file : fileTypes.directory
      const name = file.name

      return {
        name,
        type,
      }
    })
}

/**
 * Finds the path to nextjs's pages folder
 * @returns {string} pages' path
 */
async function findPagesPath() {
  const dirFiles = await getFolderFilesAndDirectories(process.cwd())
  let pageDirFiles = dirFiles.filter(
    (file) => file.type === fileTypes.directory && file.name === "pages"
  )

  return pageDirFiles.length === 0
    ? process.cwd() + "/src/pages"
    : process.cwd() + "/pages"
}

export { findPagesPath, getFolderFilesAndDirectories }
