/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Server as HttpServer } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';

import { manager } from './websocket.js';

const KEEPALIVE_INTERVAL_MS = 60_000;

function nowIso(): string {
  return new Date().toISOString();
}

function sendJson(socket: WebSocket, data: unknown): void {
  socket.send(JSON.stringify(data));
}

/** Attach the /ws WebSocket endpoint to an existing HTTP server. */
export function attachWebSocketServer(httpServer: HttpServer): void {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (socket: WebSocket, request) => {
    manager.connect(socket, 'all');

    // Send connection confirmation
    try {
      sendJson(socket, {
        type: 'connection_established',
        timestamp: nowIso(),
        message: 'WebSocket connected successfully',
      });
      console.info(`WebSocket client connected from ${request.socket.remoteAddress}`);
    } catch (err) {
      console.error(`Error sending connection confirmation: ${String(err)}`);
      manager.disconnect(socket);
      socket.close();
      return;
    }

    let keepaliveTimer: NodeJS.Timeout;

    const scheduleKeepalive = () => {
      clearTimeout(keepaliveTimer);
      keepaliveTimer = setTimeout(() => {
        try {
          sendJson(socket, { type: 'keepalive', timestamp: nowIso() });
          scheduleKeepalive();
        } catch {
          socket.close();
        }
      }, KEEPALIVE_INTERVAL_MS);
    };
    scheduleKeepalive();

    socket.on('message', (raw) => {
      scheduleKeepalive(); // reset idle timer, same effect as Python's per-loop wait_for reset

      const data = raw.toString();

      if (data === 'ping') {
        socket.send('pong');
      } else if (data === 'subscribe') {
        sendJson(socket, { type: 'subscribed', timestamp: nowIso() });
      }
    });

    socket.on('close', () => {
      clearTimeout(keepaliveTimer);
      manager.disconnect(socket);
      console.info('WebSocket connection closed');
    });

    socket.on('error', (err) => {
      console.error(`WebSocket error: ${String(err)}`);
    });
  });
}