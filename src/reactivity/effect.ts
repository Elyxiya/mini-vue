import { extend } from "../shared";

class ReactiveEffect {
   private _fn: any;
   deps = [];
   active = true;
   onStop?: () => void;
   constructor(fn, public scheduler?) {
      this._fn = fn;
   }
   run() {
     activeEffect = this;
     return this._fn();
   }
   stop() {
    /* 使用active判断是否删除过该依赖*/
    if(this.active){
      cleanupEffect(this);
      if(this.onStop){
        this.onStop();
      }
      this.active = false;
    }
   }
}

/**
 * 清理effect的依赖关系
 * @param effect 需要清理的effect对象
 */
function cleanupEffect(effect){
  // 遍历effect的依赖集合，从每个依赖中删除该effect
  effect.deps.forEach((dep: any) =>{
    dep.delete(effect);
  })
}

const targetMap = new Map();
export function track(target, key) {
    // target -> key -> dep 
    let depsMap = targetMap.get(target);
    if(!depsMap) {
      depsMap = new Map();
      targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if(!dep) {
      dep = new Set();
      depsMap.set(key,dep);
    }
    //没有activeEffect的时候，不收集依赖，防止报错
    if(!activeEffect) return;
    dep.add(activeEffect);
    //反向收集依赖
    activeEffect.deps.push(dep);
}

export function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);

    for (const effect of dep) {
      if(effect.scheduler) {
        effect.scheduler();
      }
      else {
        effect.run();
      }
      
    }
}

let activeEffect;
export function effect(fn, options: any = {}) {
   //  fn
   const _effect = new ReactiveEffect(fn, options.scheduler);
   //options
   //_effect.onStop = options.onStop;
   Object.assign(_effect, options);
   // extend
   extend(_effect, options); 
   _effect.run();

   const runner: any = _effect.run.bind(_effect);
   runner.effect = _effect;
   return runner;
}

export function stop(runner) {
   runner.effect.stop();
}