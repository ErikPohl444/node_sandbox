const fs = require("fs");
const http = require("http");
const path = require("path");

function errResponse(response, statusCode, contentType, message) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", contentType);
  response.end(message);
}

function renderFile(response, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      errResponse(response, 500, contentType, err.message);
    } else {
      response.statusCode = 200;
      response.setHeader("Content-Type", contentType);
      response.end(content);
    }
  });
}

function streamFile(response, filePath, contentType) {
  const stream = fs.createReadStream(filePath);
  response.setHeader("Content-Type", contentType);
  stream.pipe(response);
  stream.on("error", (err) => {
    errResponse(response, 500, contentType, err.message);
  });
}

function genericHandler(response, fileSourceName, style) {
  const filePath = path.join(__dirname, "public", fileSourceName);
  const contentType = style === "static" ? "text/html" : "text/plain";
  console.log(`Serving file: ${filePath}`);
  if (style === "static") {
    renderFile(response, filePath, contentType);
  } else if (style === "stream") {
    streamFile(response, filePath, contentType);
  }
}

function router(request, response) {
  if (request.url === "/") {
    response.statusCode = 302;
    response.setHeader("Location", "/home");
    response.end();
    return;
  }
  if (request.url === "/stream") {
    genericHandler(response, "data.txt", "stream");
  } else if (request.url === "/home") {
    genericHandler(response, "index.html", "static");
  } else {
    response.statusCode = 404;
    response.end("Resource Not Found");
  }
}

exports.handler = router;
exports.htmlHandler = genericHandler;

const server = http.createServer(router);
exports.server = server;

if (require.main === module) {
  server.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
}

exports.renderFile = renderFile;