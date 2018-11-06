import Watcher from "./watcher";

class Compile {
    constructor(el, vm) {
        this.$el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        this.parseNodes(this.$el);
    }

    parseNodes(outNode) {
        let childs = outNode.childNodes;
        // 循环每一个元素
        [].slice.call(childs).forEach(node => {
            console.log(node);
            let reg = /\{\{((?:.|\n)+?)\}\}/;
            if(this.isTextNode(node) && reg.test(node.textContent)) {
                // 如果是文本节点了，进行文本节点的操作
                console.log('text node', node)
                node.originText = node.textContent;
                this.createTextNode(node);
            }else if(this.isElementNode(node)) {
                console.log('element node', node)
                this.parseAttrs(node);
            }

            if(node && node.childNodes && node.childNodes.length > 0) {
                this.parseNodes(node);
            }
        })
    }

    createTextNode(node, exp) {
        // 纯文本替换
        let reg = /\{\{((?:.|\n)+?)\}\}/g;

        let text = node.textContent;
        let matches = text.match(reg);
        if(matches) {
            let otext = text;
            matches.forEach(c => {
                exp = c.replace(/[\{\}]/g, "");
                let rReg = new RegExp(c, "g");
                if(exp.indexOf(".") > -1) {
                    // 有.分隔符的
                    let vars = exp.split(".");
                    let val = this.vm.data;
                    vars.forEach(_var => {
                        val = val[_var];
                    });
                    otext = otext.replace(rReg, val);
                }else{
                    // 没有点号的时候直接完成替换
                    otext = otext.replace(rReg, this.vm.data[c.replace(/[\{\}]/g,"")]);
                }

                new Watcher(this.vm ,exp, (value, oldValue) =>{
                    this.updater(node, value, oldValue,exp, "text");
                })

                //this.bind(node, exp, "text");
            })
            node.textContent = otext;
        }else{
            node.textContent = "";
        }
        console.log(text.trim(), exp)
    }

    updater(node, value, oldValue, exp, ctype) {
        console.log('start to updater', arguments)
        if(ctype === "text") {
            let text = node.originText;
                let reg = /\{\{((?:.|\n)+?)\}\}/g;
                let matches = text.match(reg);
                if(matches) {
                    let otext = text;
                    matches.forEach(c => {
                        exp = c.replace(/[\{\}]/g, "");
                        let rReg = new RegExp(c, "g");
                        console.log(this.vm.data, c, exp);
                        if(exp.indexOf(".") > -1) {
                            // 有.分隔符的
                            let vars = exp.split(".");
                            let val = this.vm.data;
                            vars.forEach(_var => {
                                val = val[_var];
                            });
                            otext = otext.replace(rReg, val);
                        }else{
                            // 没有点号的时候直接完成替换
                            otext = otext.replace(rReg, this.vm.data[c.replace(/[\{\}]/g,"")]);
                        }
                    })
                    node.textContent = otext;
                }else{
                    node.textContent = "";
                }
        }
    }


    bind(node, exp, ctype) {
        if(ctype === "text") {
            // 自定义监听事件改变exp
            let text = node.textContent;
            this.vm.events[`change:${exp}`] = () => {
                let reg = /\{\{((?:.|\n)+?)\}\}/g;
                let matches = text.match(reg);
                if(matches) {
                    let otext = text;
                    matches.forEach(c => {
                        exp = c.replace(/[\{\}]/g, "");
                        let rReg = new RegExp(c, "g");
                        console.log(this.vm.data, c, exp);
                        if(exp.indexOf(".") > -1) {
                            // 有.分隔符的
                            let vars = exp.split(".");
                            let val = this.vm.data;
                            vars.forEach(_var => {
                                val = val[_var];
                            });
                            otext = otext.replace(rReg, val);
                        }else{
                            // 没有点号的时候直接完成替换
                            otext = otext.replace(rReg, this.vm.data[c.replace(/[\{\}]/g,"")]);
                        }
                    })
                    node.textContent = otext;
                }else{
                    node.textContent = "";
                }
            };
        }

    }

    parseAttrs(node) {
        let nodeAttrs = node.attributes;
        let self = this;
        [].slice.call(nodeAttrs).forEach(attr => {
            let attrName = attr.name;
            console.log(attrName)
            if(self.isEventDirective(attrName)) {
                let exp = attr.value;
                let dir = attrName.substring(7);
                console.log(exp, dir);

                let eventType = dir;
                let fn = self.vm.methods && self.vm.methods[exp];
                
                if(eventType && fn) {
                    node.addEventListener(eventType, fn.bind(self.vm), false);
                }

                node.removeAttribute(attrName);
                // if(self.isEventDirective(dir)) {
                //     compileUtil.eventHandle(node, self.$vm, exp, dir);
                // }else{
                //     compileUtil[dir] && compileUtil[dir](node, self.$vm, exp);
                // }
                //
                // node.removeAttribute(attrName);
            }
        })
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
        return dir.indexOf('vue:on:') === 0;
    }
}

export default Compile;
