
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const DATABASE_URL: string;
	export const BETTER_AUTH_SECRET: string;
	export const BETTER_AUTH_URL: string;
	export const NODE_ENV: string;
	export const PORT: string;
	export const SESSION_SECRET: string;
	export const JWT_SECRET: string;
	export const DEBUG: string;
	export const LOG_LEVEL: string;
	export const NVM_INC: string;
	export const VSCODE_CRASH_REPORTER_PROCESS_TYPE: string;
	export const NODE: string;
	export const INIT_CWD: string;
	export const NVM_CD_FLAGS: string;
	export const SHELL: string;
	export const CLICOLOR: string;
	export const TMPDIR: string;
	export const HOMEBREW_REPOSITORY: string;
	export const npm_config_global_prefix: string;
	export const CONDA_SHLVL: string;
	export const VSCODE_GIT_EDITOR_EXTRA_ARGS: string;
	export const CONDA_PROMPT_MODIFIER: string;
	export const MallocNanoZone: string;
	export const GIT_CONFIG_PARAMETERS: string;
	export const COLOR: string;
	export const GIT_AUTHOR_DATE: string;
	export const npm_config_noproxy: string;
	export const npm_config_local_prefix: string;
	export const ZSH: string;
	export const LC_ALL: string;
	export const GIT_EDITOR: string;
	export const USER: string;
	export const NVM_DIR: string;
	export const LS_COLORS: string;
	export const COMMAND_MODE: string;
	export const npm_config_globalconfig: string;
	export const VSCODE_GIT_EDITOR_NODE: string;
	export const CONDA_EXE: string;
	export const SSH_AUTH_SOCK: string;
	export const GIT_INDEX_FILE: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_execpath: string;
	export const GIT_AUTHOR_NAME: string;
	export const PAGER: string;
	export const ELECTRON_RUN_AS_NODE: string;
	export const LSCOLORS: string;
	export const GIT_PREFIX: string;
	export const PATH: string;
	export const GSETTINGS_SCHEMA_DIR: string;
	export const npm_package_json: string;
	export const BRAVE_API_KEY: string;
	export const npm_config_userconfig: string;
	export const npm_config_init_module: string;
	export const __CFBundleIdentifier: string;
	export const CONDA_PREFIX: string;
	export const npm_command: string;
	export const PWD: string;
	export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
	export const npm_lifecycle_event: string;
	export const VSCODE_ESM_ENTRYPOINT: string;
	export const PERPLEXITY_API_KEY: string;
	export const EDITOR: string;
	export const npm_package_name: string;
	export const LANG: string;
	export const VSCODE_GIT_COMMAND: string;
	export const npm_config_npm_version: string;
	export const XPC_FLAGS: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const SSH_ASKPASS_REQUIRE: string;
	export const MACH_PORT_RENDEZVOUS_PEER_VALDATION: string;
	export const npm_config_node_gyp: string;
	export const npm_package_version: string;
	export const XPC_SERVICE_NAME: string;
	export const SSH_ASKPASS: string;
	export const SHLVL: string;
	export const HOME: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const LANGUAGE: string;
	export const VSCODE_NLS_CONFIG: string;
	export const VSCODE_GIT_EDITOR_MAIN: string;
	export const GREP_OPTIONS: string;
	export const HOMEBREW_PREFIX: string;
	export const npm_config_cache: string;
	export const LOGNAME: string;
	export const LESS: string;
	export const CONDA_PYTHON_EXE: string;
	export const npm_lifecycle_script: string;
	export const VSCODE_IPC_HOOK: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const VSCODE_CODE_CACHE_PATH: string;
	export const NVM_BIN: string;
	export const GITHUB_TOKEN: string;
	export const CONDA_DEFAULT_ENV: string;
	export const npm_config_user_agent: string;
	export const VSCODE_PID: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const INFOPATH: string;
	export const HOMEBREW_CELLAR: string;
	export const GIT_ASKPASS: string;
	export const GIT_AUTHOR_EMAIL: string;
	export const GIT_PAGER: string;
	export const VSCODE_L10N_BUNDLE_LOCATION: string;
	export const VSCODE_CWD: string;
	export const GIT_EXEC_PATH: string;
	export const npm_node_execpath: string;
	export const npm_config_prefix: string;
	export const _: string;
	export const VITE_USER_NODE_ENV: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		DATABASE_URL: string;
		BETTER_AUTH_SECRET: string;
		BETTER_AUTH_URL: string;
		NODE_ENV: string;
		PORT: string;
		SESSION_SECRET: string;
		JWT_SECRET: string;
		DEBUG: string;
		LOG_LEVEL: string;
		NVM_INC: string;
		VSCODE_CRASH_REPORTER_PROCESS_TYPE: string;
		NODE: string;
		INIT_CWD: string;
		NVM_CD_FLAGS: string;
		SHELL: string;
		CLICOLOR: string;
		TMPDIR: string;
		HOMEBREW_REPOSITORY: string;
		npm_config_global_prefix: string;
		CONDA_SHLVL: string;
		VSCODE_GIT_EDITOR_EXTRA_ARGS: string;
		CONDA_PROMPT_MODIFIER: string;
		MallocNanoZone: string;
		GIT_CONFIG_PARAMETERS: string;
		COLOR: string;
		GIT_AUTHOR_DATE: string;
		npm_config_noproxy: string;
		npm_config_local_prefix: string;
		ZSH: string;
		LC_ALL: string;
		GIT_EDITOR: string;
		USER: string;
		NVM_DIR: string;
		LS_COLORS: string;
		COMMAND_MODE: string;
		npm_config_globalconfig: string;
		VSCODE_GIT_EDITOR_NODE: string;
		CONDA_EXE: string;
		SSH_AUTH_SOCK: string;
		GIT_INDEX_FILE: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_execpath: string;
		GIT_AUTHOR_NAME: string;
		PAGER: string;
		ELECTRON_RUN_AS_NODE: string;
		LSCOLORS: string;
		GIT_PREFIX: string;
		PATH: string;
		GSETTINGS_SCHEMA_DIR: string;
		npm_package_json: string;
		BRAVE_API_KEY: string;
		npm_config_userconfig: string;
		npm_config_init_module: string;
		__CFBundleIdentifier: string;
		CONDA_PREFIX: string;
		npm_command: string;
		PWD: string;
		VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
		npm_lifecycle_event: string;
		VSCODE_ESM_ENTRYPOINT: string;
		PERPLEXITY_API_KEY: string;
		EDITOR: string;
		npm_package_name: string;
		LANG: string;
		VSCODE_GIT_COMMAND: string;
		npm_config_npm_version: string;
		XPC_FLAGS: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		SSH_ASKPASS_REQUIRE: string;
		MACH_PORT_RENDEZVOUS_PEER_VALDATION: string;
		npm_config_node_gyp: string;
		npm_package_version: string;
		XPC_SERVICE_NAME: string;
		SSH_ASKPASS: string;
		SHLVL: string;
		HOME: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		LANGUAGE: string;
		VSCODE_NLS_CONFIG: string;
		VSCODE_GIT_EDITOR_MAIN: string;
		GREP_OPTIONS: string;
		HOMEBREW_PREFIX: string;
		npm_config_cache: string;
		LOGNAME: string;
		LESS: string;
		CONDA_PYTHON_EXE: string;
		npm_lifecycle_script: string;
		VSCODE_IPC_HOOK: string;
		VSCODE_GIT_IPC_HANDLE: string;
		VSCODE_CODE_CACHE_PATH: string;
		NVM_BIN: string;
		GITHUB_TOKEN: string;
		CONDA_DEFAULT_ENV: string;
		npm_config_user_agent: string;
		VSCODE_PID: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		INFOPATH: string;
		HOMEBREW_CELLAR: string;
		GIT_ASKPASS: string;
		GIT_AUTHOR_EMAIL: string;
		GIT_PAGER: string;
		VSCODE_L10N_BUNDLE_LOCATION: string;
		VSCODE_CWD: string;
		GIT_EXEC_PATH: string;
		npm_node_execpath: string;
		npm_config_prefix: string;
		_: string;
		VITE_USER_NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
