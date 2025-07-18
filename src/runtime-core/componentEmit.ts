import { camelize, toHandlerKey } from "../shared/index";



export function emit(instance, event, ...args) { 
   console.log("emit",event);
   
   // instance.props -> event
   const { props } = instance;

   // TPP
   // 1. 先去写一个特定的行为
   // 2. 再去重构成一个通用的行为
 
    //  const handler = props['onAdd'];
    //  handler && handler();

 

   const hamdlerName = toHandlerKey(camelize(event));
   const handler = props[hamdlerName];
   handler && handler(...args);
}