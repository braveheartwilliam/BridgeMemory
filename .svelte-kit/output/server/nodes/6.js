

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/track-cards-played/game1/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.451366af.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.6df67563.js","_app/immutable/chunks/each.e59479a4.js"];
export const stylesheets = [];
export const fonts = [];
