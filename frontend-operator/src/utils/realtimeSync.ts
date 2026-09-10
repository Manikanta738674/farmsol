import { io, Socket } from 'socket.io-client';

export type SyncEventType =
  | 'queue:update'
  | 'payment:update'
  | 'sms:notification'
  | 'msp:update'
  | 'centre:update'
  | 'booking:created'
  | 'gate:arrival';

export interface SyncMessage<T = any> {
  type: SyncEventType;
  payload: T;
  timestamp: string;
  sourcePortal: 'farmer' | 'operator' | 'admin';
}

class RealtimeSyncManager {
  private socket: Socket | null = null;
  private channel: BroadcastChannel | null = null;
  private listeners: Map<SyncEventType, Set<(payload: any) => void>> = new Map();
  private portalName: 'farmer' | 'operator' | 'admin' = 'operator';
  private isConnected: boolean = false;

  constructor() {
    this.initBroadcastChannel();
    this.initStorageFallback();
    this.initSocket();
  }

  public setPortal(portal: 'farmer' | 'operator' | 'admin') {
    this.portalName = portal;
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('farmsol_realtime_bus');
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          if (event.data && event.data.type) {
            this.notifyListeners(event.data.type, event.data.payload);
          }
        };
      } catch (err) {
        console.warn('[Sync] BroadcastChannel init error:', err);
      }
    }
  }

  private initStorageFallback() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === 'farmsol_bus_event' && event.newValue) {
          try {
            const data: SyncMessage = JSON.parse(event.newValue);
            if (data && data.type) {
              this.notifyListeners(data.type, data.payload);
            }
          } catch (e) {}
        }
      });
    }
  }

  private initSocket() {
    try {
      this.socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 5000
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log(`[Socket] Connected to backend on ${this.portalName}`);
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log(`[Socket] Disconnected from backend on ${this.portalName}`);
      });

      const serverEvents: SyncEventType[] = [
        'queue:update',
        'payment:update',
        'sms:notification',
        'msp:update',
        'centre:update',
        'booking:created',
        'gate:arrival'
      ];

      serverEvents.forEach((evt) => {
        this.socket?.on(evt, (payload: any) => {
          this.notifyListeners(evt, payload);
          this.relayToChannel(evt, payload);
        });
      });
    } catch (e) {
      console.warn('[Socket] Socket init fallback:', e);
    }
  }

  public subscribe(eventType: SyncEventType, callback: (payload: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  public broadcast(eventType: SyncEventType, payload: any) {
    this.notifyListeners(eventType, payload);
    this.relayToChannel(eventType, payload);

    if (typeof window !== 'undefined') {
      try {
        const msg: SyncMessage = {
          type: eventType,
          payload,
          timestamp: new Date().toISOString(),
          sourcePortal: this.portalName
        };
        localStorage.setItem('farmsol_bus_event', JSON.stringify(msg));
      } catch (e) {}
    }

    if (this.socket && this.socket.connected) {
      this.socket.emit(eventType, payload);
    }
  }

  private relayToChannel(eventType: SyncEventType, payload: any) {
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: eventType,
          payload,
          timestamp: new Date().toISOString(),
          sourcePortal: this.portalName
        });
      } catch (e) {}
    }
  }

  private notifyListeners(eventType: SyncEventType, payload: any) {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[Sync] Error in listener for ${eventType}:`, err);
        }
      });
    }
  }

  public joinRoom(room: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:room', room);
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public isSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const realtimeSync = new RealtimeSyncManager();
