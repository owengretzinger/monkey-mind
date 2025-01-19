import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database';
import noteRoutes from './routes/notes';
import newUser from "./routes/newUser";
import { ExtendedWebSocket, WebSocketMessage, UserPresence, MonkeyPosition } from './types/messages';
import mascotRoutes from './routes/mascot';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Add middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/notes', noteRoutes);
app.use('/api/mascot', mascotRoutes);
app.use('/api/users', newUser);



// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// HTTP endpoint
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// Update the monkeys tracking structure
const monkeysByUrl = new Map<string, Map<string, MonkeyPosition>>();
const activeConnections = new Map<string, ExtendedWebSocket>();

// Update WebSocket connection handler
wss.on('caonnection', (ws: ExtendedWebSocket) => {
    console.log('New client connected');
    let currentUrl: string | null = null;
    let userId: string | null = null;
    let userPresence: UserPresence | null = null;

    // Set up heartbeat
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    
    // Send ping every 30 seconds
    const interval = setInterval(() => {
        if (ws.isAlive === false) {
            clearInterval(interval);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    }, 30000);

    ws.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
        try {
            const message: WebSocketMessage = JSON.parse(data.toString());
            
            switch (message.type) {
                case 'monkey_position':
                    const monkeyData = message.data as MonkeyPosition;
                    const { url, id } = monkeyData;
                    console.log('Server received monkey data:', monkeyData);
                    
                    // If this is a new connection for this user, clean up old connection
                    if (activeConnections.has(id) && activeConnections.get(id) !== ws) {
                        const oldWs = activeConnections.get(id);
                        if (oldWs?.readyState === WebSocket.OPEN) {
                            oldWs.close();
                        }
                    }
                    
                    userId = id;
                    activeConnections.set(id, ws);

                    // Remove monkey from old URL if it changed
                    if (currentUrl && currentUrl !== url) {
                        const oldUrlMonkeys = monkeysByUrl.get(currentUrl);
                        if (oldUrlMonkeys) {
                            oldUrlMonkeys.delete(id);
                            if (oldUrlMonkeys.size === 0) {
                                monkeysByUrl.delete(currentUrl);
                            }
                        }
                    }

                    // Add/update monkey in new URL
                    if (!monkeysByUrl.has(url)) {
                        monkeysByUrl.set(url, new Map());
                    }
                    monkeysByUrl.get(url)!.set(id, monkeyData);
                    currentUrl = url;

                    // Only broadcast to other clients on the same URL
                    const urlMonkeys = monkeysByUrl.get(url);
                    wss.clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            // Send the current state of all monkeys on this URL
                            urlMonkeys?.forEach(monkey => {
                                console.log('Server sending monkey data:', monkey);
                                client.send(JSON.stringify({
                                    type: 'monkey_position',
                                    data: monkey
                                }));
                            });
                        }
                    });
                    break;

                case 'presence':
                    userPresence = message.data as UserPresence;
                    wss.clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'presence',
                                data: userPresence
                            }));
                        }
                    });
                    break;
                    
                case 'chat':
                    if (!userPresence) return;
                    const presenceData = userPresence;
                    
                    wss.clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'chat',
                                data: {
                                    ...message.data,
                                    userId: presenceData.userId
                                }
                            }));
                        }
                    });
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        if (currentUrl && userId) {
            const urlMonkeys = monkeysByUrl.get(currentUrl);
            if (urlMonkeys) {
                urlMonkeys.delete(userId);
                if (urlMonkeys.size === 0) {
                    monkeysByUrl.delete(currentUrl);
                }
                
                activeConnections.delete(userId);
                
                // Notify other clients that this monkey left
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'monkey_left',
                            data: { id: userId }
                        }));
                    }
                });
            }
        }
        clearInterval(interval);
    });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).send('Not Found');
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});