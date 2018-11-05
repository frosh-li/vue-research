let depuid = 0;

class Dep {
    constructor() {
        this.id = depuid++;
        // 存在watchers
        this.subs = [];
    }

    addSub(sub) {
        this.subs.push(sub);
    }

    removeSub(sub) {
        let index = this.subs.indexOf(sub);

        if(index !== -1) {
            this.subs.splice(index, 1);
        }
    }

    notify() {
        this.subs.forEach(sub => {
            console.log(sub)
            sub.update();
        })
    }

    depend() {
        Dep.target.addDep(this);
    }
}

Dep.target = null;
