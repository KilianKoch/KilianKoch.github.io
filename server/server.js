const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

// Define the root directory for serving files
const rootDirectory = path.join(__dirname, '../');

// MIME types mapping for different file extensions
let mimeTypes = {};
(async () => {
  try {
    const mimeData = await fs.readFile(path.join(__dirname, 'mimetypes.json'), 'utf-8');
    mimeTypes = JSON.parse(mimeData);
  } catch (err) {
    console.error('Failed to load MIME types:', err);
    process.exit(1);
  }
})();

// Path to the 404.html file
const errorPage = path.join(rootDirectory, '404.html');

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  try {
    console.log('Request:', req.url);

    // Normalize and construct the file path without query parameters
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let safePath = path.normalize(parsedUrl.pathname);
    if (safePath === '/' || safePath === '') safePath = '/index.html';
    if (!path.extname(safePath)) safePath += '.html';
    
    const filePath = path.join(rootDirectory, safePath);

    // Security check: ensure the file stays inside rootDirectory
    if (!filePath.startsWith(rootDirectory)) {
      throw new Error('Attempted path traversal attack');
    }

    // Determine Content-Type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Serve the file
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    console.error('Error handling request:', err.message);

    // Special 404 for /projects/*
    if (req.url.startsWith('/projects/')) {
      const project404Path = path.join(rootDirectory, 'projects', '404.html');
      try {
        const project404Data = await fs.readFile(project404Path);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(project404Data);
        return;
      } catch {}
    }

    // Generic 404 fallback
    try {
      const errorData = await fs.readFile(errorPage);
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(errorData);
    } catch {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  }
});

// Start server after MIME types are loaded
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
