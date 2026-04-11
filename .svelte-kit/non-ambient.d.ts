
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/anticipate-cards-remaining" | "/api" | "/api/auth" | "/bridge-analysis" | "/bridge-analysis/capture-missing-trump" | "/bridge-memory" | "/bridge-memory/track-cards-played" | "/bridge-memory/track-cards-played/game1" | "/bridge-memory/track-cards-played/game2" | "/bridge-memory/track-cards-played/game3" | "/hand-demo" | "/login" | "/register";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/anticipate-cards-remaining": Record<string, never>;
			"/api": Record<string, never>;
			"/api/auth": Record<string, never>;
			"/bridge-analysis": Record<string, never>;
			"/bridge-analysis/capture-missing-trump": Record<string, never>;
			"/bridge-memory": Record<string, never>;
			"/bridge-memory/track-cards-played": Record<string, never>;
			"/bridge-memory/track-cards-played/game1": Record<string, never>;
			"/bridge-memory/track-cards-played/game2": Record<string, never>;
			"/bridge-memory/track-cards-played/game3": Record<string, never>;
			"/hand-demo": Record<string, never>;
			"/login": Record<string, never>;
			"/register": Record<string, never>
		};
		Pathname(): "/" | "/anticipate-cards-remaining" | "/api/auth" | "/bridge-analysis" | "/bridge-analysis/capture-missing-trump" | "/bridge-memory" | "/bridge-memory/track-cards-played" | "/bridge-memory/track-cards-played/game1" | "/bridge-memory/track-cards-played/game2" | "/bridge-memory/track-cards-played/game3" | "/hand-demo" | "/login";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/apple-touch-icon-precomposed.png" | "/apple-touch-icon.png" | "/favicon.ico" | "/favicon.png" | "/favicon.svg" | string & {};
	}
}