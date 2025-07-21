

import { createRenderer } from '../runtime-core'
function createElement (type) {
  
     return document.createElement(type)
}

function patchProp (el,key, value) {
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if( isOn(key) ) {
      // 具体 click
      // el.addEventListener("click", value);
      const even = key.slice(2).toLowerCase();
      el.addEventListener(even, value);
    }else{
      el.setAttribute(key, value);
    }
}

function insert (el, parent) {
    parent.appendChild(el);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core';