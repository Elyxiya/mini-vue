import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";



export function createComponentInstance(vnode) {

  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
  };
  return component;
}

export function setupComponent(instance) { 
  //initProps
  initProps(instance, instance.vnode.props);
  //initSlots

  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
   const Component = instance.type;

    // ctx
    instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandlers);

   const { setup } = Component;
   if (setup) {
     // function Object
     // 用shallowReadonly包装props 避免用户修改props
     const setupResult = setup(shallowReadonly(instance.props));
     
     handleSetupResult(instance, setupResult);
   }
}
function handleSetupResult(instance: any, setupResult: any) {
  // function Object
  // TODO function
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
   const Component = instance.type;
   
   
     instance.render = Component.render;
   
}

