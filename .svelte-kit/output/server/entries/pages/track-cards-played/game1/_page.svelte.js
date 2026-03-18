import { c as create_ssr_component, e as escape, a as add_attribute } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let cardsRevealed = false;
  let revealedCardIds = [];
  {
    {
      console.log("Reactive update - revealedCardIds:", revealedCardIds, "length:", revealedCardIds?.length);
      console.log("Reactive update - cardsRevealed:", cardsRevealed);
    }
  }
  return `<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"> <header class="bg-white/90 backdrop-blur-md shadow-lg border-b border-emerald-200" data-svelte-h="svelte-zpg0tb"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-20"><div class="flex items-center space-x-3"><div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg"><span class="text-white text-xl">🃏</span></div> <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Track Cards Played - Game 1</h1></div> <a href="/track-cards-played" class="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg">← Back to Menu</a></div></div></header> ${` <div class="max-w-4xl mx-auto px-4 py-8"><div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-8"><h2 class="text-3xl font-bold text-center mb-8 text-gray-800" data-svelte-h="svelte-gopj5p">Game Setup</h2> <div class="space-y-6"><div><h3 class="text-xl font-semibold mb-4 text-gray-700" data-svelte-h="svelte-1u9nj5v">Choose Game Mode:</h3> <div class="space-y-3"><label class="${"flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors " + escape(
    "border-emerald-500 bg-emerald-50",
    true
  )}"><input type="radio" value="manual" class="w-4 h-4 text-emerald-600"${add_attribute("checked", true, 1)}> <div data-svelte-h="svelte-jkjm80"><span class="font-semibold">Manual Mode</span> <p class="text-sm text-gray-600">Click to reveal cards, click again to hide them</p></div></label> <label class="${"flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors " + escape(
    "border-gray-300 hover:border-gray-400",
    true
  )}"><input type="radio" value="timed" class="w-4 h-4 text-emerald-600"${""}> <div data-svelte-h="svelte-js94ak"><span class="font-semibold">Timed Mode</span> <p class="text-sm text-gray-600">Cards reveal for a fixed time, then hide automatically</p></div></label></div></div> ${``} <button class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg" data-svelte-h="svelte-uxfn9x">Start Game</button></div></div></div>`}  <footer class="bg-white/90 backdrop-blur-md shadow-lg border-t border-emerald-200 mt-8" data-svelte-h="svelte-aixw09"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"><div class="flex justify-center"><a href="/" class="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg">🏠 Back to Home</a></div></div></footer> </div>`;
});
export {
  Page as default
};
