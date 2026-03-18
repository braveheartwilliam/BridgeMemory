

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.5322d3b0.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.6df67563.js","_app/immutable/chunks/singletons.6b319b54.js"];
export const stylesheets = [];
export const fonts = [];
