

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/hand-demo/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.b0b64cc3.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.6df67563.js","_app/immutable/chunks/each.e59479a4.js"];
export const stylesheets = ["_app/immutable/assets/app.9e0c320d.css"];
export const fonts = [];
