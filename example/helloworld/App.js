import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {

  //.vue
  //<template>
  //render
  render() {
    //ui
    return h('div', {
      id: "app",
      class: ["red", "hard"],
    },
    // srting
    //"hi,mini-vue" 
    // Array
    [h('p', { class: "red" }, "hi"), h('p', { class: "blue" }, "mini-vue")]
    );
  },

  setup(){
    // composition api

    return {
      msg:"mini-vue",
    }
  }
}