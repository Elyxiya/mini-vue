import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";
window.self = null;
export const App = {

  //.vue
  //<template>
  //render
  name:"App",
  render() {
    window.self = this;
    //ui
    return h('div', {
      id: "root",
      class: ["red", "hard"],
      onClick() {
        console.log("click");
      },
      onMousedown() { 
        console.log("mousedown");
      },

    },
    [
      h("div", {}, "hi," + this.msg), 
      h(Foo,{
        count: 1,
      })

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