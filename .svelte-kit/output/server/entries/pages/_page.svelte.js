import { h as head, e as ensure_array_like } from "../../chunks/renderer.js";
import "../../chunks/client.js";
import { p as push_element, a as pop_element } from "../../chunks/dev.js";
import { e as escape_html } from "../../chunks/attributes.js";
import { F as FILENAME } from "../../chunks/constants.js";
_page[FILENAME] = "src/routes/+page.svelte";
function _page($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      const applications = [
        {
          title: "Bridge Memory Challenge",
          description: "Master your bridge card memory with advanced training exercises",
          icon: "??",
          route: "/bridge-memory",
          status: "available",
          features: ["Card Recognition", "Memory Training", "Skill Progression"]
        },
        {
          title: "Bridge Bidding Practice",
          description: "Improve your bidding skills with interactive scenarios",
          icon: "??",
          route: "/bridge-bidding",
          status: "coming-soon",
          features: [
            "Bidding Systems",
            "Scenario Practice",
            "Partnership Coordination"
          ]
        },
        {
          title: "Bridge Play Analysis",
          description: "Analyze and improve your card play techniques",
          icon: "??",
          route: "/bridge-analysis",
          status: "coming-soon",
          features: ["Play Review", "Optimal Strategies", "Mistake Detection"]
        },
        {
          title: "Bridge Conventions Master",
          description: "Learn and practice advanced bridge conventions",
          icon: "??",
          route: "/bridge-conventions",
          status: "planned",
          features: [
            "Convention Library",
            "Interactive Lessons",
            "Practice Hands"
          ]
        }
      ];
      head("1uha8ag", $$renderer2, ($$renderer3) => {
        $$renderer3.title(($$renderer4) => {
          $$renderer4.push(`<title>Bridge Intelligence Advancement - Master Your Bridge Skills</title>`);
        });
        $$renderer3.push(`<meta name="description" content="Advanced bridge training applications to improve your memory, bidding, and play skills"/>`);
        push_element($$renderer3, "meta", 59, 1);
        pop_element();
      });
      $$renderer2.push(`<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">`);
      push_element($$renderer2, "div", 62, 0);
      $$renderer2.push(`<section class="relative overflow-hidden">`);
      push_element($$renderer2, "section", 64, 1);
      $$renderer2.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">`);
      push_element($$renderer2, "div", 65, 2);
      $$renderer2.push(`<div class="text-center fade-in opacity-0 transition-opacity duration-1000 svelte-1uha8ag">`);
      push_element($$renderer2, "div", 66, 3);
      $$renderer2.push(`<h1 class="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">`);
      push_element($$renderer2, "h1", 67, 4);
      $$renderer2.push(`Bridge Intelligence <br/>`);
      push_element($$renderer2, "br", 69, 5);
      pop_element();
      $$renderer2.push(` <span class="text-4xl md:text-6xl">`);
      push_element($$renderer2, "span", 70, 5);
      $$renderer2.push(`Advancement</span>`);
      pop_element();
      $$renderer2.push(`</h1>`);
      pop_element();
      $$renderer2.push(` <p class="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">`);
      push_element($$renderer2, "p", 72, 4);
      $$renderer2.push(`Master your bridge skills with our comprehensive suite of advanced training applications</p>`);
      pop_element();
      $$renderer2.push(` <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">`);
      push_element($$renderer2, "div", 75, 4);
      $$renderer2.push(`<div class="flex items-center space-x-2 text-gray-600">`);
      push_element($$renderer2, "div", 76, 5);
      $$renderer2.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 77, 6);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">`);
      push_element($$renderer2, "path", 78, 7);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(` <span>`);
      push_element($$renderer2, "span", 80, 6);
      $$renderer2.push(`Expert-Designed Training</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="flex items-center space-x-2 text-gray-600">`);
      push_element($$renderer2, "div", 82, 5);
      $$renderer2.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 83, 6);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z">`);
      push_element($$renderer2, "path", 84, 7);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(` <span>`);
      push_element($$renderer2, "span", 86, 6);
      $$renderer2.push(`Progressive Learning</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="flex items-center space-x-2 text-gray-600">`);
      push_element($$renderer2, "div", 88, 5);
      $$renderer2.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 89, 6);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4">`);
      push_element($$renderer2, "path", 90, 7);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(` <span>`);
      push_element($$renderer2, "span", 92, 6);
      $$renderer2.push(`Skill Tracking</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</section>`);
      pop_element();
      $$renderer2.push(` <section class="py-20">`);
      push_element($$renderer2, "section", 100, 1);
      $$renderer2.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
      push_element($$renderer2, "div", 101, 2);
      $$renderer2.push(`<div class="text-center mb-16 fade-in opacity-0 transition-opacity duration-1000 svelte-1uha8ag">`);
      push_element($$renderer2, "div", 102, 3);
      $$renderer2.push(`<h2 class="text-4xl font-bold text-gray-900 mb-4">`);
      push_element($$renderer2, "h2", 103, 4);
      $$renderer2.push(`Training Applications</h2>`);
      pop_element();
      $$renderer2.push(` <p class="text-xl text-gray-600 max-w-2xl mx-auto">`);
      push_element($$renderer2, "p", 104, 4);
      $$renderer2.push(`Choose from our specialized training modules to enhance specific aspects of your bridge game</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">`);
      push_element($$renderer2, "div", 109, 3);
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(applications);
      for (let index = 0, $$length = each_array.length; index < $$length; index++) {
        let app = each_array[index];
        $$renderer2.push(`<div class="fade-in opacity-0 transition-opacity duration-1000 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden group svelte-1uha8ag">`);
        push_element($$renderer2, "div", 111, 5);
        $$renderer2.push(`<div class="p-8">`);
        push_element($$renderer2, "div", 112, 6);
        $$renderer2.push(`<div class="flex items-start justify-between mb-6">`);
        push_element($$renderer2, "div", 113, 7);
        $$renderer2.push(`<div class="flex-1">`);
        push_element($$renderer2, "div", 114, 8);
        $$renderer2.push(`<div class="flex items-center space-x-3 mb-4">`);
        push_element($$renderer2, "div", 115, 9);
        $$renderer2.push(`<span class="text-4xl">`);
        push_element($$renderer2, "span", 116, 10);
        $$renderer2.push(`${escape_html(app.icon)}</span>`);
        pop_element();
        $$renderer2.push(` <div>`);
        push_element($$renderer2, "div", 117, 10);
        $$renderer2.push(`<h3 class="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">`);
        push_element($$renderer2, "h3", 118, 11);
        $$renderer2.push(`${escape_html(app.title)}</h3>`);
        pop_element();
        $$renderer2.push(` <div class="flex items-center space-x-2 mt-1">`);
        push_element($$renderer2, "div", 121, 11);
        if (app.status === "available") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">`);
          push_element($$renderer2, "span", 123, 13);
          $$renderer2.push(`Available Now</span>`);
          pop_element();
        } else if (app.status === "coming-soon" && app.title === "Bridge Play Analysis") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">`);
          push_element($$renderer2, "span", 127, 13);
          $$renderer2.push(`Under Development</span>`);
          pop_element();
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">`);
          push_element($$renderer2, "span", 131, 13);
          $$renderer2.push(`Planned</span>`);
          pop_element();
        }
        $$renderer2.push(`<!--]--></div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(` <p class="text-gray-600 mb-6 leading-relaxed">`);
        push_element($$renderer2, "p", 138, 9);
        $$renderer2.push(`${escape_html(app.description)}</p>`);
        pop_element();
        $$renderer2.push(` <div class="space-y-2 mb-6">`);
        push_element($$renderer2, "div", 139, 9);
        $$renderer2.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(app.features);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let feature = each_array_1[$$index];
          $$renderer2.push(`<div class="flex items-center space-x-2 text-sm text-gray-500">`);
          push_element($$renderer2, "div", 141, 11);
          $$renderer2.push(`<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
          push_element($$renderer2, "svg", 142, 12);
          $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">`);
          push_element($$renderer2, "path", 143, 13);
          $$renderer2.push(`</path>`);
          pop_element();
          $$renderer2.push(`</svg>`);
          pop_element();
          $$renderer2.push(` <span>`);
          push_element($$renderer2, "span", 145, 12);
          $$renderer2.push(`${escape_html(feature)}</span>`);
          pop_element();
          $$renderer2.push(`</div>`);
          pop_element();
        }
        $$renderer2.push(`<!--]--></div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(`</div>`);
        pop_element();
        $$renderer2.push(` <div class="flex items-center justify-between">`);
        push_element($$renderer2, "div", 152, 7);
        if (app.status === "available") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">`);
          push_element($$renderer2, "button", 154, 9);
          $$renderer2.push(`Launch Application</button>`);
          pop_element();
        } else if (app.status === "coming-soon" && app.title === "Bridge Play Analysis") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<button class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">`);
          push_element($$renderer2, "button", 161, 9);
          $$renderer2.push(`Launch Application</button>`);
          pop_element();
        } else if (app.status === "coming-soon") {
          $$renderer2.push("<!--[2-->");
          $$renderer2.push(`<button disabled="" class="w-full px-6 py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed">`);
          push_element($$renderer2, "button", 168, 9);
          $$renderer2.push(`Coming Soon</button>`);
          pop_element();
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<button disabled="" class="w-full px-6 py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed">`);
          push_element($$renderer2, "button", 175, 9);
          $$renderer2.push(`Planned</button>`);
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
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</section>`);
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
