
/**
 * 监听数组变化
 */

class MVVM {
    constructor(options) {
        this.$options = options || {};
        let data = this._data = this.$options.data;
        let self = this;

        Object.keys(data).forEach(key => {
            self._proxyData(key)
        })

        new Observe(data);
        new Compile(options.el || document.body, this);
    }

    _proxyData(key, setter, getter) {
        let self = this;
        setter = setter || Object.defineProperty(self, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return self._data[key];
            },
            set: function proxySetter(newVal) {
                self._data[key] = newVal;
            }
        })
    }
}
