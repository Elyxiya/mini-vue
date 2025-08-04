import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapFlags";
import { EMPTY_OBJ, isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppAPI } from "./createApp";
import { queueJobs } from "./scheduler";
import { Fragment, Text } from "./vnode";


export function createRenderer(options) {
   
 const { 
  createElement: hostCreateElement, 
  patchProp: hostPatchProp, 
  insert: hostInsert,
  remove: hostRemove,
  setElementText: hostSetElementText,

} = options;

 function render(vnode, container) { 
    patch(null, vnode, container, null, null)
  }


// n1 -> 旧节点
// n2 -> 新节点
function patch (n1,n2, container, parentComponent, anchor){
  //处理组件

  //ShapFlags
  // vnode -> flag
  const { type, shapeFlag } = n2;

  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      processFragment(n1, n2, container, parentComponent, anchor);
      break;
    case Text: 
      processText(n1, n2, container);
      break;
    default:
      // STATEFUL_COMPONENT -> 带状态的组件
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // element
        processElement(n1, n2, container, parentComponent, anchor);
      }
      else if ( shapeFlag & ShapeFlags.STATEFUL_COMPONENT ) {
        // component
        processComponent(n1, n2, container, parentComponent, anchor)
      }
      break;
  }
}

function processFragment(n1, n2: any, container: any, parentComponent, anchor): void {
   // Implement
   mountChildren(n2.children, container, parentComponent, anchor);
}

function processText(n1, n2: any, container: any) {
  const { children } = n2;
  const textNode = (n2.el = document.createTextNode(children));
  container.append(textNode);
}


function processElement(n1, n2: any, container: any, parentComponent, anchor) {
  if (!n1) {
    mountElement(n2, container, parentComponent, anchor);
  }else {
    patchElement(n1, n2, container, parentComponent, anchor);
  }  
}

function patchElement(n1, n2: any, container: any, parentComponent, anchor) { 
    console.log("patchElement");
    console.log("n1", n1)
    console.log("n2", n2)
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);

}
function patchChildren(n1, n2: any, container: any, parentComponent, anchor) { 
    const { shapeFlag } = n2;
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    
    if ( shapeFlag & ShapeFlags.TEXT_CHILDREN ) { 
      if( prevShapeFlag & ShapeFlags.ARRAY_CHILDREN ) {
        // 1. 把老的children清空
        unmountChildren(n1.children);
      }
      if( c1 !== c2) {
         // 2. 设置 text
         hostSetElementText(container, c2);
      }
    } else { 
      // new -> array
      if( prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      }else{
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }

}

function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) { 
  const l2 = c2.length;
  let i = 0;
  let e1 = c1.length - 1; 
  let e2 = l2 - 1;

  function isSameVNodeType(n1, n2) { 
    // type
    // key
    return n1.type === n2.type && n1.key === n2.key
  }
  // 1. 左侧
  while(i <= e1 && i <= e2) { 
    const n1 = c1[i];
    const n2 = c2[i];
    if(isSameVNodeType(n1, n2)) { 
      patch(n1, n2, container, parentComponent, parentAnchor )
    }else{
      break;
    }
    i++
  }
  console.log(i)
  // 2. 右侧
  while(i <= e1 && i <= e2) { 
    const n1 = c1[e1];
    const n2 = c2[e2];
    if(isSameVNodeType(n1, n2)) { 
      patch(n1, n2, container, parentComponent, parentAnchor)
    }else{
      break;
    }
    e1--
    e2--
  }
  // 3. 新的比老的长
  if(i > e1) { 
    if(i <= e2) { 
      
      const nextPos = e2 + 1;
      const anchor = nextPos < l2 ?  c2[nextPos].el : null;
      while(i <= e2) { 
        patch(null, c2[i], container, parentComponent, anchor)
        i++;
      } 
    }
    // 4. 新的比老的短
  } else if(i > e2) {
    while(i <= e1) { 
      hostRemove(c1[i].el)
      i++;
    }
  } else {
    // 5.中间对比
     let s1 = i;
     let s2 = i;

     const toBePatched = e2 - s2 + 1;
     let patched = 0;
     const keyToNewIndexMap = new Map();
     const newIndexToOldIndexMap = new Array(toBePatched)
     let moved = false;
     let maxNewIndexSoFar = 0;
     for(let i = 0;i < toBePatched;i++) {
      newIndexToOldIndexMap[i] = 0;
     }
     for(let i = s2; i <= e2; i++) { 
      const nextChild = c2[i];
      keyToNewIndexMap.set(nextChild.key, i)
     }

     for(let i = s1; i <= e1; i++) {
      const prevChild = c1[i];

      if(patched >= toBePatched) { 
        hostRemove(prevChild.el)
        continue;
      }
      
      let newIndex;
      if(prevChild.key != null) { 
      newIndex = keyToNewIndexMap.get(prevChild.key);
      } else{
        for(let j = s2; j <= e2; j++){
          if(isSameVNodeType(prevChild, c2[j])) { 
            newIndex = j;
            break;
          }
        }
      }
      if(newIndex === undefined) { 
        // 删除
        hostRemove(prevChild.el)
      } else { 
        if(newIndex >= maxNewIndexSoFar){
           maxNewIndexSoFar = newIndex;
        } else {
          moved = true;
        }
        newIndexToOldIndexMap[newIndex - s2] = i + 1;


        patch(prevChild, c2[newIndex], container, parentComponent, null)
        patched++;
      }
     }

     // 5.2 最长递增子序列 -> 移动
     const increasingNewIndexSequence = moved
     ? getSequence(newIndexToOldIndexMap)
     : [];
     let j = increasingNewIndexSequence.length - 1;
     for(let i = toBePatched - 1; i >= 0; i--) { 
      const nextIndex = i + s2;
      const nextChild = c2[nextIndex];
      const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
      
      if(newIndexToOldIndexMap[i] === 0) { 
        patch(null, nextChild, container, parentComponent, anchor);
      } else if(moved) { 
        if(j < 0 || i !== increasingNewIndexSequence[j]) {
         hostInsert(nextChild.el, container, anchor);
        } else {
          j--;
        }
      }
      if(moved) {
        if(j < 0 || i !== increasingNewIndexSequence[j]){
          console.log('移动位置')
          hostInsert(nextChild.el, container, anchor);
        }else {
          j--;
        }
      }
    }
  }

}


function unmountChildren(children) { 
  for(let i = 0; i < children.length; i++) { 
    const el = children[i].el;
    // remove
    hostRemove(el)
  }
}
function patchProps(el, oldProps, newProps) { 
  if(oldProps !== newProps) { 
    for(const key in newProps) { 
      const  prevProp = oldProps[key];
      const nextProp = newProps[key];

      if(prevProp !== nextProp) { 
       hostPatchProp(el, key, prevProp, nextProp)
      }
    }

    if(oldProps !== EMPTY_OBJ) { 
      // 3. key值不在新的props中 - 删除 
      for(const key in oldProps) { 
        if(!(key in newProps)) { 
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }

  }
}
function mountElement(vnode: any, container: any, parentComponent, anchor) {
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
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    //props
    const { props } = vnode;
    for (const key in props) {
      const value = props[key];
    
      hostPatchProp(el, key, null,value);
      
    }

    // canvs
    // el.x = 10
    // container.append(el);
    // addChild()
    hostInsert(el, container, anchor)
}

function mountChildren(children, container, parentComponent, anchor) {
  children.forEach(child => {
    patch(null, child, container, parentComponent, anchor);
  });
}

function processComponent(
  n1, 
  n2: any, 
  container: any, 
  parentComponent, 
  anchor) { 
  if(!n1) { 
    // mount
    mountComponent(n2,container, parentComponent, anchor)
    
  } else { 
    // update
    // n1 -> n2
    updateComponent(n1, n2)
  }

}
function updateComponent(n1, n2) { 
  // 更新组件实例引用
  const instance = (n2.component = n1.component);
  if(shouldUpdateComponent(n1, n2)){
   
    instance.next = n2;
    instance.update();
  } else {
    n2.component = n1.component
    n2.el = n1.el;
    instance.vnode = n2;
  }
}

function mountComponent(
  initialVnode: any,
  container: any, 
  parentComponent, 
  anchor
  ) { 
  // 创建组件实例
  const instance = initialVnode.component = createComponentInstance(initialVnode, parentComponent);

  setupComponent(instance);

  setupRenderEffect(instance, initialVnode, container, anchor);
}

function setupRenderEffect(instance:any,initialVnode,container: any, anchor) {
  // 依赖收集，更新节点树
  instance.update = effect(() => { 

    if(!instance.isMounted) { 
      console.log('init');
      const { proxy } = instance;
      // 生成vnode节点
      const subTree = (instance.subTree = instance.render.call(proxy, proxy));
      console.log(subTree)
      patch(null, subTree, container, instance, anchor);
       // element -> mount
      initialVnode.el = subTree.el;
      instance.isMounted = true;
    } else { 
      // 更新逻辑
      console.log('update');
      // 需要一个vnode
      const { next, vnode } = instance;
      if(next){
        next.el = vnode.el;

        updateComponentPreRender(instance, next);
      }

      const { proxy } = instance;
      // 生成vnode节点
      const subTree = instance.render.call(proxy, proxy);
      const prevSubTree = instance.subTree;
      instance.subTree = subTree;


      patch(prevSubTree, subTree, container, instance, anchor);
    }
  },
  {
    sheduler() {
      console.log('更新-scheduler');
      queueJobs(instance.update);
    }
  })
 
}

  return {
    createApp: createAppAPI(render)
  }
}

function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode;
  instance.next = null;
  instance.props = nextVNode.props;
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

