
 // ==UserScript==
 // @name         X / Twitter Declutter V7
 // @namespace    https://tampermonkey.net/
 // @version      7.0.0
 // @description  Fast, centered, minimal X interface.
 // @match        https://x.com/*
 // @match        https://twitter.com/*
 // @run-at       document-start
 // @grant        none
 // ==/UserScript==

 (() => {
     'use strict';

     const CONFIG = {
         feedWidth: 600,
         hideAds: true,
         hideSuggestions: true,
         hideRightSidebar: true,
         hideGrok: true,
         hideChat: true
     };

     const root = document.documentElement;
     root.classList.add('xdc');

     const css = `
         html.xdc {
             --xdc-width: ${CONFIG.feedWidth}px;
         }

         /* NAVIGATION */

         html.xdc header[role="banner"] nav a[href]:not(:is(
             [href$="/home"],
             [href$="/explore"],
             [href$="/notifications"],
             [href*="/notifications/"],
             [href$="/i/bookmarks"],
             [href$="/bookmarks"]
         )),
         html.xdc nav a[class*="sidebar-item"]:not(:is(
             [href$="/home"],
             [href$="/explore"],
             [href$="/notifications"],
             [href*="/notifications/"],
             [href$="/i/bookmarks"],
             [href$="/bookmarks"]
         )) {
             display: none !important;
         }

         html.xdc [data-testid="SideNav_NewTweet_Button"],
         html.xdc [data-testid="AppTabBar_More_Menu"],
         html.xdc #sidebar-compose-post,
         html.xdc a[href$="/i/premium_sign_up"],
         html.xdc a[href$="/i/grok"] {
             display: none !important;
         }

         /* RIGHT SIDEBAR — BOTH INTERFACES */

         ${CONFIG.hideRightSidebar ? `
         html.xdc [data-testid="sidebarColumn"],
         html.xdc main ~ aside,
         html.xdc [data-xdc-content] > aside {
             display: none !important;
         }
         ` : ''}

         /* FLOATING CHAT AND GROK */

         ${CONFIG.hideChat ? `
         html.xdc div[data-slot="xds-dock-window"]:has(
             [data-icon="icon-chat"]
         ),
         html.xdc [data-testid="DMDrawer"],
         html.xdc [data-testid="chat-drawer-root"],
         html.xdc [data-testid="chat-button"] {
             display: none !important;
         }
         ` : ''}

         ${CONFIG.hideGrok ? `
         html.xdc div[data-slot="xds-dock-window"]:has(
             [data-icon="icon-logo-grok"]
         ),
         html.xdc [data-testid="grokDrawer"],
         html.xdc [data-testid="GrokDrawer"],
         html.xdc button[aria-label="Ask Grok"] {
             display: none !important;
         }
         ` : ''}

         /* REMOVE OUTER VERTICAL BORDERS */

         html.xdc [data-testid="primaryColumn"],
         html.xdc [data-testid="primaryColumn"] > div,
         html.xdc [data-xdc-content],
         html.xdc [data-xdc-main],
         html.xdc [data-xdc-main] > div,
         html.xdc [data-xdc-main] > div > div {
             border-left: 0 !important;
             border-right: 0 !important;
             border-inline: 0 !important;
             outline: none !important;
             box-shadow: none !important;
         }

         /* NEW X: FULL-WIDTH ROOT, CENTERED MAIN */

         @media (min-width: 960px) {
             html.xdc:not(.xdc-special) [data-xdc-root] {
                 width: 100% !important;
                 max-width: 100% !important;
                 margin-inline: 0 !important;
             }

             html.xdc:not(.xdc-special) [data-xdc-left] {
                 position: fixed !important;
                 top: 0 !important;
                 left: 0 !important;
                 z-index: 20 !important;
             }

             html.xdc:not(.xdc-special) [data-xdc-content] {
                 display: flex !important;
                 justify-content: center !important;
                 flex: 1 1 auto !important;
                 width: 100% !important;
                 max-width: none !important;
                 min-width: 0 !important;
                 grid-template-columns: minmax(0, 1fr) !important;
             }

             html.xdc:not(.xdc-special) [data-xdc-main] {
                 flex: 0 1 var(--xdc-width) !important;
                 width: min(100%, var(--xdc-width)) !important;
                 max-width: var(--xdc-width) !important;
                 min-width: 0 !important;
                 margin-inline: auto !important;
                 --x-timeline-max-width: var(--xdc-width);
             }

             /* OLD X: CENTER WITHOUT JS POSITIONING */

             html.xdc:not(.xdc-special)
             div:has(> header[role="banner"]) {
                 width: 100% !important;
                 max-width: none !important;
                 justify-content: center !important;
             }

             html.xdc:not(.xdc-special) header[role="banner"] {
                 position: fixed !important;
                 top: 0 !important;
                 left: 0 !important;
                 z-index: 20 !important;
             }

             html.xdc:not(.xdc-special)
             main[role="main"]:has([data-testid="primaryColumn"]) {
                 flex: 1 1 auto !important;
                 width: 100% !important;
                 max-width: none !important;
                 min-width: 0 !important;
                 margin: 0 !important;
             }

             html.xdc:not(.xdc-special)
             main[role="main"]:has([data-testid="primaryColumn"]) > div,
             html.xdc:not(.xdc-special)
             main[role="main"]:has([data-testid="primaryColumn"]) > div > div {
                 width: 100% !important;
                 max-width: none !important;
                 justify-content: center !important;
             }

             html.xdc:not(.xdc-special)
             [data-testid="primaryColumn"] {
                 flex: 0 1 var(--xdc-width) !important;
                 width: min(100%, var(--xdc-width)) !important;
                 max-width: var(--xdc-width) !important;
                 min-width: 0 !important;
                 margin-inline: auto !important;
             }
         }

         /* MOBILE: DO NOT OVERRIDE X'S NATIVE POSITIONING */

         @media (max-width: 959px) {
             html.xdc [data-testid="primaryColumn"],
             html.xdc [data-xdc-main] {
                 max-width: 100% !important;
             }
         }

         /* VIRTUALIZED TIMELINE CELLS */

         html.xdc li[data-xdc-ad],
         html.xdc li[data-xdc-suggestion] {
             height: 1px !important;
             min-height: 0 !important;
             max-height: 1px !important;
             overflow: hidden !important;
             visibility: hidden !important;
             pointer-events: none !important;
             padding: 0 !important;
             margin: 0 !important;
             border: 0 !important;
         }

         html.xdc [data-testid="cellInnerDiv"][data-xdc-ad],
         html.xdc [data-testid="cellInnerDiv"][data-xdc-suggestion] {
             height: 1px !important;
             min-height: 0 !important;
             overflow: hidden !important;
             visibility: hidden !important;
         }

         html.xdc article[data-xdc-ad] {
             display: none !important;
         }
     `;

     const style = document.createElement('style');
     style.id = 'xdc-v7-style';
     style.textContent = css;
     root.appendChild(style);

     /*
      * Layout detection.
      *
      * The new X UI has a root containing the left rail and
      * a content area with <main> and <aside>.
      *
      * Mark those structural elements once; CSS handles everything.
      */

     function markLayout() {
         const compose = document.getElementById(
             'sidebar-compose-post'
         );

         if (!compose) return;

         const left = compose.closest('.hidden');
         if (!left) return;

         const layoutRoot = left.parentElement;
         if (!layoutRoot) return;

         const content = Array.from(layoutRoot.children).find(
             child => child !== left && child.querySelector('main')
         );

         if (!content) return;

         const main = Array.from(content.children).find(
             child => child.tagName === 'MAIN'
         );

         if (!main) return;

         if (!layoutRoot.hasAttribute('data-xdc-root')) {
             layoutRoot.setAttribute('data-xdc-root', '');
         }

         if (!left.hasAttribute('data-xdc-left')) {
             left.setAttribute('data-xdc-left', '');
         }

         if (!content.hasAttribute('data-xdc-content')) {
             content.setAttribute('data-xdc-content', '');
         }

         if (!main.hasAttribute('data-xdc-main')) {
             main.setAttribute('data-xdc-main', '');
         }
     }

     /*
      * Leave settings, messages and compose pages alone.
      */

     let currentPath = '';

     function updateRoute() {
         if (location.pathname === currentPath) return;

         currentPath = location.pathname;

         root.classList.toggle(
             'xdc-special',
             /^\/(settings|messages|compose)(\/|$)/.test(currentPath) ||
             /^\/i\/(chat|grok)(\/|$)/.test(currentPath)
         );
     }

     /*
      * Ads: check explicit promotional labels only.
      * Do not use placementTracking — it is not ad-specific.
      */

     const AD_LABEL = /^(ad|promoted|sponsored|advertentie|gesponsord)$/i;

     function isAd(article) {
         if (article.querySelector(
             'a[href*="how-twitter-ads-work"]'
         )) return true;

         for (const label of article.querySelectorAll('span, a')) {
             if (label.children.length) continue;
             if (!AD_LABEL.test(label.textContent.trim())) continue;

             if (label.closest(
                 '[data-testid="tweetText"], ' +
                 '.whitespace-pre-wrap, ' +
                 '[data-slot="embedded-tweet-frame"]'
             )) continue;

             if (label.closest('article') !== article) continue;

             return true;
         }

         return false;
     }

     function checkArticle(article) {
         if (!CONFIG.hideAds) return;

         // Do not process embedded/quoted posts independently.
         if (article.parentElement?.closest('article')) return;

         if (!isAd(article)) return;

         const cell = article.closest(
             'li[data-index], [data-testid="cellInnerDiv"]'
         );

         if (cell) {
             if (!cell.hasAttribute('data-xdc-ad')) {
                 cell.setAttribute('data-xdc-ad', '');
             }
         } else {
             article.setAttribute('data-xdc-ad', '');
         }
     }

     /*
      * In-feed suggestion cards.
      */

     const SUGGESTION =
         /^(who to follow|you might like|today.s news|trending now|topics to follow|wie te volgen)$/i;

     function checkSuggestion(cell) {
         if (!CONFIG.hideSuggestions) return;
         if (cell.querySelector('article')) return;

         const heading = cell.querySelector(
             'h2, h3, [role="heading"]'
         );

         if (!heading) return;
         if (!SUGGESTION.test(heading.textContent.trim())) return;

         cell.setAttribute('data-xdc-suggestion', '');
     }

     /*
      * Incremental observation.
      *
      * Instead of scanning the entire page after every mutation,
      * process only inserted DOM subtrees and their containing post.
      */

     const pending = new Set();
     let queued = false;

     function collect(node, articles, cells) {
         if (node.nodeType !== 1) return;

         if (node.matches('article')) articles.add(node);

         const parentArticle = node.closest('article');
         if (parentArticle) articles.add(parentArticle);

         node.querySelectorAll('article').forEach(
             article => articles.add(article)
         );

         const cellSelector =
             'li[data-index], [data-testid="cellInnerDiv"]';

         if (node.matches(cellSelector)) cells.add(node);

         const parentCell = node.closest(cellSelector);
         if (parentCell) cells.add(parentCell);

         node.querySelectorAll(cellSelector).forEach(
             cell => cells.add(cell)
         );
     }

     function flush() {
         queued = false;

         updateRoute();
         markLayout();

         if (pending.size === 0) return;

         const articles = new Set();
         const cells = new Set();

         for (const node of pending) {
             if (node.isConnected) {
                 collect(node, articles, cells);
             }
         }

         pending.clear();

         for (const article of articles) {
             checkArticle(article);
         }

         for (const cell of cells) {
             checkSuggestion(cell);
         }
     }

     function schedule() {
         if (queued) return;

         queued = true;
         queueMicrotask(flush);
     }

     function start() {
         updateRoute();
         markLayout();

         // One initial pass. Subsequent scans are incremental.
         pending.add(document.body);
         flush();

         const observer = new MutationObserver(records => {
             for (const record of records) {
                 for (const node of record.addedNodes) {
                     if (node.nodeType === 1) {
                         pending.add(node);
                     }
                 }
             }

             if (pending.size) schedule();
         });

         observer.observe(document.body, {
             childList: true,
             subtree: true
         });

         window.addEventListener('popstate', schedule);
         window.addEventListener('pageshow', schedule);
     }

     if (document.body) {
         start();
     } else {
         const bootstrap = new MutationObserver(() => {
             if (!document.body) return;

             bootstrap.disconnect();
             start();
         });

         bootstrap.observe(document, {
             childList: true,
             subtree: true
         });
     }
 })();
