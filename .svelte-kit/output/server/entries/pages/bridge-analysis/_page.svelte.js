import { h as head, e as ensure_array_like, a as attr_class, b as stringify } from "../../../chunks/renderer.js";
import "../../../chunks/client.js";
import { p as push_element, a as pop_element } from "../../../chunks/dev.js";
import { e as escape_html } from "../../../chunks/attributes.js";
import { F as FILENAME } from "../../../chunks/constants.js";
_page[FILENAME] = "src/routes/bridge-analysis/+page.svelte";
function _page($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      const activities = [
        {
          id: "capture-missing-trump",
          title: "Capture the Missing Trump",
          description: "Learn to identify and capture missing trump cards in bridge play scenarios",
          icon: "🎯",
          route: "/bridge-analysis/capture-missing-trump",
          status: "available",
          difficulty: "intermediate",
          duration: "15-20 min"
        },
        {
          id: "card-counting",
          title: "Advanced Card Counting",
          description: "Master the art of counting cards to predict opponent holdings",
          icon: "🔢",
          route: "/bridge-analysis/card-counting",
          status: "coming-soon",
          difficulty: "advanced",
          duration: "20-30 min"
        },
        {
          id: "play-analysis",
          title: "Play Analysis Workshop",
          description: "Analyze complex bridge hands and identify optimal plays",
          icon: "📊",
          route: "/bridge-analysis/play-analysis",
          status: "coming-soon",
          difficulty: "advanced",
          duration: "25-35 min"
        },
        {
          id: "defensive-strategy",
          title: "Defensive Strategy Training",
          description: "Develop defensive techniques to counter opponent strategies",
          icon: "🛡️",
          route: "/bridge-analysis/defensive-strategy",
          status: "planned",
          difficulty: "intermediate",
          duration: "20-25 min"
        }
      ];
      function getStatusColor(status) {
        switch (status) {
          case "available":
            return "bg-green-100 text-green-800";
          case "coming-soon":
            return "bg-yellow-100 text-yellow-800";
          case "planned":
            return "bg-gray-100 text-gray-800";
        }
      }
      function getDifficultyColor(difficulty) {
        switch (difficulty) {
          case "beginner":
            return "bg-blue-100 text-blue-800";
          case "intermediate":
            return "bg-orange-100 text-orange-800";
          case "advanced":
            return "bg-red-100 text-red-800";
        }
      }
      head("1h4vckx", $$renderer2, ($$renderer3) => {
        $$renderer3.title(($$renderer4) => {
          $$renderer4.push(`<title>Bridge Play Analysis - Training Activities</title>`);
        });
        $$renderer3.push(`<meta name="description" content="Bridge play analysis training activities and exercises"/>`);
        push_element($$renderer3, "meta", 91, 1);
        pop_element();
      });
      $$renderer2.push(`<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">`);
      push_element($$renderer2, "div", 94, 0);
      $$renderer2.push(`<nav class="bg-white/80 backdrop-blur-sm border-b border-indigo-100">`);
      push_element($$renderer2, "nav", 96, 1);
      $$renderer2.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">`);
      push_element($$renderer2, "div", 97, 2);
      $$renderer2.push(`<ol class="flex items-center space-x-2 text-sm">`);
      push_element($$renderer2, "ol", 98, 3);
      $$renderer2.push(`<li class="flex items-center">`);
      push_element($$renderer2, "li", 99, 4);
      $$renderer2.push(`<button class="text-indigo-600 hover:text-indigo-800 transition-colors font-medium">`);
      push_element($$renderer2, "button", 100, 5);
      $$renderer2.push(`Bridge Intelligence Advancement</button>`);
      pop_element();
      $$renderer2.push(` <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 106, 5);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">`);
      push_element($$renderer2, "path", 107, 6);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(`</li>`);
      pop_element();
      $$renderer2.push(` <li class="flex items-center">`);
      push_element($$renderer2, "li", 110, 4);
      $$renderer2.push(`<span class="text-indigo-600 font-semibold">`);
      push_element($$renderer2, "span", 111, 5);
      $$renderer2.push(`Bridge Play Analysis</span>`);
      pop_element();
      $$renderer2.push(`</li>`);
      pop_element();
      $$renderer2.push(`</ol>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</nav>`);
      pop_element();
      $$renderer2.push(` <header class="bg-white/90 backdrop-blur-md shadow-lg border-b border-indigo-200">`);
      push_element($$renderer2, "header", 118, 1);
      $$renderer2.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
      push_element($$renderer2, "div", 119, 2);
      $$renderer2.push(`<div class="flex justify-between items-center h-20">`);
      push_element($$renderer2, "div", 120, 3);
      $$renderer2.push(`<div class="flex items-center space-x-3">`);
      push_element($$renderer2, "div", 121, 4);
      $$renderer2.push(`<button class="p-2 rounded-lg hover:bg-indigo-100 transition-colors" aria-label="Back to main menu" title="Back to main menu">`);
      push_element($$renderer2, "button", 122, 5);
      $$renderer2.push(`<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 128, 6);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18">`);
      push_element($$renderer2, "path", 129, 7);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(`</button>`);
      pop_element();
      $$renderer2.push(` <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">`);
      push_element($$renderer2, "div", 132, 5);
      $$renderer2.push(`<span class="text-white text-xl">`);
      push_element($$renderer2, "span", 133, 6);
      $$renderer2.push(`📊</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">`);
      push_element($$renderer2, "h1", 135, 5);
      $$renderer2.push(`Bridge Play Analysis</h1>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="flex items-center space-x-4">`);
      push_element($$renderer2, "div", 139, 4);
      $$renderer2.push(`<span class="text-sm text-gray-600 font-medium">`);
      push_element($$renderer2, "span", 140, 5);
      $$renderer2.push(`Training Activities</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</header>`);
      pop_element();
      $$renderer2.push(` <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">`);
      push_element($$renderer2, "main", 147, 1);
      $$renderer2.push(`<div class="text-center mb-16">`);
      push_element($$renderer2, "div", 148, 2);
      $$renderer2.push(`<h2 class="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">`);
      push_element($$renderer2, "h2", 149, 3);
      $$renderer2.push(`Master Bridge Play Analysis</h2>`);
      pop_element();
      $$renderer2.push(` <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-4">`);
      push_element($$renderer2, "p", 152, 3);
      $$renderer2.push(`Develop advanced bridge play analysis skills through interactive training activities. Learn to identify patterns, calculate probabilities, and make optimal decisions.</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">`);
      push_element($$renderer2, "div", 158, 2);
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(activities);
      for (let index = 0, $$length = each_array.length; index < $$length; index++) {
        let activity = each_array[index];
        $$renderer2.push(`<div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">`);
        push_element($$renderer2, "div", 160, 4);
        $$renderer2.push(`<div class="p-8">`);
        push_element($$renderer2, "div", 161, 5);
        $$renderer2.push(`<div class="flex items-start justify-between mb-6">`);
        push_element($$renderer2, "div", 162, 6);
        $$renderer2.push(`<div class="flex-1">`);
        push_element($$renderer2, "div", 163, 7);
        $$renderer2.push(`<div class="flex items-center space-x-3 mb-4">`);
        push_element($$renderer2, "div", 164, 8);
        $$renderer2.push(`<span class="text-4xl">`);
        push_element($$renderer2, "span", 165, 9);
        $$renderer2.push(`${escape_html(activity.icon)}</span>`);
        pop_element();
        $$renderer2.push(` <div>`);
        push_element($$renderer2, "div", 166, 9);
        $$renderer2.push(`<h3 class="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">`);
        push_element($$renderer2, "h3", 167, 10);
        $$renderer2.push(`${escape_html(activity.title)}</h3>`);
        pop_element();
        $$renderer2.push(` <div class="flex items-center space-x-2 mt-1">`);
        push_element($$renderer2, "div", 170, 10);
        $$renderer2.push(`<span${attr_class(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stringify(getStatusColor(activity.status))}`)}>`);
        push_element($$renderer2, "span", 171, 11);
        if (activity.status === "available") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`Available Now`);
        } else if (activity.status === "coming-soon") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`Coming Soon`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`Planned`);
        }
        $$renderer2.push(`<!--]--></span>`);
        pop_element();
        $$renderer2.push(` <span${attr_class(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stringify(getDifficultyColor(activity.difficulty))}`)}>`);
        push_element($$renderer2, "span", 180, 11);
        $$renderer2.push(`${escape_html(activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1))}</span>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(` <p class="text-gray-600 mb-4 leading-relaxed">`);
        push_element($$renderer2, "p", 186, 8);
        $$renderer2.push(`${escape_html(activity.description)}</p>`);
        pop_element();
        $$renderer2.push(` <div class="flex items-center text-sm text-gray-500 mb-6">`);
        push_element($$renderer2, "div", 187, 8);
        $$renderer2.push(`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
        push_element($$renderer2, "svg", 188, 9);
        $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">`);
        push_element($$renderer2, "path", 189, 10);
        $$renderer2.push(`</path>`);
        pop_element();
        $$renderer2.push(`</svg>`);
        pop_element();
        $$renderer2.push(` <span>`);
        push_element($$renderer2, "span", 191, 9);
        $$renderer2.push(`${escape_html(activity.duration)}</span>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(` <div class="flex items-center justify-between">`);
        push_element($$renderer2, "div", 196, 6);
        if (activity.status === "available") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">`);
          push_element($$renderer2, "button", 198, 8);
          $$renderer2.push(`Start Activity</button>`);
          pop_element();
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<button disabled="" class="w-full px-6 py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed">`);
          push_element($$renderer2, "button", 205, 8);
          if (activity.status === "coming-soon") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`Coming Soon`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`Planned`);
          }
          $$renderer2.push(`<!--]--></button>`);
          pop_element();
        }
        $$renderer2.push(`<!--]--></div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
      }
      $$renderer2.push(`<!--]--></div>`);
      pop_element();
      $$renderer2.push(` <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-100">`);
      push_element($$renderer2, "div", 223, 2);
      $$renderer2.push(`<h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">`);
      push_element($$renderer2, "h3", 224, 3);
      $$renderer2.push(`Recommended Learning Path</h3>`);
      pop_element();
      $$renderer2.push(` <div class="grid md:grid-cols-4 gap-6">`);
      push_element($$renderer2, "div", 225, 3);
      $$renderer2.push(`<div class="text-center">`);
      push_element($$renderer2, "div", 226, 4);
      $$renderer2.push(`<div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">`);
      push_element($$renderer2, "div", 227, 5);
      $$renderer2.push(`<span class="text-white text-2xl font-bold">`);
      push_element($$renderer2, "span", 228, 6);
      $$renderer2.push(`1</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <h4 class="font-semibold text-gray-800 mb-2">`);
      push_element($$renderer2, "h4", 230, 5);
      $$renderer2.push(`Start Here</h4>`);
      pop_element();
      $$renderer2.push(` <p class="text-sm text-gray-600">`);
      push_element($$renderer2, "p", 231, 5);
      $$renderer2.push(`Begin with Capture the Missing Trump</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-center">`);
      push_element($$renderer2, "div", 233, 4);
      $$renderer2.push(`<div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">`);
      push_element($$renderer2, "div", 234, 5);
      $$renderer2.push(`<span class="text-white text-2xl font-bold">`);
      push_element($$renderer2, "span", 235, 6);
      $$renderer2.push(`2</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <h4 class="font-semibold text-gray-800 mb-2">`);
      push_element($$renderer2, "h4", 237, 5);
      $$renderer2.push(`Advance Skills</h4>`);
      pop_element();
      $$renderer2.push(` <p class="text-sm text-gray-600">`);
      push_element($$renderer2, "p", 238, 5);
      $$renderer2.push(`Progress to Card Counting</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-center">`);
      push_element($$renderer2, "div", 240, 4);
      $$renderer2.push(`<div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">`);
      push_element($$renderer2, "div", 241, 5);
      $$renderer2.push(`<span class="text-white text-2xl font-bold">`);
      push_element($$renderer2, "span", 242, 6);
      $$renderer2.push(`3</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <h4 class="font-semibold text-gray-800 mb-2">`);
      push_element($$renderer2, "h4", 244, 5);
      $$renderer2.push(`Master Analysis</h4>`);
      pop_element();
      $$renderer2.push(` <p class="text-sm text-gray-600">`);
      push_element($$renderer2, "p", 245, 5);
      $$renderer2.push(`Try Play Analysis Workshop</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-center">`);
      push_element($$renderer2, "div", 247, 4);
      $$renderer2.push(`<div class="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">`);
      push_element($$renderer2, "div", 248, 5);
      $$renderer2.push(`<span class="text-white text-2xl font-bold">`);
      push_element($$renderer2, "span", 249, 6);
      $$renderer2.push(`4</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <h4 class="font-semibold text-gray-800 mb-2">`);
      push_element($$renderer2, "h4", 251, 5);
      $$renderer2.push(`Complete Training</h4>`);
      pop_element();
      $$renderer2.push(` <p class="text-sm text-gray-600">`);
      push_element($$renderer2, "p", 252, 5);
      $$renderer2.push(`Finish with Defensive Strategy</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</main>`);
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
