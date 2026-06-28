/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */



import type { WebSocket } from 'ws';

type ConnectionGroup = 'all' | 'authenticated';

/** Manages WebSocket connections and broadcasting */
class ConnectionManager {
  private activeConnections: Record<ConnectionGroup, Set<WebSocket>> = {
    all: new Set(),
    authenticated: new Set(),
  };

  /** Connect a WebSocket client to a group. Assumes the upgrade/accept already happened. */
  connect(socket: WebSocket, group: ConnectionGroup = 'all'): void {
    this.activeConnections[group].add(socket);
    console.info(`Client connected to group: ${group}. Total: ${this.activeConnections[group].size}`);
  }

  /** Disconnect a WebSocket client from all groups */
  disconnect(socket: WebSocket): void {
    for (const groupSet of Object.values(this.activeConnections)) {
      groupSet.delete(socket);
    }
    console.info(`Client disconnected. Remaining in 'all': ${this.activeConnections.all.size}`);
  }

  /** Send a message to a specific client */
  async sendPersonalMessage(message: string, socket: WebSocket): Promise<void> {
    try {
      socket.send(message);
    } catch (err) {
      console.error(`Error sending personal message: ${String(err)}`);
      this.disconnect(socket);
    }
  }

  /** Broadcast a message to all connections in a group */
  async broadcast(message: string, group: ConnectionGroup = 'all'): Promise<void> {
    if (!(group in this.activeConnections)) {
      console.warn(`Warning: Group '${group}' not found`);
      return;
    }

    const disconnected = new Set<WebSocket>();
    const connections = [...this.activeConnections[group]];

    console.info(`Broadcasting to ${connections.length} clients in group '${group}'`);

    for (const connection of connections) {
      try {
        connection.send(message);
      } catch (err) {
        console.error(`Error broadcasting to client: ${String(err)}`);
        disconnected.add(connection);
      }
    }

    // Clean up disconnected clients
    for (const conn of disconnected) {
      this.disconnect(conn);
    }

    console.info(`Broadcast complete. Removed ${disconnected.size} dead connections`);
  }

  /** Broadcast JSON data to all connections in a group */
  async broadcastJson(data: unknown, group: ConnectionGroup = 'all'): Promise<void> {
    const message = JSON.stringify(data);
    await this.broadcast(message, group);
  }
}

// Global connection manager instance
export const manager = new ConnectionManager();

// Helper functions for broadcasting updates

/** Broadcast a fronting update to all connected clients */
export async function broadcastFrontingUpdate(frontersData: unknown): Promise<void> {
  await manager.broadcastJson({ type: 'fronters_update', data: frontersData });
}

/** Broadcast a mental state update to all connected clients */
export async function broadcastMentalStateUpdate(stateData: unknown): Promise<void> {
  await manager.broadcastJson({ type: 'mental_state_update', data: stateData });
}

/** Broadcast a generic frontend update */
export async function broadcastFrontendUpdate(updateType: string, data: unknown): Promise<void> {
  await manager.broadcastJson({ type: updateType, data });
}