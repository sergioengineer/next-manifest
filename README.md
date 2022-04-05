## Next Manifest

Next manifest is a package which generates a blitzjs-like route manifest for NextJs projects.
Instead of writing plain urls, you can reference nextjs' pages through the Routes object.

##

- `/url1/${param}/test.jsx`

becomes

- `Routes.Test(param)`

---

- `/url1/${param}/test.jsx?foo=bar`

becomes

- `Routes.Test(param, [{foo: "bar"}])`

##

Next manifest also calculates route collisions.

Imagine the following folder tree:

- -> **[test]** / test.jsx (component name Test1)
- -> test / **[test]**.jsx (component name Test2)

The second route takes priority over the first one whenever the first parameter is named "test". That's because, in nextjs, exact name's have higher priority than dynamic params. The left most priority discrepancy is the most important one.

So, if you call
`Test("test")`
You'll get an exception telling you that you are trying to redirect the user to a route which **collides** with one of higher priority.
