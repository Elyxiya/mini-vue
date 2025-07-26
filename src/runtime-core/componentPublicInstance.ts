import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  // $slots
  $slots: (i) => i.slots,
  $props: (i) => i.props,
};

export const publicInstanceProxyHandlers = {
  get({_: instance}, key) {
    // 从 setState获取值
    const { setupState,props } = instance;
   if (setupState && key in setupState) {
      return setupState[key];
    }
    // 完成从props获取值 this.count
   
    if( hasOwn(setupState, key)) {
       return setupState[key];
    }else if(hasOwn(props, key)){
      return props[key];
    }

    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
    // $data
    // setup -> option data
  },
}