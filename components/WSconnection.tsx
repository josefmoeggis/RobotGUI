// components/WebSocketConnection.tsx
export class WebSocketClient {
    private ws: WebSocket | null;
    private connectionReady: boolean;

    constructor() {
        this.ws = null;
        this.connectionReady = false;
    }

    connect(host: string, port: string | number): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(`ws://${host}:${port}`);

                this.ws.onopen = () => {
                    console.log('Connected to WebSocket server');
                    this.connectionReady = true;
                    resolve();
                };

                this.ws.onerror = (error: Event) => {
                    console.error('WebSocket Error:', error);
                    this.connectionReady = false;
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('Connection closed');
                    this.connectionReady = false;
                    this.ws = null;
                };

                // Add timeout for connection attempt
                setTimeout(() => {
                    if (!this.connectionReady) {
                        this.disconnect();
                        reject(new Error('Connection timeout'));
                    }
                }, 5000); // 5 second timeout

            } catch (error) {
                this.connectionReady = false;
                reject(error);
            }
        });
    }

    sendBetaValue(beta: number | null): void {
        if (!this.isConnected()) {
            return;
        }

        try {
            const data = {
                type: "beta",
                value: beta,
                timestamp: Date.now()
            };
            // Add small delay between messages
            setTimeout(() => {
                this.ws?.send(JSON.stringify(data));
            }, 10);
        } catch (error) {
            console.error('Error sending beta value:', error);
        }
    }

    sendSpeedValue(speed: number): void {
        if (!this.isConnected()) {
            return;
        }

        try {
            const data = {
                type: "speed",
                value: speed,
                timestamp: Date.now()
            };
            // Add small delay between messages
            setTimeout(() => {
                this.ws?.send(JSON.stringify(data));
            }, 10);
        } catch (error) {
            console.error('Error sending speed value:', error);
        }
    }

    disconnect(): void {
        if (this.ws) {
            this.connectionReady = false;
            this.ws.close();
            this.ws = null;
        }
    }

    isConnected(): boolean {
        return this.ws !== null &&
            this.ws.readyState === WebSocket.OPEN &&
            this.connectionReady;
    }
}

export const wsClient = new WebSocketClient();