import { proxyRefs } from "../reactivity";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";



export function createComponentInstance(vnode, parent) {
  
  const component = {
    vnode,
    type: vnode.type,
    next: null,
    setupState: {},
    proxy: {},
    slots: {},
    provides: parent? parent.provides: {},
    parent,
    isMounted: false,
    subTree: {},
    emit: () => {},
  };

  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance) { 
  //initProps
  initProps(instance, instance.vnode.props);
  //initSlots
  initSlots(instance, instance.vnode.children);

  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
   const Component = instance.type;

    // ctx
    instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandlers);

   const { setup } = Component;
   if (setup) {

    setCurrentInstance(instance);
     // function Object
     // 用shallowReadonly包装props 避免用户修改props
     const setupResult = setup(shallowReadonly(instance.props),{
       emit: instance.emit
     });
     setCurrentInstance(null);
     handleSetupResult(instance, setupResult);
   }
}
function handleSetupResult(instance: any, setupResult: any) {
  // function Object
  // TODO function
  if (typeof setupResult === 'object') {
    instance.setupState = proxyRefs(setupResult);
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  
  instance.render = Component.render;
}

let currentInstance = null;
export function getCurrentInstance() {
  return currentInstance;
}

export function setCurrentInstance(instance) { 
  currentInstance = instance;
}