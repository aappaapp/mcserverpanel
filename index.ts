import { integrateBackend } from './backend/server.ts';
import { createServer } from 'node:http';
import express from 'express';
import { handler } from './build/build/handler.js';

const app = express();
const server = createServer(app);

const io = await integrateBackend(server);

app.use(handler);

server.listen(3000, () => console.log('server started'));
