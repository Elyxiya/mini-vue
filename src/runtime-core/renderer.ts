import { ShapeFlags } from "../shared/ShapFlags";
import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";


export function createRenderer(options) {
   
 const { 
  createElement: hostCreateElement, 
  patchProp: hostPatchProp, 
  insert: hostInsert 
} = options;

 function render(vnode, container) { 
    patch(vnode, container,null)
  }



function patch (vnode, container, parentComponent){
  //处理组件

  //ShapFlags
  // vnode -> flag
  const { type, shapeFlag } = vnode;

  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text: 
      processText(vnode, container);
      break;
    default:
      // STATEFUL_COMPONENT -> 带状态的组件
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // element
        processElement(vnode, container, parentComponent);
      }
      else if ( shapeFlag & ShapeFlags.STATEFUL_COMPONENT ) {
        // component
        processComponent(vnode, container, parentComponent)
      }
      break;
  }
}

function processFragment(vnode: any, container: any, parentComponent) {
   // Implement
   mountChildren(vnode, container, parentComponent);
}

function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}


function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent);
}

function mountElement(vnode: any, container: any, parentComponent) {
  //canvs

  
  // vnode -> element -> div
    const el = (vnode.el =  hostCreateElement(vnode.type)) ;
   
    // string array
    const { children,shapeFlag } = vnode;

    if ( shapeFlag & ShapeFlags.TEXT_CHILDREN ) {
      // text_children
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
     // vnode
     // array_children
      mountChildren(vnode, el, parentComponent);
    }

    //props
    const { props } = vnode;
    for (const key in props) {
      const value = props[key];
    
      hostPatchProp(el, key, value);
      
    }

    // canvs
    // el.x = 10
    // container.append(el);
    // addChild()
    hostInsert(el, container)
}

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(child => {
    patch(child, container, parentComponent);
  });
}

function processComponent(vnode: any, container: any, parentComponent) { 
  mountComponent(vnode,container, parentComponent)
}

function mountComponent(initialVnode: any,container: any, parentComponent) { 
  // 创建组件实例
  const instance = createComponentInstance(initialVnode, parentComponent);

  setupComponent(instance);

  setupRenderEffect(instance,initialVnode,container);
}

function setupRenderEffect(instance:any,initialVnode,container: any) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

   // vnode -> patch
   // vnode -> element -> mountElement

   patch(subTree, container, instance);

   // element -> mount
   initialVnode.el = subTree.el;
}

  return {
    createApp: createAppAPI(render)
  }
}

