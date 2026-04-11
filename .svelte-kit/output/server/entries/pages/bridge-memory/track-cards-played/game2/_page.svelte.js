import { F as FILENAME } from "../../../../../chunks/constants.js";
import "clsx";
import { p as push_element, a as pop_element } from "../../../../../chunks/dev.js";
import "../../../../../chunks/client.js";
_page[FILENAME] = "src/routes/bridge-memory/track-cards-played/game2/+page.svelte";
function _page($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      let gameStarted = false;
      let handCards = [];
      console.log(
        "$inspect(",
        gameStarted,
        (gameStarted2) => {
          console.log("🎯 GameStarted state changed to:", gameStarted2);
        },
        ")"
      );
      console.log(
        "$inspect(",
        handCards,
        (handCards2) => {
          console.log("🃏 HandCards changed to:", handCards2.length);
        },
        ")"
      );
      $$renderer2.push(`<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">`);
      push_element($$renderer2, "div", 600, 0);
      $$renderer2.push(`<div class="max-w-6xl mx-auto">`);
      push_element($$renderer2, "div", 601, 1);
      $$renderer2.push(`<nav class="bg-white/80 backdrop-blur-sm border-b border-emerald-100 rounded-lg p-3 mb-6">`);
      push_element($$renderer2, "nav", 603, 2);
      $$renderer2.push(`<ol class="flex items-center justify-between space-x-2 text-sm">`);
      push_element($$renderer2, "ol", 604, 3);
      $$renderer2.push(`<li class="flex items-center space-x-2">`);
      push_element($$renderer2, "li", 605, 4);
      $$renderer2.push(`<button class="text-indigo-600 hover:text-indigo-800 transition-colors font-medium">`);
      push_element($$renderer2, "button", 606, 5);
      $$renderer2.push(`Bridge Intelligence Advancement</button>`);
      pop_element();
      $$renderer2.push(` <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 612, 5);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">`);
      push_element($$renderer2, "path", 613, 6);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(` <button class="text-emerald-600 hover:text-emerald-800 transition-colors font-medium">`);
      push_element($$renderer2, "button", 615, 5);
      $$renderer2.push(`Bridge Memory Challenge</button>`);
      pop_element();
      $$renderer2.push(` <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 621, 5);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">`);
      push_element($$renderer2, "path", 622, 6);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(` <button class="text-teal-600 hover:text-teal-800 transition-colors font-medium">`);
      push_element($$renderer2, "button", 624, 5);
      $$renderer2.push(`Track Cards Played</button>`);
      pop_element();
      $$renderer2.push(` <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 630, 5);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">`);
      push_element($$renderer2, "path", 631, 6);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(` <span class="text-cyan-600 font-semibold">`);
      push_element($$renderer2, "span", 633, 5);
      $$renderer2.push(`Game 2</span>`);
      pop_element();
      $$renderer2.push(`</li>`);
      pop_element();
      $$renderer2.push(`</ol>`);
      pop_element();
      $$renderer2.push(`</nav>`);
      pop_element();
      $$renderer2.push(` <header class="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 mb-8">`);
      push_element($$renderer2, "header", 639, 2);
      $$renderer2.push(`<div class="flex justify-between items-center">`);
      push_element($$renderer2, "div", 640, 3);
      $$renderer2.push(`<div class="flex items-center space-x-3">`);
      push_element($$renderer2, "div", 641, 4);
      $$renderer2.push(`<div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">`);
      push_element($$renderer2, "div", 642, 5);
      $$renderer2.push(`<span class="text-white font-bold">`);
      push_element($$renderer2, "span", 643, 6);
      $$renderer2.push(`2</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">`);
      push_element($$renderer2, "h1", 645, 5);
      $$renderer2.push(`Track Cards Played - Game 2</h1>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-right">`);
      push_element($$renderer2, "div", 649, 4);
      $$renderer2.push(`<div class="text-sm text-gray-500">`);
      push_element($$renderer2, "div", 650, 5);
      $$renderer2.push(`Score</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-lg font-bold text-emerald-600">`);
      push_element($$renderer2, "div", 651, 5);
      $$renderer2.push(`Level 2</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</header>`);
      pop_element();
      $$renderer2.push(` `);
      {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6">`);
        push_element($$renderer2, "div", 658, 3);
        $$renderer2.push(`<h2 class="text-2xl font-bold mb-6 text-gray-800">`);
        push_element($$renderer2, "h2", 659, 4);
        $$renderer2.push(`Game 2 - Track Cards Played</h2>`);
        pop_element();
        $$renderer2.push(` <div class="text-center mb-6">`);
        push_element($$renderer2, "div", 661, 4);
        $$renderer2.push(`<p class="text-lg text-gray-700">`);
        push_element($$renderer2, "p", 662, 5);
        $$renderer2.push(`Loading game...</p>`);
        pop_element();
        $$renderer2.push(` <p class="text-sm text-gray-600">`);
        push_element($$renderer2, "p", 663, 5);
        $$renderer2.push(`Game will start automatically</p>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
      }
      $$renderer2.push(`<!--]--></div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 mt-8 space-y-2">`);
      push_element($$renderer2, "div", 869, 1);
      $$renderer2.push(`<div class="grid grid-cols-2 gap-4 max-w-2xl mx-auto">`);
      push_element($$renderer2, "div", 870, 2);
      $$renderer2.push(`<button class="px-4 py-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left">`);
      push_element($$renderer2, "button", 871, 3);
      $$renderer2.push(`Main Menu</button>`);
      pop_element();
      $$renderer2.push(` <button class="px-4 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left">`);
      push_element($$renderer2, "button", 880, 3);
      $$renderer2.push(`Bridge Memory App</button>`);
      pop_element();
      $$renderer2.push(` <button class="px-4 py-2 bg-gradient-to-br from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left">`);
      push_element($$renderer2, "button", 889, 3);
      $$renderer2.push(`Track Cards Played</button>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
    },
    _page
  );
}
_page.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  _page as default
};
