import Observe from "./observe";
import Compile from "./compile"
class Vue {
    constructor(options = {
        el,
        data,
        methods,
    }) {
        console.log(options);

        let {el ,data, methods} = options;
        this.data = data;
        this.el = el;
        this.methods = Object.create(methods||null);
        this.events = {};
        this.observe(this.data);

        new Compile(el || document.body, this);
    }

    observe(data) {
        new Observe(data, this);
    }
}

export default Vue;
