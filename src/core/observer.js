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



methodsToPatch.forEach(cmethod => {
    const originMethod = methods[cmethod];
    let ob = this.__ob__;
    console.log('array ob', ob)
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
            if (inserted) {
                ob.observeArray(inserted)
            }
            console.log('数组数据更新了', this.__ob__, dep)
            ob.dep.notify()

            // notify change
            return results
        }
    })
});




class Observe {
    constructor(data) {
        if(!data || typeof data !== 'object') {
            return;
        }
        this.$data = data;

        this.dep = new Dep();

        Object.defineProperty(data, '__ob__', {
            writable: true,
            enumerable: true,
            configurable: true,
            value:this,
        });

        Object.defineProperty(data, '_isVue', {
            writable: true,
            enumerable: true,
            configurable: true,
            value:true,
        });

        data._isVue = true;



        if(isArray(data)) {
            //Object.setPrototypeOf(data, methods); // 设置到原型，并开始监听对应的子元素
            //this.observeArray(data);
        }else{
            this.walk(data);
        }
    }

    observeProperty(obj, key, val) {
        let dep = new Dep();
        let observe = this.observe;
        console.log('start observe', obj, key ,val);
        let childOb = observe(val);
        console.log('observe', obj, key, val)
        Object.defineProperty(obj, key, {
            emumerable: true, //可以枚举
            configurable: true, //可以重新定义
            get: () => {
                if(Dep.target) {
                    dep.depend();
                    if(childOb) {
                        childOb.dep.depend();
                        if(isArray(val)) {
                            dependArray(val);
                            console.log('get array', val);
                        }
                    }
                }

                return val;
            },
            set: (newVal) => {
                if(val === newVal || (newVal !== newVal && val !== val)) {
                    return;
                }
                val = newVal
                childOb = observe(newVal);
                dep.notify();
                console.log("data数据更新", val , "=>", newVal);
            }
        })
    }

    observe(value) {

        if(!value || typeof value !== 'object') {
            return;
        }
        var ob;
        if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observe) {
            ob = value.__ob__;
        } else if(value._isVue !== true){
            ob = new Observe(value);
        }
        return ob
    }

    walk(obj) {
        if(typeof obj !== "object") {
            
            return;
        }
        let keys = Object.keys(obj);
        let that = this;
        for(let i = 0 ; i < keys.length ; i++) {
            let key = keys[i];
            var dep = new Dep();
            var property = Object.getOwnPropertyDescriptor(obj, key);
            if (property && property.configurable === false) {
              return
            }
            let val = obj[key];
            console.log(val);

            let childOb = that.observe(val);
            console.log('had observed', obj)
            Object.defineProperty(obj, key, {
              enumerable: true,
              configurable: true,
              get: function reactiveGetter () {
                var value = getter ? getter.call(obj) : val;
                if (Dep.target) {
                  dep.depend();
                  if (childOb) {
                    childOb.dep.depend();
                    if (isArray(value)) {
                      dependArray(value);
                    }
                  }
                }
                return value
              },
              set: function reactiveSetter (newVal) {
                var value = getter ? getter.call(obj) : val;
                /* eslint-disable no-self-compare */
                if (newVal === value || (newVal !== newVal && value !== value)) {
                  return
                }
                if (setter) {
                  setter.call(obj, newVal);
                } else {
                  val = newVal;
                }
                childOb = that.observe(newVal);
                dep.notify();
              }
            });
        }
    }

    observeArray(key, obj, originObj) {
        if(!obj) {
            return;
        }

        obj.forEach(item => {
            this.observe(item);
        });

    }

}


function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (isArray(e)) {
      dependArray(e);
    }
  }
}
