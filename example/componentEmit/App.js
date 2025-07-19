import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name:"App",
  render() {
    //ui
    return h('div', {},
    [
      h("div", {}, "hi," + this.msg), 
      h(Foo,{
        // on + Event
        onAdd(a,b) {
          console.log('Onadd',a,b);
        },
        // add-foo -> addFoo
        onAddFoo(a,b) {
          console.log('OnaddFoo',a,b);
        }
      })

    ]
  
    );
  },

  setup(){
    // composition api

    return {
      msg:"mini-vue",
    }
  }
}