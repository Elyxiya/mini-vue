import { NodeTypes } from "./ast";


const enum TagType {
  Start,
  End,
}
export function baseParse (content: string) {
   const context = createParserContext(content);

   return createRoot( parseChildren(context))
}

function parseChildren(context) {
  const nodes: any = [];
  let node;
  const s = context.source;
  // 插值
  if(s.startsWith("{{")) {
     node = parseInterpolation(context);

  } 
  // 元素
  else if(s[0] === "<") {
    if(/[a-z]/i.test(s[1])){
      node = parseElement(context);
    }
  }
  // 文本
  if(!node) {
    node = parseText(context);
  }
 
  
  nodes.push(node);
  
   return nodes;
};

function parseText(context: any) { 
  // 1. 获取内容
  const content = parseTextData(context, context.source.length);

  // 2. 删除处理完成的代码
  advanceBy(context, context.length);

   return {
     type: NodeTypes.TEXT,
     content,
   }
}

function parseTextData(context: any, length) { 
  const content = context.source.slice(0, length)
  
  advanceBy(context,length);
  return content;
}

function parseElement(context: any) { 
   const element = parseTag(context, TagType.Start);

   parseTag(context, TagType.End)

   return element;
}
function parseTag(context: any, type: TagType) { 
   // 1. 解析tag
   const match: any = /<\/?([a-z]*)/i.exec(context.source);
   const  tag = match[1];
   // 2. 删除处理完成的代码
   advanceBy(context, match[0].length);
   advanceBy(context, 1);

   if(type === TagType.End) return;
   return {
     type: NodeTypes.ElEMENT,
     tag,
   }
}

function parseInterpolation(context: any) {
    // {{message}}
    const openDelimiter = '{{';
    const closeDelimiter = '}}';

    const closeIndex = context.source.indexOf(
      closeDelimiter, 
      openDelimiter.length
    );

    advanceBy(context, openDelimiter.length);

    const rawContentLength = closeIndex - openDelimiter.length;

    const rawContent = parseTextData(context, rawContentLength);
    const content = rawContent.trim();

    advanceBy(context, closeDelimiter.length)


    return  {
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: content,
      }
     }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}


function createRoot(children) {
  return {
    children,
  }
};

function createParserContext(content: string) {
  return { 
    source: content,
  };
};
