import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { get } from 'svelte/store';

export const actions = {
	start: async ({ request }) => {},
	stop: async ({ request }) => {},
	consoleCommand: async ({ request }) => {}
};

export async function load({ request }) {
	return {
		filebrowserUrl: (() => {
			const url = new URL(request.url);
			return `${url.protocol}//${url.hostname}:31428`;
		})()
	};
}
