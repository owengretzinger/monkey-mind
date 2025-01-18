require('dotenv').config();

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

// Add middleware
app.use(cors());                // Enable CORS for all routes
app.use(helmet());             // Add security headers
app.use(morgan('dev'));        // Request logging
app.use(express.json());       // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// HTTP endpoint
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Handle incoming messages
    ws.on('message', (data) => {
        console.log('Received:', data.toString());
        // Echo the message back to the client
        ws.send(`Server received: ${data}`);
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Error handling middleware (add this before server.listen)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});