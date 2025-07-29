import { NodeTypes } from "./ast";


const enum TagType {
  Start,
  End,
}
export function baseParse (content: string) {
   const context = createParserContext(content);

   return createRoot( parseChildren(context, []))
}

function parseChildren(context, ancestors) {

  const nodes: any = [];
  while(!isEnd(context, ancestors)) {
    
  let node;
  const s = context.source;
  // 插值
  if(s.startsWith("{{")) {
     node = parseInterpolation(context);

  } 
  // 元素
  else if(s[0] === "<") {
    if(/[a-z]/i.test(s[1])){
      node = parseElement(context, ancestors);
    }
  }
  // 文本
  if(!node) {
    node = parseText(context);
  }
 
  
  nodes.push(node);
  }
  
  
   return nodes;
};

function isEnd(context: any, ancestors) {
  // 1. 找到结束的标签
  const s = context.source;
  // </div>
  if(s.startsWith("</")) {
    for(let i = ancestors.length - 1; i >= 0 ;i--) {
      const tag = ancestors[i].tag;
      if(startsWithEndTagOpen(s, tag)) {
        return true;
      }
    }
  }
  
  // if(parentTag && s.startsWith(`</${parentTag}>`)) {
  //   return true;
  // }
  // // 2. source有值
  return !s;
}
function parseText(context: any) { 

  let endIndex = context.source.length;
  let endToken = ["<","{{"];
  for(let i = 0; i < endToken.length; i++) {
    const index = context.source.indexOf(endToken[i]);
    if(index !== -1 && index < endIndex) {
      endIndex = index;
    }
  }
  const index = context.source.indexOf(endToken);
  if(index !== -1) {
    endIndex = index;
  }

  // 1. 获取内容
  const content = parseTextData(context, endIndex);

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

function parseElement(context: any, ancestors) { 
   const element: any = parseTag(context, TagType.Start);
   ancestors.push(element);
   element.children = parseChildren(context, ancestors); 
   ancestors.pop();

   if(startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
   }else {
    throw new Error( `${element.tag}标签没有闭合`)
   }
 

   return element;
}

function startsWithEndTagOpen (source, tag) {
   return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
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
