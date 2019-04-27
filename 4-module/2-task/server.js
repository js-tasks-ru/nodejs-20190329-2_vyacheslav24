const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

// POST /[filename] – создание нового файла в папке files и запись в него тела запроса.
// Максимальный размер загружаемого файла не должен превышать 1МБ, при превышении лимита – ошибка 413.
// Если в процессе загрузки файла на сервер произошел обрыв соединения — созданный файл с диска надо удалять.
// Вложенные папки не поддерживаются, при запросе вида /dir1/dir2/filename – ошибка 400.

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end('Nested paths are not allowed');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':

      if (!filepath) {
        res.statusCode = 404;
        res.end('File not found');
        return;
      }

      const limitStream = new LimitSizeStream({limit: 1e6});
      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

      req
          .pipe(limitStream)
          .on('error', (err) => {
            if (err.code === 'LIMIT_EXCEEDED') {
              res.statusCode = 413;
              res.end('File is too large');
              fs.unlink(filepath, () => {});
              return;
            }

            res.statusCode = 500;
            res.end('Internal server error');

            fs.unlink(filepath, (err) => {});
          })
          .pipe(writeStream)
          .on('error', (err) => {
            if (err.code === 'EEXIST') {
              res.statusCode = 409;
              res.end('File already exists');
              return;
            }

            res.statusCode = 500;
            res.end('Internal server error');

            fs.unlink(filepath, (err) => {});
          })
          .on('close', () => {
            res.statusCode = 201;
            res.end('File created');
          });

      res.on('close', () => {
        if (res.finished) return;
        fs.unlink(filepath, (err) => {});
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

