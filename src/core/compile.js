class Compile {
    constructor(el, vm) {
        this.$vm = vm;
        this.$val = vm._data;

        this.$el = this.isElementNode(el) ? el : document.querySelector(el);

        if(this.$el) {
            this.$fragment = this.nodeFragment(this.$el);
            this.compileElement(this.$fragment);
            this.$el.appendChild(this.$fragment)
        }
    }

    compileElement(el) {
        let self = this;
        let childNodes = el.childNodes;
        [].slice.call(childNodes).forEach(node => {
            let text = node.textContent;
            let reg = /\{\{((?:.|\n)+?)\}\}/;

            if(self.isElementNode(node)) {
                self.compile(node);
            }else if(self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, RegExp.$1);
            }

            if(node.childNodes && node.childNodes.length) {
                self.compileElement(node);
            }
        })
    }

    nodeFragment(el) {
        let fragment = document.createDocumentFragment();
        let child;
        while(child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    }

    compile(node) {
        let nodeAttrs = node.attributes;
        let self = this;
        [].slice.call(nodeAttrs).forEach(attr => {
            let attrName = attr.name;
            if(self.isDirective(attrName)) {
                let exp = attr.value;
                let dir = attrName.substring(2);

                if(self.isEventDirective(dir)) {
                    compileUtil.eventHandle(node, self.$vm, exp, dir);
                }else{
                    compileUtil[dir] && compileUtil[dir](node, self.$vm, exp);
                }

                node.removeAttribute(attrName);
            }
        })
    }

    compileText(node, exp) {
        node.textContent = typeof this.$val[exp] === 'undefined' ? "" : this.$val[exp];
    }

    isElementNode(node) {
        return node.nodeType === 1;
    }

    isTextNode(node) {
        return node.nodeType === 3;
    }

    isDirective(attr) {
        return attr.indexOf('x-') === 0;
    }

    isEventDirective(dir) {
        return dir.indexOf('on') === 0;
    }
}

let $elm;
let timer = null;

const compileUtil = {
    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },
    class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },
    model: function(node, vm, exp) {
        console.log(node, vm ,exp)
        this.bind(node, vm, exp, 'model');
        let self = this;
        let val = this._getVmVal(vm, exp);
        node.addEventListener('input', function(e) {
            let newVal = e.target.value;
            $elm = e.target;
            if(val === newVal) {
                return;
            }

            clearTimeout(timer);
            timer = setTimeout(function() {
                self._setVmVal(vm, exp, newVal);
                val = newVal;
            })
        })
    },
    bind: function(node, vm, exp, dir) {
        let updaterFn = updater[dir+'Updater'];

        updaterFn && updaterFn(node, this._getVmVal(vm, exp));
        console.log('new watcher', node , exp);
        new Watcher(vm ,exp, function(value, oldValue) {
            updaterFn && updaterFn(node, value, oldValue);
        })
    },

    eventHandle: function(node, vm ,exp, dir) {
        let eventType = dir.split(':')[1];
        let fn = vm.$options.methods && vm.$options.methods[exp];

        if(eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },
    _getVmVal: function(vm ,exp) {
        let val = vm;
        exp = exp.split(".");
        exp.forEach(key => {
            key = key.trim();
            val = val[key]
        })
        return val;
    },
    _setVmVal: function(vm ,exp, value) {
        let val = vm;
        exps = exp.split('.');

        exps.forEach((key, index) => {
            key = key.trim();
            if(index < exps.length - 1) {
                val = val[key];
            }else{
                val[key] = value;
            }
        })
    }
}

const updater = {
    htmlUpdater: function(node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value;
    },
    textUpdater: function(node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },
    classUpdater: function() {},
    modelUpdater: function(node, value, oldValue) {
        if($elm === node) {
            return false;
        }
        $elm = undefined;
        node.value = typeof value === 'undefined' ? '' : value;
    }
}
