import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'containerDirective' && node.name === 'chat') {
        const messages = [];
        let currentMessage = null;

        for (const child of node.children) {
          // Handle blockquote nodes
          if (child.type === 'blockquote' && currentMessage) {
            const quoteText = child.children
              ?.flatMap(p => p.children || [])
              ?.filter(c => c.type === 'text')
              ?.map(c => c.value)
              ?.join('\n') || '';
            if (quoteText) {
              currentMessage.content.push({ type: 'quote', value: quoteText });
            }
            continue;
          }

          if (child.type === 'paragraph' && child.children?.length > 0) {
            const firstChild = child.children[0];
            
            // Check if this paragraph starts with a header [name|date|position]
            if (firstChild.type === 'text') {
              const text = firstChild.value;
              const headerMatch = text.match(/^\[([^\]|]+)\|([^\]|]+)(?:\|(\w+))?\]/);
              
              if (headerMatch) {
                if (currentMessage) {
                  messages.push(currentMessage);
                }
                
                const [fullMatch, name, date, position] = headerMatch;
                const remainingText = text.slice(fullMatch.length).trim();
                
                currentMessage = {
                  name,
                  date,
                  position: position || 'left',
                  content: []
                };
                
                if (remainingText) {
                  // Check if remaining text starts with > (inline quote)
                  if (remainingText.startsWith('> ')) {
                    currentMessage.content.push({ type: 'quote', value: remainingText.slice(2) });
                  } else {
                    currentMessage.content.push({ type: 'text', value: remainingText });
                  }
                }
                
                // Handle remaining children in the same paragraph
                for (let i = 1; i < child.children.length; i++) {
                  const c = child.children[i];
                  if (c.type === 'text' && c.value.trim()) {
                    currentMessage.content.push({ type: 'text', value: c.value.trim() });
                  }
                }
              } else if (currentMessage) {
                // Regular text line - check for > prefix
                const lines = text.split('\n');
                for (const line of lines) {
                  const trimmedLine = line.trim();
                  if (trimmedLine.startsWith('> ')) {
                    currentMessage.content.push({ type: 'quote', value: trimmedLine.slice(2) });
                  } else if (trimmedLine) {
                    currentMessage.content.push({ type: 'text', value: trimmedLine });
                  }
                }
              }
            }
          }
        }
        
        if (currentMessage) {
          messages.push(currentMessage);
        }

        // Merge consecutive quotes
        for (const msg of messages) {
          const mergedContent = [];
          for (const item of msg.content) {
            const last = mergedContent[mergedContent.length - 1];
            if (item.type === 'quote' && last?.type === 'quote') {
              last.value += '\n' + item.value;
            } else {
              mergedContent.push({ ...item });
            }
          }
          msg.content = mergedContent;
        }

        // Generate HTML
        const html = `<div class="chat-container">
${messages.map(msg => {
          const contentHtml = msg.content.map(c => {
            if (c.type === 'quote') {
              return `<blockquote>${escapeHtml(c.value)}</blockquote>`;
            }
            return `<p>${escapeHtml(c.value)}</p>`;
          }).join('\n        ');

          return `  <div class="chat-message chat-${msg.position}">
    <div class="chat-bubble">
      <div class="chat-header">
        <span class="chat-name">${escapeHtml(msg.name)}</span>
        <span class="chat-date">${escapeHtml(msg.date)}</span>
      </div>
      <div class="chat-content">
        ${contentHtml}
      </div>
    </div>
  </div>`;
        }).join('\n')}
</div>`;

        node.type = 'html';
        node.value = html;
        node.children = undefined;
      }
    });
  };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

export default remarkChat;