// ==UserScript==
// @name         VK Video Blur Remover (ULTIMATE v2)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Removes VK video blur & restriction via targeted webpack patch (silent & stable)
// @author       BrezzeLevsky
// @match        *://vk.com/*
// @match        *://*.vk.com/*
// @match        *://vkvideo.ru/*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/BrezzeLevsky/vk-video-enhancer/main/VK_Video_Blur_Remover.user.js
// @downloadURL  https://raw.githubusercontent.com/BrezzeLevsky/vk-video-enhancer/main/VK_Video_Blur_Remover.user.js
// ==/UserScript==

(function() {
    'use strict';

    const applyFixes = () => {
        // --- Метод 1: Принудительное переопределение стилей (самый надежный) ---
        document.querySelectorAll('[class*="vkitVideoCardPreviewImage__imgBlurred"]').forEach(el => {
            el.style.setProperty('filter', 'none', 'important');
            el.style.setProperty('transform', 'none', 'important');
        });
        document.querySelectorAll('[class*="vkitVideoCardRestrictionOverlay__--"], [class*="vkitOverlay__root--"]').forEach(el => {
            el.style.setProperty('display', 'none', 'important');
        });
        document.querySelectorAll('.videoplayer--blur .videoplayer_thumb').forEach(el => {
            el.style.setProperty('filter', 'none', 'important');
        });

        // --- Метод 2: Удаление классов ограничений ---
        const restrictionSelectors = [
            '.mv_recom_item.VideoRestriction', '.VideoRestriction', '.VideoRestriction--small',
            '.VideoRestriction--canPreview', '.VideoRestriction--blur',
            '[class*="videoplayer--hasRestriction"]', '[class*="videoplayer--blur"]'
        ];
        document.querySelectorAll(restrictionSelectors.join(', ')).forEach(el => {
            el.classList.remove(
                'VideoRestriction', 'VideoRestriction--small', 'VideoRestriction--canPreview',
                'VideoRestriction--blur', 'videoplayer--hasRestriction', 'videoplayer--blur'
            );
        });
    };

    const observer = new MutationObserver(applyFixes);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyFixes);
    } else {
        applyFixes();
    }
})();
