#!/usr/bin/env node

import app from '../app.js';
import debugLib from 'debug';
import cors from 'cors';
import { createServer } from 'node:http';
import ViteExpress from 'vite-express';
import db from '../config/db.js';

const debug = debugLib('collective-conscience:server');

app.use(cors({
    origin: 'http://localhost:5173' // Allow only your frontend origin
}));

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Conectar a Mongo antes de arrancar el servidor
await db.connectDb();

const server = createServer(app);

// En dev: levanta Vite dev-server y lo une al mismo server; en prod sirve dist si existe
ViteExpress.bind(app, server);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  const port = Number.parseInt(val, 10);
  if (Number.isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') throw error;

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
