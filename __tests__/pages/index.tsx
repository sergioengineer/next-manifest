import type { NextPage } from "next"
import Routes from "../routeManifest"

const Home: NextPage = () => {
  return (
    <>
      <div>{Routes.catchAll("123", ["1234"], { as: "2" })}</div>
    </>
  )
}

export default Home
export {}
