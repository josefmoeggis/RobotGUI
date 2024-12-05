// components/TCPconnection.jsx
import TcpSocket from 'react-native-tcp-socket';

export class TCPClient {
    constructor() {
        this.client = null;
    }

    connect(host, port) {
        try {
            this.client = TcpSocket.createConnection({
                host: host,
                port: port,
                tls: false,
            }, () => {
                console.log('Connected to TCP server');
            });

            this.client.on('error', (error) => {
                console.error('TCP Error:', error);
            });

            this.client.on('close', () => {
                console.log('Connection closed');
                this.client = null;
            });
        } catch (error) {
            console.error('Connection error:', error);
        }
    }

    sendBetaValue(beta) {
        if (!this.client) {
            console.error('Not connected to server');
            return;
        }

        try {
            const data = {
                type: 'beta',
                value: beta,
                timestamp: Date.now()
            };
            this.client.write(JSON.stringify(data));
        } catch (error) {
            console.error('Error sending beta value:', error);
        }
    }

    disconnect() {
        if (this.client) {
            this.client.destroy();
            this.client = null;
        }
    }
}

export const tcpClient = new TCPClient();