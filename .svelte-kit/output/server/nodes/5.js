

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/track-cards-played/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.b8aad110.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.6df67563.js"];
export const stylesheets = ["_app/immutable/assets/app.9e0c320d.css"];
export const fonts = [];
