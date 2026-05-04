// ==UserScript==
// @name         X.com / Twitter Declutter
// @namespace    http://tampermonkey.net/
// @version      5.4
// @description  Aggressively removes sidebars, ads, and places the feed in the absolute center of the screen.
// @author       You
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 1. INJECT CSS
    GM_addStyle(`
        /* Left Menu: Hide Post, More, and Premium */
        [data-testid="SideNav_NewTweet_Button"],
        [data-testid="AppTabBar_More_Menu"],
        a[href="/i/premium_sign_up"] {
            display: none !important;
        }

        /* Right Sidebar Modules */
        [data-testid="sidebarColumn"] [aria-label*="What's happening"],
        [data-testid="sidebarColumn"] [aria-label*="What’s happening"],
        [data-testid="sidebarColumn"] [aria-label*="Trending"],
        [data-testid="sidebarColumn"] [aria-label*="Who to follow"],
        [data-testid="sidebarColumn"] [aria-label*="Subscribe"],
        [data-testid="sidebarColumn"] [aria-label*="Relevant people"],
        [data-testid="sidebarColumn"] div:has(> [data-testid="placementTracking"]) {
            display: none !important;
        }

        /* Bottom Right Badges - Floating Wrappers */
        [data-testid="DMDrawer"],
        [data-testid="grokDrawer"],
        button[aria-label*="Grok"],
        a[href*="/i/grok"],
        [aria-label*="Grok"],
        div:has(> a[href*="/i/grok"]),
        div:has(> button[aria-label*="Grok"]) {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }

        /* Custom class used by our JS to safely hide items without fighting React */
        .decluttered-hide {
            display: none !important;
        }

        /* === TRUE FEED CENTERING (ABSOLUTE VIEWPORT CENTER) === */

        /* 1. Detach the Left Nav from the document flow and anchor it to the left edge */
        header[role="banner"] {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            height: 100vh !important;
            max-width: 275px !important;
            z-index: 10 !important;
        }

        /* 2. Expand the Main container to fill the entire screen viewport */
        main[role="main"] {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            display: flex !important;
            justify-content: center !important;
        }

        /* 3. Strip the Right Sidebar completely so it doesn't skew the center */
        [data-testid="sidebarColumn"] {
            display: none !important;
            width: 0 !important;
            min-width: 0 !important;
        }

        /* 4. Force the Feed wrapper to sit in the dead center */
        main[role="main"] > div {
            width: 600px !important;
            max-width: 600px !important;
            margin: 0 auto !important;
            padding: 0 !important;
        }

        [data-testid="primaryColumn"] {
            width: 100% !important;
            max-width: 600px !important;
            margin: 0 auto !important;
        }

        /* 5. Prevent the Left Nav from overlapping the feed on smaller screens */
        @media (max-width: 1200px) {
            header[role="banner"] {
                width: 88px !important;
                align-items: center !important;
            }
        }
    `);

    // 2. JS CLEANUP (Designed to keep X's scroll virtualizer happy)
    const hideDynamicElements = () => {

        // --- A. Filter Left Navigation Menu ---
        const navItems = document.querySelectorAll('nav[aria-label="Primary"] a');
        const allowedLinks = ['/home', '/explore', '/notifications', '/i/bookmarks'];

        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href) {
                const isAllowed = allowedLinks.some(allowed => href.includes(allowed));
                if (!isAllowed && !item.classList.contains('decluttered-hide')) {
                    item.classList.add('decluttered-hide');
                }
            }
        });

        // --- B. Clean Up the Right Sidebar (Deep Parent Removal Fallback) ---
        const rightColumn = document.querySelector('[data-testid="sidebarColumn"]');
        if (rightColumn) {
            const rightSideHeaders = rightColumn.querySelectorAll('h2, span');
            rightSideHeaders.forEach(element => {
                const text = element.textContent.trim().toLowerCase();

                if (text.includes("subscribe to premium") ||
                    text.includes("what’s happening") ||
                    text.includes("what's happening") ||
                    text.includes("trending") ||
                    text.includes("who to follow") ||
                    text.includes("relevant people")) {

                    let container = element;
                    for (let i = 0; i < 8; i++) {
                        if (container.parentElement && !container.parentElement.getAttribute('data-testid')?.includes('sidebarColumn')) {
                            container = container.parentElement;
                            if (container.tagName === 'ASIDE' || container.tagName === 'SECTION') break;
                        } else {
                            break;
                        }
                    }

                    if (container && !container.classList.contains('decluttered-hide')) {
                        container.classList.add('decluttered-hide');
                    }
                }
            });
        }

        // --- C. Remove Ads & In-Feed News (SAFE REMOVAL) ---
        const tweets = document.querySelectorAll('article[data-testid="tweet"]');
        const cellWrappers = document.querySelectorAll('[data-testid="cellInnerDiv"]');

        // 1. Hide Ads securely by hiding the article, NOT the cellInnerDiv wrapper
        tweets.forEach(tweet => {
            const spans = tweet.querySelectorAll('span');
            let isAd = false;
            for (let span of spans) {
                if (span.textContent === 'Ad') {
                    isAd = true;
                    break;
                }
            }
            if (isAd && !tweet.classList.contains('decluttered-hide')) {
                tweet.classList.add('decluttered-hide');
            }
        });

        // 2. Hide In-Feed News/Trending Carousels securely
        cellWrappers.forEach(cell => {
            const headers = cell.querySelectorAll('h2, span');
            let hideCell = false;
            headers.forEach(header => {
                const text = header.textContent.trim().toLowerCase();
                if (text.includes("today's news") ||
                    text.includes("explore") ||
                    text.includes("trending now")) {
                    hideCell = true;
                }
            });

            if (hideCell && cell.firstElementChild && !cell.firstElementChild.classList.contains('decluttered-hide')) {
                cell.firstElementChild.classList.add('decluttered-hide');
            }
        });
    };

    // 3. SAFE MUTATION OBSERVER
    let timeout;
    const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            observer.disconnect();
            hideDynamicElements();
            observer.observe(document.body, { childList: true, subtree: true });
        }, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
