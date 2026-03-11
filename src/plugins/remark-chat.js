import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      if (node.name !== 'chat') return;

      const messages = [];
      let currentMessage = null;

      for (const child of node.children) {
        if (child.type === 'paragraph' && child.children) {
          for (const inline of child.children) {
            if (inline.type === 'text') {
              const lines = inline.value.split('\n');
              
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                
                // Check if it's a header line [name|time|position]
                const headerMatch = trimmed.match(/^\[([^\]]+)\](.*)$/);
                
                if (headerMatch) {
                  // Save previous message
                  if (currentMessage) {
                    messages.push(currentMessage);
                  }
                  
                  const headerParts = headerMatch[1].split('|').map(s => s.trim());
                  
                  currentMessage = {
                    name: headerParts[0] || 'Anonymous',
                    datetime: headerParts[1] || '',
                    position: (headerParts[2] || 'left').toLowerCase() === 'right' ? 'right' : 'left',
                    lines: []
                  };
                  
                  // Content after header on same line
                  const afterHeader = headerMatch[2].trim();
                  if (afterHeader) {
                    currentMessage.lines.push(afterHeader);
                  }
                } else if (currentMessage) {
                  // Regular content line
                  currentMessage.lines.push(trimmed);
                }
              }
            }
          }
        }
      }
      
      // Don't forget last message
      if (currentMessage) {
        messages.push(currentMessage);
      }

      node.type = 'html';
      node.value = generateChatHtml(messages);
      node.children = [];
    });
  };
}

function generateChatHtml(messages) {
  if (messages.length === 0) return '';
  
  return messages.map(msg => {
    const positionClass = msg.position === 'right' ? 'right' : 'left';
    
    const contentHtml = msg.lines.map(line => {
      // Check for quote (> at start)
      if (line.startsWith('>') || line.startsWith('＞')) {
        const quoteText = line.replace(/^[>＞]\s*/, '');
        return `<div class="etag-chat-quote">${escapeHtml(quoteText)}</div>`;
      }
      return `<p>${escapeHtml(line)}</p>`;
    }).join('');

    return `<div class="etag-chat ${positionClass}">
  <div class="etag-chat-content">
    <div class="etag-chat-author">${escapeHtml(msg.name)}${msg.datetime ? `<span class="etag-chat-time">${escapeHtml(msg.datetime)}</span>` : ''}</div>
    <div class="etag-chat-message">${contentHtml}</div>
  </div>
</div>`;
  }).join('\n');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default remarkChat;