const http = require('http');
const url = require('url');
const fs = require('fs');
var path = require('path');

const data = require('../data/data.json');

const port = 3000;

const requestHandler = (request, response) => {

    var parsedUrl = url.parse(request.url, true);

    if (parsedUrl.pathname.startsWith('/api/')) {
        switch (parsedUrl.pathname) {
            case '/api/search':
                _search(response, parsedUrl.query);
                break;
            default:
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("404 Not found");
                response.end();
                break;
        }
    } else {
        if (parsedUrl.pathname === '/') {
            parsedUrl.pathname += 'index.html';
        }

        const stream = fs.createReadStream(path.join(__dirname + '/public', parsedUrl.pathname));
        stream.on('error', function() {
            console.log(__dirname + '/public', parsedUrl.pathname);
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not found");
            response.end();
        });
        stream.pipe(response);
    }
};

const server = http.createServer(requestHandler);
server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`server is listening on ${port}`);
});
const _indexPage = (response) => {
    fs.readFile('./public/index.html', (err, html) => {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    });
};

const _search = (response, query) => {

    if (!query.query) {
        response.writeHead(400, { 'Content-Type': 'text/plain' });
        response.end('Search query is empty!');
        return;
    }

    const searchQuery =  query.query.toString().split(',');

    const result = data.filter((item) => {

        return searchQuery.some((q => item.firstname.toLowerCase().indexOf(q.toLowerCase()) !== -1 ||
                                      item.lastname.toLowerCase().indexOf(q.toLowerCase()) !== -1 ||
                                      item.additionalInfo.toLowerCase().indexOf(q.toLowerCase()) !== -1
        ));
    });

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(result));
};