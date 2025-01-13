import { mkdirSync, readdirSync, renameSync, cpSync } from 'node:fs';

mkdirSync('./build/build/', { recursive: true });
for (const file of readdirSync('./build')) {
	if (file !== 'build') renameSync(`./build/${file}`, `./build/build/${file}`);
}
cpSync('./backend/', './build/backend/', { recursive: true });
cpSync('./index.ts', './build/index.ts');
