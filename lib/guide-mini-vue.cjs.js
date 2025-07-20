'use strict';

const extend = Object.assign;
function isObject(val) {
    return val !== null && typeof val === "object";
}
function hasOwn(val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
}
// add-foo -> addFoo 驼峰命名法
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
// add -> Add
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// Add -> onAdd
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

//初始化生成并缓存，减少重复调用
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        console.log(key);
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 检查res 是不是 object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key: ${key} set 失败，因为 target 是 readonly`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
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
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
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
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, baseHandler) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} is not an object`);
        return raw;
    }
    return new Proxy(raw, baseHandler);
}

function emit(instance, event, ...args) {
    console.log("emit", event);
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

// 从setup中获取的props
function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // attrs
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    // $slots
    $slots: (i) => i.slots,
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 从 setState获取值
        const { setupState, props } = instance;
        if (setupState && key in setupState) {
            return setupState[key];
        }
        // 完成从props获取值 this.count
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
        // $data
        // setup -> option data
    },
};

function initSlots(instance, children) {
    // slots
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    console.log('createComponentInstance', parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        proxy: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    //initProps
    initProps(instance, instance.vnode.props);
    //initSlots
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        // function Object
        // 用shallowReadonly包装props 避免用户修改props
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    // children
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 组件 + children object
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function render(vnode, container) {
    //path
    patch(vnode, container);
}
function patch(vnode, container, parentComponent) {
    //处理组件
    //ShapFlags
    // vnode -> flag
    const { type, shapeFlag } = vnode;
    // TODO 判断vnode 是不是一个element
    // 是 element 那么就处理element
    // 如何分辨 element 和 component
    // Fragment -> 只渲染 children
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            // STATEFUL_COMPONENT -> 带状态的组件
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                // element
                processElement(vnode, container, parentComponent);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                // component
                processComponent(vnode, container, parentComponent);
            }
            break;
    }
}
function processFragment(vnode, container, parentComponent) {
    // Implement
    mountChildren(vnode, container, parentComponent);
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}
function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
}
function mountElement(vnode, container, parentComponent) {
    // vnode -> element -> div
    const el = (vnode.el = document.createElement(vnode.type));
    // string array
    const { children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        // text_children
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        // vnode
        // array_children
        mountChildren(vnode, el, parentComponent);
    }
    //props
    const { props } = vnode;
    for (const key in props) {
        const value = props[key];
        console.log(key);
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            // 具体 click
            // el.addEventListener("click", value);
            const even = key.slice(2).toLowerCase();
            el.addEventListener(even, value);
        }
        else {
            el.setAttribute(key, value);
        }
    }
    container.append(el);
}
function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(child => {
        patch(child, container, parentComponent);
    });
}
function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
function mountComponent(initialVnode, container, parentComponent) {
    // 创建组件实例
    const instance = createComponentInstance(initialVnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container, instance);
    // element -> mount
    initialVnode.el = subTree.el;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 1. 创建 vnode
            // component -> vnode
            // 所有逻辑操作 都会基于vnode 做处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        // function -> 作用域插槽
        if (typeof slot === 'function') {
            // children 是不可以有array
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    // 存
    // key value
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        // 原型链，
        // 父(foo:1)-子(foo:2)-孙 
        //让子可以访问到父的provide而不被覆盖，孙可以访问子的provide
        //init 初始化 只执行一次
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            else {
                return defaultValue;
            }
        }
    }
}

exports.createApp = createApp;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
