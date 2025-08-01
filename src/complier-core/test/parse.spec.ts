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
        children: []
      })
    })
  });
 // 解析text
 describe('text',() => { 
  it('simple text', () => { 
    const ast = baseParse("hello world");

    // root
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.TEXT,
      content: "hello world",
    })
  })
});

// 测试多个节点
test("hello world",() => {
  const ast = baseParse("<div>hi,{{message}}</div>");
  expect(ast.children[0]).toStrictEqual({
    type: NodeTypes.ElEMENT,
    tag: "div",
    children: [
      {
        type: NodeTypes.TEXT,
        content: "hi,",
      },
      {
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        }
      }
    ]
  })
})

test("nested element",() => { 
  const ast = baseParse("<div><p>hi</p>{{message}}</div>");
 
  expect(ast.children[0]).toStrictEqual({
    type: NodeTypes.ElEMENT,
    tag: "div",
    children: [
     {
      type: NodeTypes.ElEMENT,
      tag: "p",
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hi",
        }
      ],
     },
     {
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: "message",
      }
    }
    ]
  })
})

// 未闭合标签
test("should throw error when tag is not closed", () => {
  // baseParse("<div><span></div>");
  expect(() => {
    baseParse("<div><span></div>");
  }).toThrow(`span标签没有闭合`);

})
});