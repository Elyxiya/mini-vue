import { ShapeFlags } from "../shared/ShapFlags";
import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) { 
  //path

  
  patch(vnode, container)
}

function patch (vnode, container){
  //处理组件

  //ShapFlags
  // vnode -> flag
  const { shapeFlag } = vnode;
  // TODO 判断vnode 是不是一个element
  // 是 element 那么就处理element
  // 如何分辨 element 和 component
  
  // STATEFUL_COMPONENT -> 带状态的组件
  if (shapeFlag & ShapeFlags.ELEMENT) {
    // element
    processElement(vnode, container);
    return;
  }
  else if ( shapeFlag & ShapeFlags.STATEFUL_COMPONENT ) {
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
    // vnode -> element -> div
    const el = (vnode.el = document.createElement(vnode.type)) ;
   
    // string array
    const { children,shapeFlag } = vnode;

    if ( shapeFlag & ShapeFlags.TEXT_CHILDREN ) {
      // text_children
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
     // vnode
     // array_children
      mountChildren(vnode, el);
    }

    //props
    const { props } = vnode;
    for (const key in props) {
      const value = props[key];
      console.log(key);

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

function mountComponent(initialVnode: any,container: any) { 
  // 创建组件实例
  const instance = createComponentInstance(initialVnode);

  setupComponent(instance);

  setupRenderEffect(instance,initialVnode,container);
}

function setupRenderEffect(instance:any,initialVnode,container: any) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

   // vnode -> patch
   // vnode -> element -> mountElement

   patch(subTree, container);

   // element -> mount
   initialVnode.el = subTree.el;
}

