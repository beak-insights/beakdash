// Import required dependencies
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Define the port (use environment variable or default to 5000)
const port = parseInt(process.env.PORT || '5000', 10);

// Create the Next.js app
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Prepare the application
app.prepare().then(() => {
  // Create the HTTP server
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> BeakDash is ready on http://localhost:${port}`);
  });
});