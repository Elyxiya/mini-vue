import { createVNode } from "./vnode";

// render
export function createAppAPI(render) {
   return function createApp(rootComponent) {
      return {
         mount(rootContainer) {
        // 1. 创建 vnode
        // component -> vnode
        // 所有逻辑操作 都会基于vnode 做处理
       const vnode = createVNode(rootComponent);

       render(vnode, rootContainer);
      },
      }
   }
}



