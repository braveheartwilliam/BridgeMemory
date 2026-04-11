function experimental_async_required(name) {
  {
    const error = new Error(`experimental_async_required
Cannot use \`${name}(...)\` unless the \`experimental.async\` compiler option is \`true\`
https://svelte.dev/e/experimental_async_required`);
    error.name = "Svelte error";
    throw error;
  }
}
function invariant_violation(message) {
  {
    const error = new Error(`invariant_violation
An invariant violation occurred, meaning Svelte's internal assumptions were flawed. This is a bug in Svelte, not your app — please open an issue at https://github.com/sveltejs/svelte, citing the following message: "${message}"
https://svelte.dev/e/invariant_violation`);
    error.name = "Svelte error";
    throw error;
  }
}
function lifecycle_outside_component(name) {
  {
    const error = new Error(`lifecycle_outside_component
\`${name}(...)\` can only be used during component initialisation
https://svelte.dev/e/lifecycle_outside_component`);
    error.name = "Svelte error";
    throw error;
  }
}
function snippet_without_render_tag() {
  {
    const error = new Error(`snippet_without_render_tag
Attempted to render a snippet without a \`{@render}\` block. This would cause the snippet code to be stringified instead of its content being rendered to the DOM. To fix this, change \`{snippet}\` to \`{@render snippet()}\`.
https://svelte.dev/e/snippet_without_render_tag`);
    error.name = "Svelte error";
    throw error;
  }
}
var ssr_context = null;
function set_ssr_context(v) {
  ssr_context = v;
}
function getContext(key) {
  const context_map = get_or_init_context_map("getContext");
  const result = (
    /** @type {T} */
    context_map.get(key)
  );
  return result;
}
function setContext(key, context) {
  get_or_init_context_map("setContext").set(key, context);
  return context;
}
function get_or_init_context_map(name) {
  if (ssr_context === null) {
    lifecycle_outside_component(name);
  }
  return ssr_context.c ??= new Map(get_parent_context(ssr_context) || void 0);
}
function push(fn) {
  ssr_context = { p: ssr_context, c: null, r: null };
  {
    ssr_context.function = fn;
    ssr_context.element = ssr_context.p?.element;
  }
}
function pop() {
  ssr_context = /** @type {SSRContext} */
  ssr_context.p;
}
function get_parent_context(ssr_context2) {
  let parent = ssr_context2.p;
  while (parent !== null) {
    const context_map = parent.c;
    if (context_map !== null) {
      return context_map;
    }
    parent = parent.p;
  }
  return null;
}
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
var has_own_property = Object.prototype.hasOwnProperty;
const noop = () => {
};
function run_all(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i]();
  }
}
function deferred() {
  var resolve;
  var reject;
  var promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
const HYDRATION_START = "[";
const HYDRATION_START_ELSE = "[!";
const HYDRATION_START_FAILED = "[?";
const HYDRATION_END = "]";
const HYDRATION_ERROR = {};
const ELEMENT_IS_NAMESPACED = 1;
const ELEMENT_PRESERVE_ATTRIBUTE_CASE = 1 << 1;
const ELEMENT_IS_INPUT = 1 << 2;
const UNINITIALIZED = Symbol();
const FILENAME = Symbol("filename");
export {
  snippet_without_render_tag as A,
  array_from as B,
  setContext as C,
  ELEMENT_PRESERVE_ATTRIBUTE_CASE as E,
  FILENAME as F,
  HYDRATION_START as H,
  UNINITIALIZED as U,
  set_ssr_context as a,
  HYDRATION_END as b,
  ELEMENT_IS_INPUT as c,
  define_property as d,
  ELEMENT_IS_NAMESPACED as e,
  pop as f,
  getContext as g,
  has_own_property as h,
  invariant_violation as i,
  HYDRATION_START_FAILED as j,
  experimental_async_required as k,
  HYDRATION_ERROR as l,
  HYDRATION_START_ELSE as m,
  noop as n,
  get_descriptor as o,
  push as p,
  deferred as q,
  run_all as r,
  ssr_context as s,
  includes as t,
  object_prototype as u,
  array_prototype as v,
  get_prototype_of as w,
  is_array as x,
  is_extensible as y,
  index_of as z
};
