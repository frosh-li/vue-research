
const arrayProto = Array.prototype;
const methods = Object.create(arrayProto);

const methodsToPatch = [
   'push',
   'pop',
   'shift',
   'unshift',
   'splice',
   'sort',
   'reverse'
];



function getMethods(key, vm) {
    methodsToPatch.forEach(cmethod => {
        const originMethod = methods[cmethod];
        let that = this;

        Object.defineProperty(methods, cmethod, {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function mutator(...args){
                const results = originMethod.apply(this, args);
                let inserted
                switch (cmethod) {
                  case 'push':
                  case 'unshift':
                    inserted = args
                    break
                  case 'splice':
                    inserted = args.slice(2)
                    break
                }
                (vm.events[`change:${key}`] && vm.events[`change:${key}`]());
                return results
            }
        })
    });

    return methods
}

function isArray(obj){
    return Object.prototype.toString.call(obj) === '[object Array]';
}

export {
    isArray,
    getMethods,
}
