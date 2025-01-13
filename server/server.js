const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// Define the root directory for serving files
const rootDirectory = path.join(__dirname, '../');

// MIME types mapping for different file extensions
const mimeTypes = require('./mimeTypes.json'); // Require directly if it's a valid JSON

// Path to the 404.html file
const errorPage = path.join(rootDirectory, '404.html');

// Create the HTTP server
const server = http.createServer(async (req, res) => {
    try {
        console.log('Request:', req.url);

        // Construct the file path
        let filePath = path.join(rootDirectory, req.url === '/' ? '/index.html' : req.url);

        // If there's no extension, assume it's an HTML file and append .html
        if (!path.extname(filePath)) {
            filePath += '.html';
        }

        // Normalize the path to avoid path traversal attacks
        filePath = path.normalize(filePath);

        // Ensure the file is within the root directory
        if (!filePath.startsWith(rootDirectory)) {
            throw new Error('Attempted path traversal attack');
        }

        // Get the file extension
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Check if file exists and serve it
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (err) {
        // If file doesn't exist or other errors occur, serve 404.html or a fallback message
        if (req.url.startsWith('/projects/')) {
            const project404Path = path.join(rootDirectory, 'projects', '404.html');
            try {
                const project404Data = await fs.readFile(project404Path);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(project404Data);
                return;
            } catch (project404Err) {
                // If projects/404.html is missing or cannot be read, fall back to the main 404 handler
            }
        }
        try {
            const errorData = await fs.readFile(errorPage);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(errorData);
        } catch (errorReadErr) {
            // In case 404.html is missing or cannot be read
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
        }
    }
});

// Listen on port 3000
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
