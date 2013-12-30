/**
 * Created by danielbryant on 22/12/2013.
 */

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var cache = {};

var chatServer = require('./lib/chat_server');



function send404(resp) {
    resp.writeHead(404, {'Content-Type': 'text/plain'});
    resp.write('Error 404: resource not found');
    resp.end();
}

function sendFile(resp, filePath, fileContents) {
    resp.writeHead(
        200,
        {'content-type': mime.lookup(path.basename(filePath))}
    );
    resp.end(fileContents);
}

function serveStatic(resp, cache, absPath) {
    if (cache[absPath]) {
        sendFile(resp, absPath, cache[absPath])
    } else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(resp);
                    } else {
                        cache[absPath] = data;
                        sendFile(resp, absPath, data);
                    }
                })
            } else {
                send404(resp);
            }
        })
    }
}

var server = http.createServer(function (req, resp) {
    var filePath = false;

    if (req.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + req.url;
    }

    var absPath = './' + filePath;
    serveStatic(resp, cache, absPath);
});

server.listen(3000, function () {
    console.log("Server listening on port 3000");
});

chatServer.listen(server);