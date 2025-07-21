export const extend = Object.assign;
export const EMPTY_OBJ = {};

export function isObject(val) {
  return val !== null && typeof val === "object";
}

export function hasChanged(val, newValue) {
  return !Object.is(val, newValue);
}

export function hasOwn(val, key) {
  return Object.prototype.hasOwnProperty.call(val, key);
}

// add-foo -> addFoo 驼峰命名法
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
};
// add -> Add
const capitalize = (str: string) => {
return str.charAt(0).toUpperCase() + str.slice(1);
};
// Add -> onAdd
export const toHandlerKey = (str: string) => {
return str ? 'on' + capitalize(str) : '';
};