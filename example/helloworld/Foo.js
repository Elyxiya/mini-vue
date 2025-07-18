import { h } from "../../lib/guide-mini-vue.esm.js";
export const Foo = {
  
  setup(props){
    // props.count
    console.log(props)
    // props 不可修改
    props.count++
  },
  render() { 
    return h('div', {}, 'foo：'+ this.count);
  }
}