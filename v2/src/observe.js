import {isArray, getMethods} from "./util";
import Dep from "./dep";

class Observe {
    constructor(data, vm) {
        this.vm = vm;
        return this.observe(data);
    }

    observe(data) {
        let keys = Object.keys(data);
        keys.forEach(key => {
            if(data.hasOwnProperty(key)) {
                this.walk(data, key, data[key]);
            }
        })
    }

    observeArray(data, key, val, dep) {
        Object.setPrototypeOf(val, getMethods(key, this.vm, dep));
    }

    /**
     * walk - 监听正常对象
     *
     * @param  {type} data description
     * @return {type}      description
     */
    walk(data, key, val) {
        let property = Object.getOwnPropertyDescriptor(data, key);
        if (property && property.configurable === false) {
            return
        }
        let dep = new Dep();
        console.log('defineProperty', key);
        Object.defineProperty(data, key, {
            emumerable: true, //可以枚举
            configurable: true, //可以重新定义
            get: () => {
                var value = this.getter ? this.getter.call(data) : val;
                console.log(`${key}获取成功`)
                console.log("dep target", Dep.target);
                if(Dep.target) {
                    dep.depend();
                }
                return value;
            },
            set: (newVal) => {
                if(val === newVal || (newVal !== newVal && val !== val)) {
                    return;
                }
                console.log(`${key}被设置成${newVal}`);
                val = newVal;
                dep.notify();
                return newVal;
            }
        })

        if(isArray(val)) {
            this.observeArray(data, key, val, dep);
        }else if (typeof val === 'object') {
            this.observe(val);
        }

    }

}

export default Observe;
