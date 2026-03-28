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

(function () {
    'use strict';

    /* =========================
       🔍 TARGET DETECTION
    ========================= */

    function isTargetModule(exports) {
        try {
            if (!exports) return false;

            const values = Object.values(exports);

            return values.some(fn =>
                typeof fn === 'function' &&
                (
                    fn.toString().includes('blur') ||
                    fn.toString().includes('restriction') ||
                    fn.toString().includes('ageRestriction')
                )
            );
        } catch {
            return false;
        }
    }

    /* =========================
       🔥 PATCH LOGIC
    ========================= */

    function patchProps(props) {
        if (!props || typeof props !== 'object') return;

        if ('blurred' in props) props.blurred = false;
        if ('isBlurred' in props) props.isBlurred = false;

        if ('restriction' in props) props.restriction = null;
        if ('isRestricted' in props) props.isRestricted = false;
        if ('ageRestriction' in props) props.ageRestriction = 0;

        if (props.image && typeof props.image === 'object') {
            if ('blur' in props.image) props.image.blur = false;
        }
    }

    function wrapComponent(Component) {
        if (!Component || Component.__vkPatched) return Component;

        const Wrapped = new Proxy(Component, {
            apply(target, thisArg, args) {
                try {
                    patchProps(args[0]);
                } catch {}

                return Reflect.apply(target, thisArg, args);
            }
        });

        Wrapped.__vkPatched = true;
        return Wrapped;
    }

    function tryPatch(exports) {
        if (!exports) return;

        try {
            if (typeof exports === 'function') {
                return wrapComponent(exports);
            }

            if (exports.default && typeof exports.default === 'function') {
                exports.default = wrapComponent(exports.default);
            }

            for (const key in exports) {
                const val = exports[key];

                if (typeof val === 'function') {
                    exports[key] = wrapComponent(val);
                }
            }
        } catch {}
    }

    /* =========================
       🔥 WEBPACK HOOK
    ========================= */

    const origPush = Array.prototype.push;

    window.webpackChunkvk = window.webpackChunkvk || [];

    window.webpackChunkvk.push = function (...args) {
        const result = origPush.apply(this, args);

        try {
            const modules = args?.[0]?.[1];
            if (!modules) return result;

            for (const key in modules) {
                const original = modules[key];

                modules[key] = function (module, exports, require) {
                    original(module, exports, require);

                    if (isTargetModule(module.exports)) {
                        tryPatch(module.exports);
                    }
                };
            }

        } catch {}

        return result;
    };

    /* =========================
       🔥 REQUIRE HOOK
    ========================= */

    const hookRequire = () => {
        if (typeof window.__webpack_require__ !== 'function') return;

        const origRequire = window.__webpack_require__;

        window.__webpack_require__ = function (...args) {
            const res = origRequire.apply(this, args);

            try {
                if (isTargetModule(res)) {
                    return tryPatch(res) || res;
                }
            } catch {}

            return res;
        };
    };

    setTimeout(hookRequire, 0);

    /* =========================
       🔥 CSS FALLBACK
    ========================= */

    const style = document.createElement('style');
    style.textContent = `
        [data-testid="video_card_resctriction_overlay"] {
            display: none !important;
        }

        img[class*="Blur"],
        img[class*="blur"] {
            filter: none !important;
            -webkit-filter: none !important;
        }
    `;
    document.documentElement.appendChild(style);

})();
