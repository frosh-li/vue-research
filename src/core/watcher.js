class Watcher{
    constructor(vm, expOrFn, cb) {
        this.vm = vm;
        this.expOrFn = expOrFn.trim();
        this.cb = cb;
        this.depIds = {};
        if(typeof expOrFn === 'function') {
            this.getter = expOrFn
        }else{
            this.getter = this.parseGetter(expOrFn)
        }
        this.value = this.get();
    }

    update() {
        this.run();
    }

    run() {
        let newVal = this.get();
        let oldVal = this.value;
        if(newVal === oldVal) {
            console.log('same value')
            return;
        }
        this.value = newVal;
        // 将newval, oldVal挂载到MVVM实例上
        this.cb.call(this.vm, newVal, oldVal);
    }

    get() {
        Dep.target = this; // 将当前订阅者指向自己
        let value = this.getter.call(this.vm, this.vm); // 将自身添加到dep中
        Dep.target = null;
        return value;
    }

    addDep(dep) {
        if(!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    }

    parseGetter(exp) {
        if(/[^\w.$]/.test(exp)) return;

        let exps = exp.split('.');

        return function(obj) {
            for(let i = 0 , len = exps.length ; i < len ; i++) {
                if(!obj) {
                    return;
                }
                obj = obj[exps[i]]
            }
            return obj;
        }
    }
}
