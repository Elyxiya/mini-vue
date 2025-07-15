import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) { 
  //path
  patch(vnode, container)
}

function patch (vnode, container){
  //处理组件

  // 判断 是不是 element类型
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
