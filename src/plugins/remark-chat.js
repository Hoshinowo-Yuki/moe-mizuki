import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'containerDirective' && node.name === 'chat') {
        const messages = [];
        let currentMessage = null;

        for (const child of node.children) {
          if (child.type === 'blockquote' && currentMessage) {
            const blockText = extractText(child);
            console.log('BLOCKQUOTE TEXT:', JSON.stringify(blockText));
            const lines = blockText.split('\n');
            console.log('BLOCKQUOTE LINES:', lines);
            if (lines.length > 0) {
              currentMessage.quote = lines[0];
              if (lines.length > 1) {
                currentMessage.content.push(...lines.slice(1).filter(l => l.trim()));
              }
            }
            continue;
          }

          if (child.type === 'paragraph') {
            const text = extractText(child);
            if (!text) continue;

            const lines = text.split('\n');
            const firstLine = lines[0];
            const headerMatch = firstLine.match(/^\[([^\]|]+)\|([^\]|]+)(?:\|(\w+))?\]$/);

            if (headerMatch) {
              if (currentMessage) {
                messages.push(currentMessage);
              }

              const [, name, date, position] = headerMatch;

              currentMessage = {
                name,
                date,
                position: position || 'left',
                quote: null,
                content: []
              };

              if (lines.length > 1) {
                currentMessage.content.push(...lines.slice(1).filter(l => l.trim()));
              }
            } else if (currentMessage) {
              currentMessage.content.push(...lines.filter(l => l.trim()));
            }
          }
        }

        if (currentMessage) {
          messages.push(currentMessage);
        }

        console.log('FINAL MESSAGES:', JSON.stringify(messages, null, 2));

        const html = `<div class="chat-container">
${messages.map(msg => {
  let contentHtml = '';
  if (msg.quote) {
    contentHtml += `<blockquote>${escapeHtml(msg.quote)}</blockquote>\n        `;
  }
  if (msg.content.length > 0) {
    contentHtml += msg.content.map(c => `<p>${escapeHtml(c)}</p>`).join('\n        ');
  }
  return `  <div class="chat-message chat-${msg.position}">
    <div class="chat-bubble">
      <div class="chat-header">
        <span class="chat-name">${escapeHtml(msg.name)}</span>
        <span class="chat-date">${escapeHtml(msg.date)}</span>
      </div>
      <div class="chat-content">
        ${contentHtml || ''}
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
    return node.children.map(extractText).join('');
  }
  return '';
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default remarkChat;