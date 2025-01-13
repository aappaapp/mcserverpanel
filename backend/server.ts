import { Server } from 'socket.io';
import { spawn as spawnPty, type IPty } from 'node-pty';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';

export async function integrateBackend(server: import('http').Server) {
	await mkdir('./mc/', { recursive: true });

	let java: IPty | null = null;
	const bash: IPty = spawnPty('bash', [], {
		cwd: './mc/'
	});
	const filebrowser = spawnPty('filebrowser', ['--port', '31428'], {
		cwd: './mc/'
	});

	const io = new Server(server);

	let log = '';
	let bashLog = '';

	io.on('connection', (socket) => {
		console.log('a user connected');
		socket.emit('console-output', { data: log, id: 'java' });
		socket.emit('console-output', { data: bashLog, id: 'bash' });

		bash.onData((data) => {
			bashLog += data;
			socket.emit('console-output', { id: 'bash', data });
		});

		socket.on('start-server', (data) => {
			console.log('starting server');
			java = spawnPty('java', [`-Xmx${data.ram}G`, '-jar', 'server-fabric.jar', 'nogui'], {
				cwd: './mc/'
			});
			java.onData((data) => {
				log += data;
				socket.emit('console-output', { id: 'java', data });
			});
		});

		socket.on('stop-server', () => {
			console.log('stopping server');
			if (java) java?.kill();
			else console.log('server not running');
		});

		socket.on('console-input', ({ id, data }) => {
			switch (id) {
				case 'bash':
					bash.write(data);
					break;
				case 'java':
					java?.write(data);
					break;
			}
		});

		socket.on('disconnect', () => {
			console.log('user disconnected');
		});
	});

	return io;
}

if (import.meta.filename === process.argv[1]) {
	const server = createServer();
	await integrateBackend(server);
	server.listen(3000, () => console.log('server started'));
}
