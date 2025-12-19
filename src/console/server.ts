import { WebSocketServer, WebSocket } from 'ws';
import { createServer, Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ConsoleEvent {
    type: 'log' | 'stats' | 'approval_request';
    payload: any;
    timestamp: number;
}

export class ShieldConsole {
    private wss: WebSocketServer | null = null;
    private server: Server | null = null;
    private clients: Set<WebSocket> = new Set();
    private port: number;
    private config: any;

    private stats = {
        total: 0,
        blocked: 0,
        totalLatency: 0,
        completedCount: 0
    };

    constructor(port: number = 3000, config?: any) {
        this.port = port;
        this.config = config;
    }

    start() {
        this.server = createServer(async (req, res) => {
            // Serve static files from dist/console/ui
            // In development, we might want to proxy to Vite, but for now let's assume built assets
            // Or just return a simple "Console Running" message if UI not built

            try {
                // Resolve path to UI assets
                // Try multiple locations
                const possiblePaths = [
                    join(__dirname, '../../console/ui'), // dist/console/ui (prod structure)
                    join(process.cwd(), 'src/console/ui/dist'), // dev structure
                ];

                let uiPath = possiblePaths.find(p => existsSync(p));

                if (!uiPath) {
                    console.log('[Shield Console] UI not found in:', possiblePaths);
                    console.log('[Shield Console] __dirname:', __dirname);
                    uiPath = possiblePaths[1];
                }

                // Handling URL
                let url = req.url || '/';
                if (url === '/') url = '/index.html';

                const filePath = join(uiPath, url);

                // Basic MIME types
                const ext = String(filePath.split('.').pop()).toLowerCase();
                const mimeTypes: Record<string, string> = {
                    'html': 'text/html',
                    'js': 'text/javascript',
                    'css': 'text/css',
                    'json': 'application/json',
                    'png': 'image/png',
                    'jpg': 'image/jpg',
                    'svg': 'image/svg+xml',
                };

                const contentType = mimeTypes[ext] || 'application/octet-stream';

                if (existsSync(filePath)) {
                    const content = await readFile(filePath);
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                } else {
                    // SPA fallback to index.html
                    const index = join(uiPath, 'index.html');
                    if (existsSync(index)) {
                        const content = await readFile(index);
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    } else {
                        res.writeHead(404);
                        res.end('Dashboard not built. Run `npm run console:build`');
                    }
                }
            } catch (error) {
                res.writeHead(500);
                res.end(`Server Error: ${error}`);
            }
        });

        this.wss = new WebSocketServer({ server: this.server });

        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            console.log('[Shield Console] Client connected');

            // Send initial config
            if (this.config) {
                ws.send(JSON.stringify({
                    type: 'config',
                    payload: this.config,
                    timestamp: Date.now()
                }));
            }

            // Send initial stats
            const avgLatency = this.stats.completedCount > 0
                ? this.stats.totalLatency / this.stats.completedCount
                : 0;

            ws.send(JSON.stringify({
                type: 'stats',
                payload: {
                    total: this.stats.total,
                    blocked: this.stats.blocked,
                    avgLatency
                },
                timestamp: Date.now()
            }));

            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });

        this.server.listen(this.port, () => {
            console.log(`[Shield Console] Dashboard running at http://localhost:${this.port}`);
        });
    }

    broadcast(event: ConsoleEvent) {
        // Update stats
        if (event.type === 'log') {
            const { event: type, duration } = event.payload;

            if (type === 'tool_call') {
                this.stats.total++;
            } else if (type === 'blocked') {
                this.stats.blocked++;
            } else if (type === 'completed' && typeof duration === 'number') {
                this.stats.totalLatency += duration;
                this.stats.completedCount++;
            }

            // Broadcast stats update
            this.broadcastStats();
        }

        const message = JSON.stringify(event);
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    }

    private broadcastStats() {
        const avgLatency = this.stats.completedCount > 0
            ? this.stats.totalLatency / this.stats.completedCount
            : 0;

        const statsEvent = {
            type: 'stats',
            payload: {
                total: this.stats.total,
                blocked: this.stats.blocked,
                avgLatency
            },
            timestamp: Date.now()
        };

        const message = JSON.stringify(statsEvent);
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    }

    stop() {
        this.wss?.close();
        this.server?.close();
    }
}
