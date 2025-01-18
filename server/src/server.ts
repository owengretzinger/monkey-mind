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
import { ExtendedWebSocket, WebSocketMessage, UserPresence } from './types/messages';
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

// WebSocket connection handler
wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('New client connected');
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

    // Handle incoming messages
    ws.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
        try {
            const message: WebSocketMessage = JSON.parse(data.toString());
            
            switch (message.type) {
                case 'presence':
                    userPresence = message.data as UserPresence;
                    // Broadcast to other clients on the same page
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
                    // Only broadcast if we have user presence info
                    if (!userPresence) return;
                    
                    // At this point TypeScript knows userPresence is not null
                    const presenceData = userPresence; // Create a non-null reference
                    
                    wss.clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'chat',
                                data: {
                                    ...message.data,
                                    userId: presenceData.userId // Use the non-null reference
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
        clearInterval(interval);
        console.log('Client disconnected');
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