/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Creates a Chat component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created Chat component.
 */
export function rehypeChat(properties, children) {
  if (!Array.isArray(children) || children.length === 0) {
    return h("div", { class: "hidden" }, "Invalid chat directive. (No content provided)");
  }

  // 從 children 提取文字內容，保留結構
  const extractContent = (nodes) => {
    const result = [];
    for (const node of nodes) {
      if (node.type === 'text') {
        result.push({ type: 'text', value: node.value });
      } else if (node.tagName === 'p') {
        const texts = [];
        for (const child of node.children || []) {
          if (child.type === 'text') {
            texts.push(child.value);
          }
        }
        result.push({ type: 'paragraph', value: texts.join('') });
      } else if (node.tagName === 'blockquote') {
        const texts = [];
        const extractBlockquote = (n) => {
          for (const child of n.children || []) {
            if (child.type === 'text') {
              texts.push(child.value);
            } else if (child.children) {
              extractBlockquote(child);
            }
          }
        };
        extractBlockquote(node);
        result.push({ type: 'blockquote', value: texts.join('\n') });
      }
    }
    return result;
  };

  const content = extractContent(children);
  const messages = [];
  let currentMessage = null;

  for (const item of content) {
    if (item.type === 'paragraph') {
      const text = item.value.trim();
      
      // 嘗試匹配消息頭 [名字|時間] 或 [名字|時間|right]
      const headerMatch = text.match(/^\[([^\]]+)\]\s*(.*)$/);
      
      if (headerMatch) {
        // 保存之前的消息
        if (currentMessage) {
          messages.push(currentMessage);
        }
        
        const meta = headerMatch[1];
        const restContent = headerMatch[2]?.trim() || '';
        const parts = meta.split('|').map(p => p.trim());
        
        const name = parts[0] || 'Unknown';
        const time = parts[1] || '';
        const isRight = parts.includes('right');
        
        currentMessage = {
          name,
          time,
          isRight,
          content: [],
          quotes: []
        };
        
        if (restContent) {
          currentMessage.content.push(restContent);
        }
      } else if (currentMessage && text) {
        // 添加到當前消息內容
        currentMessage.content.push(text);
      }
    } else if (item.type === 'blockquote' && currentMessage) {
      currentMessage.quotes.push(item.value.trim());
    }
  }
  
  // 保存最後一條消息
  if (currentMessage) {
    messages.push(currentMessage);
  }

  if (messages.length === 0) {
    return h("div", { class: "hidden" }, "Invalid chat directive. (No valid messages found)");
  }

  // 構建 HTML
  const messageElements = messages.map(msg => {
    const alignment = msg.isRight ? 'chat-right' : 'chat-left';
    
    const contentChildren = [];
    
    // 添加引用
    for (const quote of msg.quotes) {
      contentChildren.push(
        h('blockquote', {}, quote)
      );
    }
    
    // 添加內容
    for (const text of msg.content) {
      contentChildren.push(
        h('p', {}, text)
      );
    }
    
    return h('div', { class: `chat-message ${alignment}` }, [
      h('div', { class: 'chat-bubble' }, [
        h('div', { class: 'chat-header' }, [
          h('span', { class: 'chat-name' }, msg.name),
          h('span', { class: 'chat-date' }, msg.time)
        ]),
        h('div', { class: 'chat-content' }, contentChildren)
      ])
    ]);
  });

  return h('div', { class: 'chat-container' }, messageElements);
}
