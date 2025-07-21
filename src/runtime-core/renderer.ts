import { effect } from "../reactivity/effect";
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
    patch(null, vnode, container,null)
  }


// n1 -> 旧节点
// n2 -> 新节点
function patch (n1,n2, container, parentComponent){
  //处理组件

  //ShapFlags
  // vnode -> flag
  const { type, shapeFlag } = n2;

  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      processFragment(n1, n2, container, parentComponent);
      break;
    case Text: 
      processText(n1, n2, container);
      break;
    default:
      // STATEFUL_COMPONENT -> 带状态的组件
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // element
        processElement(n1, n2, container, parentComponent);
      }
      else if ( shapeFlag & ShapeFlags.STATEFUL_COMPONENT ) {
        // component
        processComponent(n1, n2, container, parentComponent)
      }
      break;
  }
}

function processFragment(n1, n2: any, container: any, parentComponent): void {
   // Implement
   mountChildren(n2, container, parentComponent);
}

function processText(n1, n2: any, container: any) {
  const { children } = n2;
  const textNode = (n2.el = document.createTextNode(children));
  container.append(textNode);
}


function processElement(n1, n2: any, container: any, parentComponent) {
  if (!n1) {
    mountElement(n2, container, parentComponent);
  }else {
    patchElement(n1, n2, container, parentComponent);
  }  
}

function patchElement(n1, n2: any, container: any, parentComponent) { 
    console.log("patchElement");
    console.log(n1, n2);
    
    // props
    // children


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
    patch(null, child, container, parentComponent);
  });
}

function processComponent(n1, n2: any, container: any, parentComponent) { 
  mountComponent(n2,container, parentComponent)
}

function mountComponent(initialVnode: any,container: any, parentComponent) { 
  // 创建组件实例
  const instance = createComponentInstance(initialVnode, parentComponent);

  setupComponent(instance);

  setupRenderEffect(instance,initialVnode,container);
}

function setupRenderEffect(instance:any,initialVnode,container: any) {
  // 依赖收集，更新节点树
  effect(() => { 

    if(!instance.isMounted) { 
      console.log('init');
      const { proxy } = instance;
      // 生成vnode节点
      const subTree = (instance.subTree = instance.render.call(proxy));
      console.log(subTree)
      patch(null, subTree, container, instance);
       // element -> mount
      initialVnode.el = subTree.el;
      instance.isMounted = true;
    } else { 
      // 更新逻辑
      console.log('update');
      const { proxy } = instance;
      // 生成vnode节点
      const subTree = instance.render.call(proxy);
      const prevSubTree = instance.subTree;
      instance.subTree = subTree;


      patch(prevSubTree, subTree, container, instance);
    }
  })
 
}

  return {
    createApp: createAppAPI(render)
  }
}

