const fs = require("fs");
const http = require("http");
const path = require("path");
const Streamer = module.exports;

/**
 * Yield a simple error response.
 * @param {http.ServerResponse} response The first number.
 * @param {number} statusCode The error status code.
 * @param {string} contentType The content type of the response.
 * @param {string} message The error message to send in the response.
 * @returns {void}
 */
function errResponse(response, statusCode, contentType, message) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", contentType);
  response.end(message);
}

/**
 * Render a file as a response in a single unstreaming result.
 * @param {http.ServerResponse} response The response object.
 * @param {string} filePath The path to the file to render.
 * @param {string} contentType The content type of the file.
 * @returns {void}
 */
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

/**
 * Render a file as a response in a stream.
 * @param {http.ServerResponse} response The response object.
 * @param {string} filePath The path to the file to stream.
 * @param {string} contentType The content type of the file.
 * @returns {void}
 */
function streamFile(response, filePath, contentType) {
  const stream = fs.createReadStream(filePath);
  response.setHeader("Content-Type", contentType);
  stream.pipe(response);
  stream.on("error", (err) => {
    errResponse(response, 500, contentType, err.message);
  });
}

/**
 * Generic handler to serve files based on the style (static or stream).
 * @param {http.ServerResponse} response The response object.
 * @param {string} fileSourceName The name of the file to serve.
 * @param {string} style The style of serving the file, either "static" or "stream".
 * @returns {void}
 */
function genericHandler(response, fileSourceName, style) {
  const filePath = path.join(process.cwd(), "public", fileSourceName);
  const contentType = style === "static" ? "text/html" : "text/plain";
  console.log(`Serving file: ${filePath}`);
  if (style === "static") {
    Streamer.renderFile(response, filePath, contentType);
  } else if (style === "stream") {
    Streamer.streamFile(response, filePath, contentType);
  }
}

/**
 * Router function to handle incoming requests and serve files.
 * @param {http.ServerResponse} response The response object.
 * @param {http.IncomingMessage} request The incoming request object.
 * @returns {void}
 */
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

const server = http.createServer(router);

// If this module is run directly, start the server.
if (require.main === module) {
  server.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
}

exports.server = server;
exports.router = router;
exports.genericHandler = genericHandler;
exports.renderFile = renderFile;
exports.streamFile = streamFile;
