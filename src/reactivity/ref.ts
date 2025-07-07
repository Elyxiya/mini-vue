import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl { 
     private _value: any;
     private _rawValue: any;
     public dep;
     constructor(value) { 
      this._rawValue = value;
       this._value = convert(value);
      // value -> reactive
      // 1. 看看value 是不是对象

       this.dep = new Set();
     }
     get value() { 
       trackRefValue(this) 
       return this._value
     }
     set value(newValue) { 
      // 一定先去修改 value 值

      // hasChanged
      // 判断新值和旧值是否相同
      if(hasChanged(newValue, this._rawValue)) {
        this._rawValue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.dep);
      }
     }
}


function convert(value) {
   return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
  if(isTracking()){
    trackEffects(ref.dep)
  }
}

export function ref (value) {
    return new RefImpl(value);
}