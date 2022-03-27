import { useRouter } from "next/router"
import Routes from "../../routeManifest"
export default function Test() {
  const router = useRouter()

  return (
    <>
      <div>
        {JSON.stringify(
          Routes.Test("2", "3", {
            foo: "bar",
            bar: "foo",
          })
        )}
      </div>
      <div>{JSON.stringify(router.query)}</div>
    </>
  )
}
