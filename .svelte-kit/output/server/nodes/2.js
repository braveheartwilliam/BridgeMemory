

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.2fda94c8.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.6df67563.js"];
export const stylesheets = ["_app/immutable/assets/2.a2b6f2bb.css","_app/immutable/assets/app.9e0c320d.css"];
export const fonts = [];
