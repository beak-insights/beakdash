// Custom script to start Next.js server with specific port and host
// Import required modules from Next.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Configure the Next.js app
const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 5000; // Use port 5000 for Replit compatibility

// Initialize the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Prepare and start the server
app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});