import express from 'express';
import { createServer } from 'http';
import path from 'path';

const app = express();
const port = 3000;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(process.cwd(), 'dist/src/frontend')));

// Fallback to index.html for SPA routing
app.get('/#/*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/src/frontend/index.html'));
});

// Create the HTTP server
const server = createServer(app);


// Setup API endpoints to handle requests from the frontend.
import { WebEndpointBackend } from '$bridge/api_endpoint/web/backend';
const webEndpointBackend = new WebEndpointBackend(app);

// WebSocket server for sending items to the feed in the frontend.
import { StreamSocketServer } from '$bridge/loading_items_to_feed/web/backend';
const wss = new StreamSocketServer(server);


// Start listening for connections
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});
