import { visit } from 'unist-util-visit';

import { visit } from 'unist-util-visit';



export function remarkChat() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'containerDirective' && node.name === 'chat') {
        const messages = [];
        let currentMessage = null;

        for (const child of node.children) {
          // Handle blockquote - attach to current message
          if (child.type === 'blockquote' && currentMessage) {
            const quoteText = extractText(child);
            if (quoteText) {
              currentMessage.content.unshift({ type: 'quote', value: quoteText });
            }
            continue;
          }

          // Handle paragraph
          if (child.type === 'paragraph') {
            const text = extractText(child);
            if (!text) continue;

            const headerMatch = text.match(/^\[([^\]|]+)\|([^\]|]+)(?:\|(\w+))?\]/);
            
            if (headerMatch) {
              // Save previous message
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
                currentMessage.content.push({ type: 'text', value: remainingText });
              }
            } else if (currentMessage) {
              // Regular content line
              currentMessage.content.push({ type: 'text', value: text });
            }
          }
        }
        
        if (currentMessage) {
          messages.push(currentMessage);
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
        ${contentHtml || '<p></p>'}
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

function extractText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.children) {
    return node.children.map(extractText).join('').trim();
  }
  return '';
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