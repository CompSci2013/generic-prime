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
      // Serve the playwright report with no-cache headers
      if (req.path === '/report' || req.path === '/report/') {
        const reportPath = path.join(__dirname, 'playwright-report/index.html');
        if (fs.existsSync(reportPath)) {
          const content = fs.readFileSync(reportPath, 'utf8');
          // Set aggressive no-cache headers to prevent browser caching
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.writeHead(200);
          res.end(content);
          return true;
        }
      }

      // Serve report assets (CSS, JS, fonts) without cache as well
      if (req.path.startsWith('/report/')) {
        const assetPath = path.join(__dirname, 'playwright-report', req.path.substring(8));
        if (fs.existsSync(assetPath)) {
          const content = fs.readFileSync(assetPath);
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');

          // Determine content type
          const ext = path.extname(assetPath);
          const contentTypes = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.html': 'text/html'
          };

          res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
          res.writeHead(200);
          res.end(content);
          return true;
        }
      }

      // For all other requests, don't bypass - let the dev server handle it
      return undefined;
    }
  }
};
