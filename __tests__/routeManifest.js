
        const Routes = Object.freeze({
          
      /**
       * 
@param {String} test - Required
       * 
       @param {Object.<string, string>} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/
       ["Test"]: function (
       test
       ,
       query={}){
        
      const nodes = [{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false},{"nameParsed":"test","name":"[test]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic"},{"nameParsed":"pri","name":"pri","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"extension":"tsx","componentName":"Test"}];
      const dynamicParams = [test]
      const queryLength = Object.keys(query).length
      const componentName = "Test"
      return standardFunctionBody(nodes, dynamicParams, queryLength, componentName, query)
      
      
    
      },

      /**
       * 
@param {String} pri - Required
       * 
       @param {Object.<string, string>} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/
       ["Test2"]: function (
       pri
       ,
       query={}){
        
      const nodes = [{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false},{"nameParsed":"test","name":"test","dynamic":false,"hasDynamicParent":false,"dynamicType":null},{"nameParsed":"pri","name":"[pri]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic","extension":"tsx","componentName":"Test2"}];
      const dynamicParams = [pri]
      const queryLength = Object.keys(query).length
      const componentName = "Test2"
      return standardFunctionBody(nodes, dynamicParams, queryLength, componentName, query)
      
      
    
      },

      /**
       * 
       * 
       @param {Object.<string, string>} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/
       ["Home"]: function (
       
       
       query={}){
        
      const nodes = [{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false},{"nameParsed":"index","name":"index","dynamic":false,"hasDynamicParent":false,"dynamicType":null,"extension":"tsx","componentName":"Home"}];
      const dynamicParams = []
      const queryLength = Object.keys(query).length
      const componentName = "Home"
      return standardFunctionBody(nodes, dynamicParams, queryLength, componentName, query)
      
      
    
      },
        })
        const routesJson = '{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false,"files":[{"nameParsed":"index","name":"index","dynamic":false,"hasDynamicParent":false,"dynamicType":null,"componentName":"Home"}],"children":[{"nameParsed":"test","name":"[test]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic","files":[{"nameParsed":"pri","name":"pri","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"componentName":"Test"}],"children":[]},{"nameParsed":"test","name":"test","dynamic":false,"hasDynamicParent":false,"dynamicType":null,"files":[{"nameParsed":"pri","name":"[pri]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic","componentName":"Test2"}],"children":[]}]}'
        export  {
          
          routesJson
        }
        export default Routes
        
        function standardFunctionBody(nodes, dynamicParams, queryLength, componentName, query){
          const pathList = []
          let paramIndex = 0
          for(const node of nodes){
            if(!node.dynamic){
              pathList.push(node.name)
              continue
            }
  
            switch(node.dynamicType){
              case "requiredDynamic":
                if(!dynamicParams[paramIndex])
                  throw new Error("missing required parameter " + node.nameParsed)
                
                pathList.push(dynamicParams[paramIndex++])
                break
              case "optionalSlug":
                if(typeof dynamicParams[paramIndex] === typeof [])
                  pathList.push(dynamicParams[paramIndex++].join("/"))
                break
              case "slug":
                if(!dynamicParams[paramIndex] || typeof dynamicParams[paramIndex] !== typeof [] || dynamicParams[paramIndex].length < 1)
                  throw new Error("missing required parameter " + node.nameParsed)
                  
                pathList.push(dynamicParams[paramIndex++].join("/"))
                break
            }
          }
          if(pathList.at(-1) === "index"){
          pathList.pop()
          }
          let path = pathList.join("/") + "/"
          
          if(queryLength > 0)
            path += "?"
          for(const param in query){
            path += param + "=" + String(query[param]) + "&"
          }
          if(queryLength > 0)
            path = path.substring(0, path.length-1)
          
          return path
        }
        