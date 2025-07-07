import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandler";

//用枚举类 reactiveFlags 来表示
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}
export function reactive(raw) {
  return createActiveObject(raw,mutableHandlers);
  
  // return new Proxy(raw, {
    
  //   // get(target, key) {
  //   //     // {foo: 1}
  //   //     // foo
  //   //     const res = Reflect.get(target, key);

  //   //     // TODO 依赖收集
  //   //     track(target, key);
  //   //     return res;
  //   // },
  //   get: createGetter(),
  //   // set(target, key, value) {
  //   //   const res = Reflect.set(target, key, value);
      
  //   //   // TODO 触发更新
  //   //   trigger(target, key)
  //   //   return res;
  //   // },
  //   set: createSetter(),
  // });
}

export function readonly(raw){
  return createActiveObject(raw,readonlyHandlers);

  // return new Proxy(raw, { 
  //   // get(target, key) {
  //   //   const res = Reflect.get(target, key);

  //   //   return res;
  //   // },
  //   get: createGetter(true),
  //   set(target, key, value) {
  //     // console.warn(`key: ${key} set failed, because target is readonly`);
  //     return true;
  //   }
  // })
}

export function shallowReadonly(raw) {
  return createActiveObject(raw,shallowReadonlyHandlers); 
}
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}
function createActiveObject(raw:any, baseHandler) {
  return new Proxy(raw, baseHandler);
}