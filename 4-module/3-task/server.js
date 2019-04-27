const url = require('url');
const http = require('http');
const path = require('path');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end('Nested paths are not allowed');
    return;
  }

  switch (req.method) {
    case 'DELETE':

      if (!filepath) {
        res.statusCode = 404;
        res.end('File not found');
        return;
      }
    
      fs.unlink(filepath);
      
      req
          .on('error', () => {
            res.statusCode = 500;
            res.end('Internal server error');
          })
          .on('close', () => {
            res.statusCode = 200;
            res.end('File deleted');
          });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
