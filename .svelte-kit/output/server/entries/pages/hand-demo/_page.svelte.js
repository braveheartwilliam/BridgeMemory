import { a as attr_class, b as stringify } from "../../../chunks/renderer.js";
/* empty css                  */
import { p as push_element, a as pop_element } from "../../../chunks/dev.js";
import { e as escape_html, a as attr } from "../../../chunks/attributes.js";
import { F as FILENAME } from "../../../chunks/constants.js";
_page[FILENAME] = "src/routes/hand-demo/+page.svelte";
function _page($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      function generateRandomHand() {
        const suits = ["S", "H", "D", "C"];
        const ranks = [
          "A",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "J",
          "Q",
          "K"
        ];
        const hand = [];
        const usedCards = /* @__PURE__ */ new Set();
        while (hand.length < 13) {
          const suit = suits[Math.floor(Math.random() * suits.length)];
          const rank = ranks[Math.floor(Math.random() * ranks.length)];
          const cardKey = `${suit}${rank}`;
          if (!usedCards.has(cardKey)) {
            usedCards.add(cardKey);
            hand.push({
              suit,
              rank,
              id: cardKey
              // Use suit+rank as unique ID
            });
          }
        }
        return hand;
      }
      generateRandomHand();
      $$renderer2.push(`<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">`);
      push_element($$renderer2, "div", 120, 0);
      $$renderer2.push(`<div class="max-w-6xl mx-auto">`);
      push_element($$renderer2, "div", 121, 1);
      $$renderer2.push(`<header class="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 mb-8">`);
      push_element($$renderer2, "header", 123, 2);
      $$renderer2.push(`<h1 class="text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">`);
      push_element($$renderer2, "h1", 124, 3);
      $$renderer2.push(`Hand Display Component Demo</h1>`);
      pop_element();
      $$renderer2.push(` <p class="text-center text-gray-600 mt-2">`);
      push_element($$renderer2, "p", 127, 3);
      $$renderer2.push(`Generalized component for displaying bridge hands in multiple formats</p>`);
      pop_element();
      $$renderer2.push(`</header>`);
      pop_element();
      $$renderer2.push(` <section class="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg">`);
      push_element($$renderer2, "section", 133, 2);
      $$renderer2.push(`<h2 class="text-xl font-bold mb-4">`);
      push_element($$renderer2, "h2", 134, 3);
      $$renderer2.push(`Display Controls</h2>`);
      pop_element();
      $$renderer2.push(` <div class="grid md:grid-cols-3 gap-6">`);
      push_element($$renderer2, "div", 136, 3);
      $$renderer2.push(`<div>`);
      push_element($$renderer2, "div", 137, 4);
      $$renderer2.push(`<h3 class="font-semibold mb-3">`);
      push_element($$renderer2, "h3", 138, 5);
      $$renderer2.push(`Display Mode</h3>`);
      pop_element();
      $$renderer2.push(` <div class="space-y-2">`);
      push_element($$renderer2, "div", 139, 5);
      $$renderer2.push(`<button${attr_class(`w-full px-4 py-2 ${stringify(
        "bg-emerald-600 text-white"
      )} rounded-lg ${stringify("hover:bg-emerald-700")} transition-colors`)}>`);
      push_element($$renderer2, "button", 140, 6);
      $$renderer2.push(`Simple Text</button>`);
      pop_element();
      $$renderer2.push(` <button${attr_class(`w-full px-4 py-2 ${stringify("bg-emerald-500 text-white")} rounded-lg ${stringify("hover:bg-emerald-600")} transition-colors`)}>`);
      push_element($$renderer2, "button", 146, 6);
      $$renderer2.push(`Card Images</button>`);
      pop_element();
      $$renderer2.push(` <button${attr_class(`w-full px-4 py-2 ${stringify("bg-emerald-500 text-white")} rounded-lg ${stringify("hover:bg-emerald-600")} transition-colors`)}>`);
      push_element($$renderer2, "button", 152, 6);
      $$renderer2.push(`Grid Layout</button>`);
      pop_element();
      $$renderer2.push(` <button${attr_class(`w-full px-4 py-2 ${stringify("bg-emerald-500 text-white")} rounded-lg ${stringify("hover:bg-emerald-600")} transition-colors`)}>`);
      push_element($$renderer2, "button", 158, 6);
      $$renderer2.push(`Fan Display</button>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 167, 4);
      $$renderer2.push(`<h3 class="font-semibold mb-3">`);
      push_element($$renderer2, "h3", 168, 5);
      $$renderer2.push(`Arrangement</h3>`);
      pop_element();
      $$renderer2.push(` <div class="space-y-2">`);
      push_element($$renderer2, "div", 169, 5);
      $$renderer2.push(`<button${attr_class(`w-full px-4 py-2 ${stringify("bg-blue-600 text-white")} rounded-lg ${stringify("hover:bg-blue-700")} transition-colors`)}>`);
      push_element($$renderer2, "button", 170, 6);
      $$renderer2.push(`Horizontal</button>`);
      pop_element();
      $$renderer2.push(` <button${attr_class(`w-full px-4 py-2 ${stringify("bg-blue-500 text-white")} rounded-lg ${stringify("hover:bg-blue-600")} transition-colors`)}>`);
      push_element($$renderer2, "button", 176, 6);
      $$renderer2.push(`Vertical</button>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 185, 4);
      $$renderer2.push(`<h3 class="font-semibold mb-3">`);
      push_element($$renderer2, "h3", 186, 5);
      $$renderer2.push(`Card Flip Controls</h3>`);
      pop_element();
      $$renderer2.push(` <div class="space-y-2">`);
      push_element($$renderer2, "div", 187, 5);
      $$renderer2.push(`<button${attr_class(`w-full px-4 py-2 ${stringify("bg-purple-500 text-white")} rounded-lg ${stringify("hover:bg-purple-600")} transition-colors`)}>`);
      push_element($$renderer2, "button", 188, 6);
      $$renderer2.push(`${escape_html("Enable")} Click to Flip</button>`);
      pop_element();
      $$renderer2.push(` <button class="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">`);
      push_element($$renderer2, "button", 194, 6);
      $$renderer2.push(`Start All Face Up</button>`);
      pop_element();
      $$renderer2.push(` <button class="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">`);
      push_element($$renderer2, "button", 200, 6);
      $$renderer2.push(`Start All Face Down</button>`);
      pop_element();
      $$renderer2.push(` <button class="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"${attr("disabled", true, true)}>`);
      push_element($$renderer2, "button", 206, 6);
      $$renderer2.push(`Flip All to Face</button>`);
      pop_element();
      $$renderer2.push(` <button class="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"${attr("disabled", true, true)}>`);
      push_element($$renderer2, "button", 213, 6);
      $$renderer2.push(`Flip All to Back</button>`);
      pop_element();
      $$renderer2.push(` <button class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"${attr("disabled", true, true)}>`);
      push_element($$renderer2, "button", 220, 6);
      $$renderer2.push(`Auto Flip (7s)</button>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</section>`);
      pop_element();
      $$renderer2.push(` <div class="mt-6 text-center">`);
      push_element($$renderer2, "div", 233, 2);
      $$renderer2.push(`<button${attr_class(`px-6 py-3 ${stringify("bg-purple-500 text-white")} font-bold rounded-xl ${stringify("hover:bg-purple-600")} transition-colors transform hover:scale-105`)}>`);
      push_element($$renderer2, "button", 234, 3);
      $$renderer2.push(`${escape_html("Show Demo")}</button>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` `);
      {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<section class="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center">`);
        push_element($$renderer2, "section", 271, 3);
        $$renderer2.push(`<p class="text-gray-600">`);
        push_element($$renderer2, "p", 272, 4);
        $$renderer2.push(`Click "Show Demo" to display a sample bridge hand</p>`);
        pop_element();
        $$renderer2.push(`</section>`);
        pop_element();
      }
      $$renderer2.push(`<!--]--></div>`);
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
