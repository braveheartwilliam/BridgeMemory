import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.DhYFqfgn.js","_app/immutable/chunks/CPrXK1X8.js","_app/immutable/chunks/CjjGD_IH.js","_app/immutable/chunks/CvvzfmqQ.js","_app/immutable/chunks/C17l-kFY.js","_app/immutable/chunks/C78AeloG.js","_app/immutable/chunks/BecYGdQf.js","_app/immutable/chunks/RL_9pGCo.js","_app/immutable/chunks/CiANBa5_.js","_app/immutable/chunks/D4HbFzNW.js","_app/immutable/chunks/Dl59rRMW.js"];
export const stylesheets = ["_app/immutable/assets/2.BFsNFZa1.css"];
export const fonts = [];
