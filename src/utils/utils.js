
var createCompiler = createCompilerCreator(function baseCompile (
  template,
  options
) {
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})

function createCompilerCreator (baseCompile) {
  return function (baseOptions) {
    function compile (
      template,
      options
    ) {
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []
      finalOptions.warn = (msg, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // // merge custom directives
        // if (options.directives) {
        //   finalOptions.directives = extend(
        //     Object.create(baseOptions.directives || null),
        //     options.directives
        //   )
        // }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      const compiled = baseCompile(template, finalOptions)
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }
    
    return {
      compile:compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}


function createCompileToFunctionFn (compile) {
  const cache = Object.create(null)

  return function compileToFunctions (
    template,
    options,
    vm
  ) {
    options = extend({}, options)
    const warn = options.warn || baseWarn
    delete options.warn


    // check cache
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template
    if (cache[key]) {
      return cache[key]
    }

    // compile
    const compiled = compile(template, options)

    // turn code into functions
    const res = {}
    const fnGenErrors = []
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    return (cache[key] = res)
  }
}


function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
}

function extend(destination,source) {
    for(var property in source) {
        destination[property] = source[property]
    }
    return destination
}
