import collisionDetection from "./collisionDetection.js"

const routesJson = JSON.parse(
  '{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false,"files":[{"nameParsed":"index","name":"index","dynamic":false,"hasDynamicParent":false,"dynamicType":null,"componentName":"Home"}],"children":[{"nameParsed":"id","name":"[id]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic","files":[{"nameParsed":"another","name":"another","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"componentName":"More"},{"nameParsed":"id5id6","name":"[id5, id6]","dynamic":true,"hasDynamicParent":true,"dynamicType":"requiredDynamic","componentName":"Test"},{"nameParsed":"index","name":"index","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"componentName":"User"},{"nameParsed":"more","name":"more","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"componentName":"More2"}],"children":[{"nameParsed":"test","name":"test","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"files":[{"nameParsed":"slug","name":"[...slug]","dynamic":true,"hasDynamicParent":true,"dynamicType":"slug","componentName":"catchAll"}],"children":[{"nameParsed":"othertest","name":"othertest","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"files":[{"nameParsed":"slug","name":"[[...slug]]","dynamic":true,"hasDynamicParent":true,"dynamicType":"optionalSlug","componentName":"optionalCatchAll"}],"children":[]}]}]}]}'
)
const pathList = ["a", "test", "1"]

console.log(collisionDetection(pathList, routesJson))
