import { createSocket } from 'dgram';
import { Socket, createServer } from 'net';

export default class DDBConnect {
    constructor(options = {}) {
        const {
            port = 5142,
            host = 'localhost',
            type = 'tcp'
        } = options;

        this.port = port;
        this.host = host;
        this.type = type.toLowerCase();
        this.socket = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.type === 'udp') {
                this.socket = createSocket('udp4');
                this.socket.bind(this.port, this.host, () => {
                    resolve(this.socket); // Bağlantı kurulduğunda soketi resolve et
                });
            } else {
                this.socket = new Socket();
                this.socket.connect(this.port, this.host, () => {
                    resolve(this.socket); // TCP bağlantısı kurulduğunda soketi resolve et
                });
                this.socket.on('error', (err) => {
                    reject(err); // Hata varsa, error eventini dinleyerek hata ver
                });
            }
        });
    }

    send(data) {
        if (!this.socket) {
            throw new Error('Socket not connected. Call connect() first.');
        }

        return new Promise((resolve, reject) => {
            // Convert data to string and append newline
            const payload = `${data}\n`;

            if (this.type === 'udp') {
                this.socket.send(
                    Buffer.from(payload),
                    this.port,
                    this.host,
                    (err) => err ? reject(err) : resolve(true)
                );
            } else {
                // TCP socket.write
                const success = this.socket.write(payload, (err) => {
                    err ? reject(err) : resolve(true);
                });

                // If socket buffer is full, wait for drain event
                if (!success) {
                    this.socket.once('drain', () => {
                        resolve(true);
                    });
                }
            }
        });
    }


    listen(callback) {
        if (!this.socket) {
            throw new Error('Socket not connected. Call connect() first.');
        }

        if (this.type === 'udp') {
            this.socket.on('message', (msg) => {
                try {
                    // Try parsing as JSON first
                    try {
                        const jsonData = JSON.parse(msg.toString());
                        callback(jsonData);
                    } catch {
                        // If JSON parsing fails, pass raw message
                        callback(msg.toString());
                    }
                } catch (error) {
                    console.error('Parsing Error:', error);
                }
            });
        } else {
            this.socket.on('data', (data) => {
                try {
                    // Try parsing as JSON first
                    try {
                        const jsonData = JSON.parse(data.toString());
                        callback(jsonData);
                    } catch {
                        // If JSON parsing fails, pass raw message
                        callback(data.toString());
                    }
                } catch (error) {
                    console.error('Parsing Error:', error);
                }
            });
        }
    }
    close() {
        if (this.socket) {
            if (this.type === 'udp') {
                this.socket.close();
            } else {
                this.socket.destroy();
            }
            this.socket = null;
        }
    }
}