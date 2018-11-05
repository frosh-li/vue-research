import Observe from "./observe";
import Compile from "./compile"
class Vue {
    constructor(options = {
        el,
        data,
    }) {
        console.log(options);

        let {el ,data} = options;
        this.data = data;
        this.el = el;
        this.events = {};
        this.observe(this.data);

        new Compile(el || document.body, this);
    }

    observe(data) {
        new Observe(data, this);
    }
}

export default Vue;
