import { track, trigger } from "./effect";

export function reactive(raw) {
    

  return new Proxy(raw, {
    
    get(target, key) {
        // {foo: 1}
        // foo
        const res = Reflect.get(target, key);

        // TODO 依赖收集
        track(target, key);
        return res;
    },

    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      
      // TODO 触发更新
      trigger(target, key)
      return res;
    },
  });
}