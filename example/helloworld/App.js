import { h } from "../../lib/guide-mini-vue.esm.js";
// import { Foo } from "./Foo.js";

export const App = {
  //.vue
  //<template>
  //render
  name:"App",
  render() {
    //ui
    return h('div', {
      id: "root",
      class: "red",
    }, [
      h("p", { class: "red" }, "hi"),
      h("p", { class: "blue" }, "mini-vue"),
    ]
 
    // this.$el -> get root element
    // setupState
    // "hi," + this.msg
    // srting
    //"hi,mini-vue" 
    // Array
    //[h('p', { class: "red" }, "hi"), h('p', { class: "blue" }, "mini-vue")]
    );
  },

  setup(){
    // composition api

    return {
      msg:"mini-vue",
    }
  }
}