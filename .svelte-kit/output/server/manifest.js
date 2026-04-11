export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["apple-touch-icon-precomposed.png","apple-touch-icon.png","favicon.ico","favicon.png","favicon.svg"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.DcOjqHmo.js",app:"_app/immutable/entry/app.CuT37VKn.js",imports:["_app/immutable/entry/start.DcOjqHmo.js","_app/immutable/chunks/DKt0H5aV.js","_app/immutable/chunks/CjjGD_IH.js","_app/immutable/entry/app.CuT37VKn.js","_app/immutable/chunks/CjjGD_IH.js","_app/immutable/chunks/C78AeloG.js","_app/immutable/chunks/C17l-kFY.js","_app/immutable/chunks/CPrXK1X8.js","_app/immutable/chunks/BecYGdQf.js","_app/immutable/chunks/CtesEFpJ.js","_app/immutable/chunks/DZB_9dm5.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/anticipate-cards-remaining",
				pattern: /^\/anticipate-cards-remaining\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/api/auth",
				pattern: /^\/api\/auth\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/_server.ts.js'))
			},
			{
				id: "/bridge-analysis",
				pattern: /^\/bridge-analysis\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/bridge-analysis/capture-missing-trump",
				pattern: /^\/bridge-analysis\/capture-missing-trump\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/bridge-memory",
				pattern: /^\/bridge-memory\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/bridge-memory/track-cards-played",
				pattern: /^\/bridge-memory\/track-cards-played\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/bridge-memory/track-cards-played/game1",
				pattern: /^\/bridge-memory\/track-cards-played\/game1\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/bridge-memory/track-cards-played/game2",
				pattern: /^\/bridge-memory\/track-cards-played\/game2\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/bridge-memory/track-cards-played/game3",
				pattern: /^\/bridge-memory\/track-cards-played\/game3\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/hand-demo",
				pattern: /^\/hand-demo\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
