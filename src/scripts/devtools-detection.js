// src/scripts/devtools-detect.js
// DevTools detection and warning banner - with i18n support

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";

const config = {
    linkHref: '/license',
    bannerStyle: {
        background: 'linear-gradient(90deg,#2a1a1a,#3d2a2a)',
        color: '#d4a0a0',
        linkColor: '#7eb8da'
    }
};

function initDevToolsDetection() {
    window.addEventListener('devtoolschange', function(event) {
        if (event.detail.isOpen && !document.getElementById('dev-banner')) {
            const banner = document.createElement('div');
            banner.id = 'dev-banner';
            banner.innerHTML = `${i18n(I18nKey.devtoolsMessage)} <a href="${config.linkHref}">${i18n(I18nKey.devtoolsLinkText)}</a>`;
            banner.style.cssText = `position:fixed;top:0;left:0;width:100%;background:${config.bannerStyle.background};color:${config.bannerStyle.color};padding:10px;text-align:center;z-index:99999;font-size:14px;`;
            
            const link = banner.querySelector('a');
            if (link) {
                link.style.cssText = `color:${config.bannerStyle.linkColor};margin-left:20px;text-decoration:none;`;
            }
            
            document.body.prepend(banner);
        }
    });
}

function loadDevToolsDetect() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/devtools-detect@4.0.0/index.min.js';
    script.onload = initDevToolsDetection;
    script.onerror = function() {
        console.warn('Failed to load devtools-detect library');
    };
    document.head.appendChild(script);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDevToolsDetect);
} else {
    loadDevToolsDetect();
}
