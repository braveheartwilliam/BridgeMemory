import { c as create_ssr_component, e as escape } from "../../../chunks/ssr.js";
/* empty css                   */function generateRandomHand() {
  const suits = ["S", "H", "D", "C"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const hand = [];
  const usedCards = /* @__PURE__ */ new Set();
  while (hand.length < 13) {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    const cardKey = `${suit}${rank}`;
    if (!usedCards.has(cardKey)) {
      usedCards.add(cardKey);
      hand.push({ suit, rank, id: cardKey });
    }
  }
  return hand;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  generateRandomHand();
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8"><div class="max-w-6xl mx-auto"> <header class="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 mb-8" data-svelte-h="svelte-elde3m"><h1 class="text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Hand Display Component Demo</h1> <p class="text-center text-gray-600 mt-2">Generalized component for displaying bridge hands in multiple formats</p></header>  <section class="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg"><h2 class="text-xl font-bold mb-4" data-svelte-h="svelte-blgtky">Display Controls</h2> <div class="grid md:grid-cols-3 gap-6"><div><h3 class="font-semibold mb-3" data-svelte-h="svelte-xt3ge">Display Mode</h3> <div class="space-y-2"><button class="${"w-full px-4 py-2 " + escape(
      "bg-emerald-600 text-white",
      true
    ) + " rounded-lg " + escape(
      "hover:bg-emerald-700",
      true
    ) + " transition-colors"}">Simple Text</button> <button class="${"w-full px-4 py-2 " + escape(
      "bg-emerald-500 text-white",
      true
    ) + " rounded-lg " + escape(
      "hover:bg-emerald-600",
      true
    ) + " transition-colors"}">Card Images</button> <button class="${"w-full px-4 py-2 " + escape(
      "bg-emerald-500 text-white",
      true
    ) + " rounded-lg " + escape(
      "hover:bg-emerald-600",
      true
    ) + " transition-colors"}">Grid Layout</button> <button class="${"w-full px-4 py-2 " + escape(
      "bg-emerald-500 text-white",
      true
    ) + " rounded-lg " + escape(
      "hover:bg-emerald-600",
      true
    ) + " transition-colors"}">Fan Display</button></div></div> <div><h3 class="font-semibold mb-3" data-svelte-h="svelte-119j8qf">Arrangement</h3> <div class="space-y-2"><button class="${"w-full px-4 py-2 " + escape(
      "bg-blue-600 text-white",
      true
    ) + " rounded-lg " + escape(
      "hover:bg-blue-700",
      true
    ) + " transition-colors"}">Horizontal</button> <button class="${"w-full px-4 py-2 " + escape(
      "bg-blue-500 text-white",
      true
    ) + " rounded-lg " + escape(
      "hover:bg-blue-600",
      true
    ) + " transition-colors"}">Vertical</button></div></div> <div><h3 class="font-semibold mb-3" data-svelte-h="svelte-10jwacu">Card Flip Controls</h3> <div class="space-y-2"><button class="${"w-full px-4 py-2 " + escape(
      "bg-purple-500 text-white",
      true
    ) + " rounded-lg " + escape(
      "hover:bg-purple-600",
      true
    ) + " transition-colors"}">${escape("Enable")} Click to Flip</button> <button class="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors" data-svelte-h="svelte-1szkgdf">Start All Face Up</button> <button class="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors" data-svelte-h="svelte-15bdtz6">Start All Face Down</button> <button class="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors" ${"disabled"}>Flip All to Face</button> <button class="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors" ${"disabled"}>Flip All to Back</button> <button class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" ${"disabled"}>Auto Flip (7s)</button></div></div></div></section>  <div class="mt-6 text-center"><button class="${"px-6 py-3 " + escape(
      "bg-purple-500 text-white",
      true
    ) + " font-bold rounded-xl " + escape("hover:bg-purple-600", true) + " transition-colors transform hover:scale-105"}">${escape("Show Demo")}</button></div>  ${`<section class="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center" data-svelte-h="svelte-p2zxrb"><p class="text-gray-600">Click &quot;Show Demo&quot; to display a sample bridge hand</p></section>`}</div></div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
