const fs = require('fs');
const path = require('path');

module.exports = {
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
