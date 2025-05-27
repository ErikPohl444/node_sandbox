const fs = require("fs");
const http = require("http");
const path = require("path");

const server = http.createServer((request, response) => {
  if (request.url === "/stream") {
    const dataPath = path.join(__dirname, "public", "data.txt");

    const stream = fs.createReadStream(dataPath);

    response.setHeader("Content-Type", "text/plain");
    stream.pipe(response);

    stream.on("error", (err) => {
      response.statusCode = 500;
      response.end("Internal Server Error");
      console.error(err);
    });
  } else if (request.url === "/home") {
    const filePath = path.join(__dirname, "public", "index.html");
    console.log(`Serving file: ${filePath}`);

    fs.readFile(filePath, (err, content) => {
      if (err) {
        response.statusCode = 500;
        response.setHeader("Content-Type", "text/plain");
        response.end("Server error.");
      } else {
        response.statusCode = 200;
        response.setHeader("Content-Type", "text/html");
        response.end(content);
      }
    });
  } else {
    response.statusCode = 404;
    response.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
