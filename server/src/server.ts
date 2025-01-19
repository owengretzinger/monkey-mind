import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { WebSocket, WebSocketServer } from "ws";
import type { WebSocketMessage, ConnectedClient, MonkeyData } from "./types/messages";
import { connectDB } from "./config/database";
import noteRoutes from "./routes/notes";
import newUser from "./routes/newUser";
import mascotRoutes from "./routes/mascot";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Add middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/notes", noteRoutes);
app.use("/api/mascot", mascotRoutes);
app.use("/api/users", newUser);

// Create HTTP server
const server = http.createServer(app);

// Track connected monkeys with type safety
const connectedMonkeys = new Map<string, ConnectedClient>();

// Setup WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");

  ws.on("message", (message: string) => {
    try {
      const parsed = JSON.parse(message.toString()) as WebSocketMessage;
      if (parsed.type === "update" && "user" in parsed.data) {
        const monkeyData = parsed.data as MonkeyData;
        if (monkeyData.user?.id) {
          connectedMonkeys.set(monkeyData.user.id, {
            ws,
            monkeyData,
            lastSeen: Date.now(),
          });

          // Broadcast to all other clients
          const broadcastData = JSON.stringify(parsed);
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        }
      }
    } catch (error) {
      console.error("Invalid message received:", error);
    }
  });

  ws.on("close", () => {
    // Find and remove the disconnected monkey
    for (const [userId, client] of connectedMonkeys.entries()) {
      if (client.ws === ws) {
        console.log(`Client disconnected: ${userId}`);
        connectedMonkeys.delete(userId);

        // Broadcast disconnect event
        const disconnectMessage: WebSocketMessage = {
          type: "disconnect",
          data: { userId },
        };
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(disconnectMessage));
          }
        });
        break;
      }
    }
  });
});

// HTTP endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).send("Not Found");
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
