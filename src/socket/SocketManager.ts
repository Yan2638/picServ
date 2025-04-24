// 📁 src/socket/SocketManager.ts

type Callback = (data: any) => void;

class SocketManagerClass {
    private socket: WebSocket | null = null;
    private subscriptions: Map<string, Set<Callback>> = new Map();
    private reconnectDelay = 2000;
    private pingInterval: any;
    private isManuallyClosed = false;
    private readonly url = 'ws://localhost:5000';

    constructor() {
        this.connect();
    }

    private connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('✅ WebSocket подключен');
            this.resubscribeAll();
            this.startPing();
        };

        this.socket.onmessage = (event) => {
            (this.socket as any).isAlive = true;

            try {
                const msg = JSON.parse(event.data);

                if (msg.type === 'pong') return;

                // 🎯 Если тип 'update' или 'arena:update', вызываем коллбэки
                if ((msg.type === 'update' || msg.type === 'arena:update') && msg.key) {
                    const cbs = this.subscriptions.get(msg.key);
                    if (cbs) cbs.forEach((cb) => cb(msg.payload));
                }
            } catch (err) {
                console.error('💥 Ошибка парсинга сообщения WebSocket:', err);
            }
        };

        this.socket.onclose = () => {
            console.warn('🔌 WebSocket отключён');
            this.stopPing();

            if (!this.isManuallyClosed) {
                setTimeout(() => {
                    console.log('🔁 Попытка переподключения WebSocket...');
                    this.connect();
                }, this.reconnectDelay);
            }
        };

        this.socket.onerror = (e) => {
            console.error('⚠️ WebSocket ошибка:', e);
            this.socket?.close();
        };
    }

    private startPing() {
        this.pingInterval = setInterval(() => {
            this.send({ type: 'ping' });
        }, 15000);
    }

    private stopPing() {
        clearInterval(this.pingInterval);
    }

    private send(message: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('📭 Невозможно отправить: соединение не установлено');
        }
    }

    private resubscribeAll() {
        this.subscriptions.forEach((_callbacks, key) => {
            this.send({ type: 'subscribe', key });
        });
    }

    subscribe(key: string, callback: Callback) {
        if (!this.subscriptions.has(key)) {
            this.subscriptions.set(key, new Set());
        }

        const callbacks = this.subscriptions.get(key)!;
        callbacks.add(callback);

        if (this.socket?.readyState === WebSocket.OPEN) {
            this.send({ type: 'subscribe', key });
        }
    }

    unsubscribe(key: string, callback: Callback) {
        const callbacks = this.subscriptions.get(key);
        if (!callbacks) return;

        callbacks.delete(callback);

        if (callbacks.size === 0) {
            this.subscriptions.delete(key);
            this.send({ type: 'unsubscribe', key });
        }
    }

    disconnect() {
        this.isManuallyClosed = true;
        this.stopPing();
        this.socket?.close();
        console.log('🛑 WebSocket отключён вручную');
    }
}

export const SocketManager = new SocketManagerClass();
