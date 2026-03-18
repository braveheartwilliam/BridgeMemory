

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/anticipate-cards-remaining/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.140cb1be.js","_app/immutable/chunks/scheduler.e108d1fd.js","_app/immutable/chunks/index.6df67563.js"];
export const stylesheets = ["_app/immutable/assets/3.59a73fbd.css","_app/immutable/assets/app.9e0c320d.css"];
export const fonts = [];
