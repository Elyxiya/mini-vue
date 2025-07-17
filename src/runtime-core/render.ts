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
  // processElement(vnode, container);
  console.log(vnode.type)

  processComponent(vnode, container);
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
