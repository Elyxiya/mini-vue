// 新的是 array
// 旧的是 text
import { h, ref } from '../../lib/guide-mini-vue.esm.js'
const nextChilren = [ 
  h("div", {}, "A"),
  h("div", {}, "B"),
];
const prevChilren = "oldChildren";

export default {
  name: "ArrayToText",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange,
    };
  },
  render() {
    const self = this;
    return self.isChange === true
      ? h("div", {}, nextChilren)
      : h("div", {}, prevChilren);
  },
}