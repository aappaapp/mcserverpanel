import { cpSync, rmSync } from 'node:fs';

rmSync('./packaged/', { recursive: true, force: true });
cpSync('./build/', './packaged/build/', { recursive: true });
cpSync('./backend/', './packaged/backend/', { recursive: true });
cpSync('./index.ts', './packaged/index.ts');
