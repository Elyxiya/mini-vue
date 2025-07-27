import { NodeTypes } from '../src/ast';
import { baseParse } from '../src/parse'

describe('Parse', () => {
  // 解析插值
  describe('interpolation',() => {
    test('simple interpolation', () => {
      const ast = baseParse("{{ message }}");

      // root
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'message'
        }
      })
    })
  });
  // 解析element
  describe('element',() => { 
    it('simple element div', () => { 
      const ast = baseParse("<div></div>");

      // root
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ElEMENT,
        tag: "div",
      })
    })
  });
})