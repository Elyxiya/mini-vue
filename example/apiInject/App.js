// 组件 provide 和 inject 功能
import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js';

const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(ProviderTwo)]);
  }
};

const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    provide("foo", "fooTwo");
    const foo = inject("foo");
    return { foo };
  },
  render() {
    return h('div', {}, [h('p', {}, `ProviderTwo foo:${this.foo}`), h(Consumer)]);
  }
};

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    // 带值
    const baz = inject("baz", "bazDefault");
    // 函数形式
    const bazFn = inject("bazFn", () => "bazFnDefault");

    return {
      foo,
      bar,
      baz,
      bazFn
    };
  },
  render() {
    // 直接使用返回的变量，而不是 this
    return h('div', {},  `Consumer: - ${this.foo} - ${this.bar} - ${this.baz} - ${this.bazFn}`);
  }
};

export default {
  name: "App",
  setup() {},
  render() {
    return h('div', {}, [h("p", {}, "apiInject"), h(Provider)]);
  }
};