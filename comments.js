// Create web server
// Load the http module to create an http server.
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var comments = [];
var mimeTypes = {
  "html": "text/html",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "png": "image/png",
  "js": "text/javascript",
  "css": "text/css"
};

http.createServer(function(req, res) {
  var uri = url.parse(req.url).pathname;
  var filename = path.join(process.cwd(), uri);
  var extname = path.extname(filename).slice(1);

  if (req.method === 'POST' && uri === '/comment') {
    req.on('data', function(chunk) {
      comments.push(chunk.toString());
    });
    req.on('end', function() {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end('Thanks for the comment.\n');
    });
  } else if (req.method === 'GET' && uri === '/comments') {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.end(comments.join('\n'));
  } else {
    fs.exists(filename, function(exists) {
      if (!exists) {
        res.writeHead(404, {
          'Content-Type': 'text/plain'
        });
        res.write('404 Not Found\n');
        res.end();
        return;
      }

      if (fs.statSync(filename).isDirectory()) {
        filename += '/index.html';
      }

      fs.readFile(filename, 'binary', function(err, file) {
        if (err) {
          res.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          res.write(err + '\n');
          res.end();
          return;
        }

        res.writeHead(200, {
          'Content-Type': mimeTypes[extname] || 'text/plain'
        });
        res.write(file, 'binary');
        res.end();
      });
    });
  }
}).listen(8124);

console.log('Server running at http://