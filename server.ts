import { Server } from 'socket.io';
import { type ChildProcessWithoutNullStreams, spawn as spawnCp } from 'node:child_process';
import { spawn as spawnPty, type IPty } from 'node-pty';
import { mkdir } from 'node:fs/promises';

await mkdir('./mc/', { recursive: true });

let java: IPty | null = null;
let bash: IPty | null = null;

const io = new Server();

let log = '';
let bashLog = '';

const filebrowser = spawnCp('filebrowser', ['-a', '0.0.0.0', '-p', '8080'], {
	cwd: './mc/'
});

io.on('connection', (socket) => {
	console.log('a user connected');
	socket.emit('console-output', { data: log, id: 'java' });
	socket.emit('console-output', { data: bashLog, id: 'bash' });

	bash = spawnPty('bash', [], {
		cwd: './mc/'
	});
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
				bash?.write(data);
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

// server.listen(3000, () => {
// 	console.log('listening on *:3000');
// });

io.listen(3000);
