const url = require('url');
const http = require('http');
const path = require('path');
const fse = require('fs-extra');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      const content = fse.pathExistsSync(filepath);

      if (pathname.indexOf('/') !== -1 || pathname.indexOf('\\') !== -1) {
        res.statusCode = 400;
        res.end('Nested path is not supported');
      } else if (!content) {
        res.statusCode = 404;
        res.end('Not found');
      } else {
        const stream = fse.createReadStream(filepath);

        stream.pipe(res);
      }
      
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
