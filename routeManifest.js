
        const Routes = Object.freeze({
          
      /**
       * 
@param {String} id - Required

@param {String[]} [slug] - optional
       * 
       @param {Object.<string, string>} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/
       ["optionalCatchAll"]: function (
       id,slug
       ,
       query={}){
        
      const nodes = [{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false},{"nameParsed":"id","name":"[id]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic"},{"nameParsed":"test","name":"test","dynamic":false,"hasDynamicParent":true,"dynamicType":null},{"nameParsed":"othertest","name":"othertest","dynamic":false,"hasDynamicParent":true,"dynamicType":null},{"nameParsed":"slug","name":"[[...slug]]","dynamic":true,"hasDynamicParent":true,"dynamicType":"optionalSlug","extension":"tsx","componentName":"optionalCatchAll"}];
      const dynamicParams = [id,slug]
      const queryLength = Object.keys(query).length
      const componentName = "optionalCatchAll"
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
    
      },

      /**
       * 
@param {String} id - Required

@param {String[]} slug - Required
       * 
       @param {Object.<string, string>} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/
       ["catchAll"]: function (
       id,slug
       ,
       query={}){
        
      const nodes = [{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false},{"nameParsed":"id","name":"[id]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic"},{"nameParsed":"test","name":"test","dynamic":false,"hasDynamicParent":true,"dynamicType":null},{"nameParsed":"slug","name":"[...slug]","dynamic":true,"hasDynamicParent":true,"dynamicType":"slug","extension":"tsx","componentName":"catchAll"}];
      const dynamicParams = [id,slug]
      const queryLength = Object.keys(query).length
      const componentName = "catchAll"
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
    
      },

      /**
       * 
@param {String} id - Required
       * 
       @param {Object.<string, string>} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/
       ["More"]: function (
       id
       ,
       query={}){
        
      const nodes = [{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false},{"nameParsed":"id","name":"[id]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic"},{"nameParsed":"another","name":"another","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"extension":"tsx","componentName":"More"}];
      const dynamicParams = [id]
      const queryLength = Object.keys(query).length
      const componentName = "More"
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
    
      },

      /**
       * 
@param {String} id - Required
       * 
       @param {Object.<string, string>} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/
       ["User"]: function (
       id
       ,
       query={}){
        
      const nodes = [{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false},{"nameParsed":"id","name":"[id]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic"},{"nameParsed":"index","name":"index","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"extension":"tsx","componentName":"User"}];
      const dynamicParams = [id]
      const queryLength = Object.keys(query).length
      const componentName = "User"
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
    
      },

      /**
       * 
@param {String} id - Required
       * 
       @param {Object.<string, string>} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/
       ["More2"]: function (
       id
       ,
       query={}){
        
      const nodes = [{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false},{"nameParsed":"id","name":"[id]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic"},{"nameParsed":"more","name":"more","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"extension":"tsx","componentName":"More2"}];
      const dynamicParams = [id]
      const queryLength = Object.keys(query).length
      const componentName = "More2"
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
    
      },

      /**
       * 
@param {String} id - Required

@param {String} id5id6 - Required
       * 
       @param {Object.<string, string>} [query] - An object whose properties are going to be filled as extra parameters
    eg. urlGetter({foo: "bar"}) = url?foo=bar
    @returns {String} - a valid relative Url string
    **/
       ["Test"]: function (
       id,id5id6
       ,
       query={}){
        
      const nodes = [{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false},{"nameParsed":"id","name":"[id]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic"},{"nameParsed":"id5id6","name":"[id5, id6]","dynamic":true,"hasDynamicParent":true,"dynamicType":"requiredDynamic","extension":"tsx","componentName":"Test"}];
      const dynamicParams = [id,id5id6]
      const queryLength = Object.keys(query).length
      const componentName = "Test"
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
    
      },
        })
        export default Routes
        const routesJson = JSON.parse('{"nameParsed":"","name":"","dynamic":false,"hasDynamicParent":false,"files":[{"nameParsed":"index","name":"index","dynamic":false,"hasDynamicParent":false,"dynamicType":null,"componentName":"Home"}],"children":[{"nameParsed":"id","name":"[id]","dynamic":true,"hasDynamicParent":false,"dynamicType":"requiredDynamic","files":[{"nameParsed":"another","name":"another","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"componentName":"More"},{"nameParsed":"index","name":"index","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"componentName":"User"},{"nameParsed":"more","name":"more","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"componentName":"More2"},{"nameParsed":"id5id6","name":"[id5, id6]","dynamic":true,"hasDynamicParent":true,"dynamicType":"requiredDynamic","componentName":"Test"}],"children":[{"nameParsed":"test","name":"test","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"files":[{"nameParsed":"slug","name":"[...slug]","dynamic":true,"hasDynamicParent":true,"dynamicType":"slug","componentName":"catchAll"}],"children":[{"nameParsed":"othertest","name":"othertest","dynamic":false,"hasDynamicParent":true,"dynamicType":null,"files":[{"nameParsed":"slug","name":"[[...slug]]","dynamic":true,"hasDynamicParent":true,"dynamicType":"optionalSlug","componentName":"optionalCatchAll"}],"children":[]}]}]}]}')
        
        