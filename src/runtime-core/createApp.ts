import { render } from "./render";
import { createVNode } from "./vnode";
export function createApp(rootComponent) {
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

