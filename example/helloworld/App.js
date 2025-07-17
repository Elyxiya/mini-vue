import { h } from "../../lib/guide-mini-vue.esm.js";

window.self = null;
export const App = {

  //.vue
  //<template>
  //render
  render() {
    window.self = this;
    //ui
    return h('div', {
      id: "root",
      class: ["red", "hard"],
    },
    // this.$el -> get root element
    // setupState
    "hi," + this.msg
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