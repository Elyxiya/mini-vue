import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) { 
  //path

  
  patch(vnode, container)
}

function patch (vnode, container){
  //处理组件

  // TODO 判断vnode 是不是一个element
  // 是 element 那么就处理element
  // 如何分辨 element 和 component
  
  console.log(vnode.type)
  if (typeof vnode.type === 'string') {
    // element
    processElement(vnode, container);
    return;
  }
  else if (isObject(vnode.type)) {
    // component
    processComponent(vnode, container)
    return;
  }

  ;
}



function processElement(vnode: any, container: any) {
    mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
    const el = document.createElement(vnode.type);
   
    // string array
    const { children } = vnode;

    if (typeof children === 'string') {
      el.textContent = children;
    } else if (Array.isArray(children)) {
     // vnode
      mountChildren(vnode, el);
    }

    //props
    const { props } = vnode;
    for (const key in props) {
      const value = props[key];
      el.setAttribute(key, value);
    }
     container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach(child => {
    patch(child, container);
  });
}

function processComponent(vnode: any, container: any) { 
  mountComponent(vnode,container)
}

function mountComponent(vnode: any,container: any) { 
  // 创建组件实例
  const instance = createComponentInstance(vnode);

  setupComponent(instance);

  setupRenderEffect(instance,container);
}

function setupRenderEffect(instance:any, container: any) {
   const subTree = instance.render();

   // vnode -> patch
   // vnode -> element -> mountElement

   patch(subTree, container);
}

