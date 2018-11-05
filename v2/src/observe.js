import {isArray, getMethods} from "./util";
import Dep from "./dep.js";

class Observe {
    constructor(data, vm) {
        this.vm = vm;
        return this.observe(data);
    }

    observe(data) {
        let keys = Object.keys(data);
        keys.forEach(key => {
            if(data.hasOwnProperty(key)) {
                if(isArray(data[key])) {
                    // 监听数组
                    this.observeArray(key, data[key]);
                } else {
                    this.walk(data, key, data[key]);
                }
            }

        })
    }

    observeArray(key, data) {
        Object.setPrototypeOf(data, getMethods(key, this.vm));
    }


    /**
     * walk - 监听正常对象
     *
     * @param  {type} data description
     * @return {type}      description
     */
    walk(data, key, val) {

        let property = Object.getOwnPropertyDescriptor(data, key);
        console.log(property);
        if (property && property.configurable === false) {
            return
        }

        console.log('defineProperty', data, key, val, typeof val)

        Object.defineProperty(data, key, {
            emumerable: true, //可以枚举
            configurable: true, //可以重新定义
            get: () => {
                console.log(`${key}获取成功`)
                return val;
            },
            set: (newVal) => {
                if(val === newVal || (newVal !== newVal && val !== val)) {
                    return;
                }
                console.log(`${key}被设置成${newVal}`);

                val = newVal;
                (this.vm.events[`change:${key}`] && this.vm.events[`change:${key}`](newVal));
                return newVal;
            }
        })

        if(typeof val === 'object'){
            this.observe(val);
        }

    }

}

export default Observe;
