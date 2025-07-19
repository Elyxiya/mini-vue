import { createVNode } from "../vnode";



export function renderSlots(slots, name, props) { 
 
  const slot = slots[name];
  if(slot) {
    // function -> 作用域插槽
    if(typeof slot === 'function') {
      return createVNode('div',{},slot(props));
    }
   
  }
 
}