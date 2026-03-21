
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
		RouteId(): "/" | "/anticipate-cards-remaining" | "/hand-demo" | "/track-cards-played" | "/track-cards-played/game1" | "/track-cards-played/game2";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/anticipate-cards-remaining": Record<string, never>;
			"/hand-demo": Record<string, never>;
			"/track-cards-played": Record<string, never>;
			"/track-cards-played/game1": Record<string, never>;
			"/track-cards-played/game2": Record<string, never>
		};
		Pathname(): "/" | "/anticipate-cards-remaining" | "/hand-demo" | "/track-cards-played" | "/track-cards-played/game1" | "/track-cards-played/game2";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/apple-touch-icon-precomposed.png" | "/apple-touch-icon.png" | "/favicon.ico" | "/favicon.png" | "/favicon.svg" | string & {};
	}
}