const fs = require('fs');
const path = require('path');

module.exports = {
  '/api/preferences': {
    target: 'http://localhost:4205',
    bypass: (req, res) => {
      const prefsPath = path.join(__dirname, 'preferences');
      const filePath = path.join(prefsPath, 'default-user.json');

      // Ensure directory exists
      if (!fs.existsSync(prefsPath)) {
        fs.mkdirSync(prefsPath, { recursive: true });
      }

      // GET /api/preferences/load
      if (req.method === 'GET' && req.path === '/api/preferences/load') {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.writeHead(200);
          res.end(content);
        } else {
          // Return empty preferences structure
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({}));
        }
        return true;
      }

      // POST /api/preferences/save
      if (req.method === 'POST' && req.path === '/api/preferences/save') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            // Validate JSON
            JSON.parse(body);
            // Write to file
            fs.writeFileSync(filePath, body, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return true;
      }

      return undefined;
    }
  },
  '/report': {
    target: 'http://localhost:4205',
    pathRewrite: {
      '^/report': ''
    },
    changeOrigin: false,
    bypass: (req, res, proxyOptions) => {
      // Serve static report files with aggressive no-cache headers
      // This ensures the browser always fetches fresh report data
      const reportPath = path.join(__dirname, 'playwright-report', req.path.substring(8));

      if (fs.existsSync(reportPath)) {
        try {
          const content = fs.readFileSync(reportPath);

          // Set aggressive no-cache headers for all report files
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          res.setHeader('ETag', 'W/"' + Date.now() + '"'); // Force new ETag on each request

          // Determine content type based on file extension
          const ext = path.extname(reportPath).toLowerCase();
          const contentTypes = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.json': 'application/json',
            '.css': 'text/css; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject'
          };

          res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
          res.writeHead(200);
          res.end(content);
          return true;
        } catch (error) {
          console.error('Error serving report file:', error);
          return undefined;
        }
      }

      // For files that don't exist, let the dev server handle it
      return undefined;
    }
  }
};
