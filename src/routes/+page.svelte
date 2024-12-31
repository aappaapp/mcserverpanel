<script lang="ts">
	import '@xterm/xterm/css/xterm.css';
	import { onMount } from 'svelte';
	import { io, Socket } from 'socket.io-client';
	import * as xterm from '@xterm/xterm';
	import * as fitAddon from '@xterm/addon-fit';

	let { data } = $props();

	let socket: Socket | null = $state(null);
	let socketConnected = $state(false);

	let terminalContainer: HTMLElement | null = $state(null);
	let bashTerminalContainer: HTMLElement | null = $state(null);

	onMount(async () => {
		socket = io('//:3000', { transports: ['websocket'] });

		let term = new xterm.Terminal({ convertEol: true });
		if (terminalContainer) term.open(terminalContainer);
		let fitAddonInstance = new fitAddon.FitAddon();
		term.loadAddon(fitAddonInstance);

		let bashTerm = new xterm.Terminal({ convertEol: true });
		if (bashTerminalContainer) bashTerm.open(bashTerminalContainer);
		term.loadAddon(fitAddonInstance);

		fitAddonInstance.fit();

		term.onData((data) => {
			socket?.emit('console-input', { id: 'java', data });
		});

		bashTerm.onData((data) => {
			socket?.emit('console-input', { id: 'bash', data });
		});

		socket.on('connect', () => {
			socketConnected = true;
		});

		socket.on('console-output', ({ id, data }) => {
			switch (id) {
				case 'bash':
					bashTerm.write(data);
					break;
				case 'java':
					term.write(data);
					break;
			}
		});
	});

	let ram = $state(4);
	let bash = $state(false);
</script>

<div class="flex p-5">
	<div bind:this={terminalContainer} class="flex-1 {bash ? 'hidden' : ''}"></div>
	<div bind:this={bashTerminalContainer} class="flex-1 {bash ? '' : 'hidden'}"></div>

	<div class="flex flex-col">
		<div class="flex gap-2">
			<a href={data.filebrowserUrl} target="_blank" class="c-button">Open filebrowser in new tab</a>

			<button
				onclick={() => {
					socket?.emit('start-server', { ram });
				}}
				class="c-button">Start Server</button
			>

			<button
				onclick={() => {
					socket?.emit('stop-server');
				}}
				class="c-button">Stop Server</button
			>
		</div>
		<div>
			<div>
				Websocket status: {socketConnected ? 'connected' : 'disconnected'}
			</div>
			<div>
				<label for="ram">Ram (GB):</label>
				<input type="number" id="ram" defaultValue="4" bind:value={ram} />
			</div>
			<div>
				<input type="checkbox" id="bash" defaultValue="4" bind:checked={bash} />
				<label for="bash">Show bash?</label>
			</div>
		</div>
	</div>
</div>
