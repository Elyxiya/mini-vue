
const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};

export const publicInstanceProxyHandlers = {
  get({_: instance}, key) {
    // 从 setState获取值
    const { setupState } = instance;
   if (setupState && key in setupState) {
      return setupState[key];
    }
    
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
    // $data
    // setup -> option data
  },
}