// 新的是 text
// 旧的是 text
import { ref, h } from "../../lib/guide-mini-vue.esm.js";

const prevChilren = "oldChild";
const nextChilren = "newChild";

export default {
  name: "TextToText",
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