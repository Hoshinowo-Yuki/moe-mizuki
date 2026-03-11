import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

export function remarkChat() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'containerDirective' && node.name === 'chat') {
        console.log('Processing chat directive');
        console.log('Node children:', JSON.stringify(node.children, null, 2));
        
        // 獲取角色名稱
        const speaker = node.attributes?.speaker || 'user';
        
        // 設定節點類型和屬性
        const data = node.data || (node.data = {});
        data.hName = 'div';
        data.hProperties = {
          className: ['chat-message', `chat-${speaker}`],
          'data-speaker': speaker
        };
      }
    });
  };
}

export default remarkChat;