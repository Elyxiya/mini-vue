import { getCurrentInstance } from "./component";



export function provide(key,value) { 
   // 存
   // key value
   const currentInstance: any = getCurrentInstance();

   if(currentInstance) {
     let {provides} = currentInstance;
     const parentProvides = currentInstance.parent.provides;
     
     // 原型链，
     // 父(foo:1)-子(foo:2)-孙 
     //让子可以访问到父的provide而不被覆盖，孙可以访问子的provide
     //init 初始化 只执行一次
     if(provides === parentProvides) { 
       provides = currentInstance.provides = Object.create(parentProvides);
     }
     provides[key] = value;
   }

}

export function inject(key, defaultValue) { 
   // 取
   const currentInstance: any = getCurrentInstance();
   if(currentInstance) { 
      
     const parentProvides = currentInstance.parent.provides;
  
     if(key in parentProvides) { 
       return parentProvides[key];
     } else if(defaultValue){ 
       if(typeof defaultValue === 'function') { 
         return defaultValue();
       } else { 
         return defaultValue;
       }
     }
  }   

}