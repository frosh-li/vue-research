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
                this.bind(node, exp, "text");
            })
            node.textContent = otext;
        }else{
            node.textContent = "";
        }
        console.log(text.trim(), exp)
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
        // 属性节点的绑定
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

export default Compile;
