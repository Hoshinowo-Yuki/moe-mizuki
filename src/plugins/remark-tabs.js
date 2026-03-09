import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

// Generate unique ID for each tab group
let tabGroupCounter = 0;

export function remarkTabs() {
  return (tree) => {
    tabGroupCounter = 0;
    
    visit(tree, 'containerDirective', (node) => {
      if (node.name !== 'tabs') return;

      const tabGroupId = `tab-group-${tabGroupCounter++}`;
      const tabs = [];
      const tabContents = [];

      // Collect all tabs
      let currentTab = null;
      let currentContent = [];

      for (const child of node.children) {
        if (child.type === 'leafDirective' && child.name === 'tab') {
          // Save previous tab if exists
          if (currentTab !== null) {
            tabs.push(currentTab);
            tabContents.push(currentContent);
          }
          // Start new tab
          currentTab = child.children?.[0]?.value || 
                       child.children?.map(c => c.value || c.children?.map(cc => cc.value).join('')).join('') ||
                       'Tab';
          currentContent = [];
        } else if (currentTab !== null) {
          currentContent.push(child);
        }
      }

      // Don't forget the last tab
      if (currentTab !== null) {
        tabs.push(currentTab);
        tabContents.push(currentContent);
      }

      // Build the HTML structure
      const data = node.data || (node.data = {});
      
      data.hName = 'div';
      data.hProperties = { class: 'tabs-container' };

      // Create tab buttons
      const tabButtons = tabs.map((title, index) => ({
        type: 'html',
        value: `<input type="radio" name="${tabGroupId}" id="${tabGroupId}-${index}" class="tab-radio" ${index === 0 ? 'checked' : ''}/><label for="${tabGroupId}-${index}" class="tab-button">${title}</label>`
      }));

      // Create tab content panels
      const tabPanels = tabContents.map((content, index) => ({
        type: 'container',
        data: {
          hName: 'div',
          hProperties: { 
            class: `tab-content ${index === 0 ? 'tab-content-active' : ''}`,
            'data-tab-index': index
          }
        },
        children: content
      }));

      // Assemble the structure
      node.children = [
        {
          type: 'container',
          data: {
            hName: 'div',
            hProperties: { class: 'tabs-header' }
          },
          children: tabButtons
        },
        {
          type: 'container',
          data: {
            hName: 'div',
            hProperties: { class: 'tabs-body' }
          },
          children: tabPanels
        }
      ];
    });
  };
}

export default remarkTabs;