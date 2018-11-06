import Vue from "./vue.js";

window.vue = new Vue({
    el: "#app",
    data: {
        a: 1,
        b: 2,
        data: {
            c: 1,
            d: 2,
        },
        name: "frosh lee",
        count:111,
        list: [1,2,3,4]
    },
    methods: {
        changeName: function() {
            console.log('测试方法绑定解析');
            this.data.name = "changed name" + Math.floor(Math.random()*100)
        }
    }
})
