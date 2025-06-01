const fs = require("fs");
const path = require("path");
jest.mock("fs");
const Streamer = require("../Streamer");

// Test cases for the renderFile function
describe("renderFile", () => {

  let response;

  // Mock response object
  beforeEach(() => {
    response = {
      statusCode: null,
      headers: {},
      setHeader: function (key, value) {
        this.headers[key] = value;
      },
      end: jest.fn(),
    };
  });

  // tests base happy path for renderFile, the file is read and sent successfully
  it("should send file content on success", () => {
    fs.readFile.mockImplementation((filePath, cb) => cb(null, "file content"));
    Streamer.renderFile(response, "fake.txt", "text/plain");
    expect(response.statusCode).toBe(200);
    expect(response.headers["Content-Type"]).toBe("text/plain");
    expect(response.end).toHaveBeenCalledWith("file content");
  });

  // tests that the response is set to 500 and the error message is sent when there is an error reading the file
  it("should handle errors", () => {
    fs.readFile.mockImplementation((filePath, cb) => cb(new Error("fail")));
    Streamer.renderFile(response, "fake.txt", "text/plain");
    expect(response.statusCode).toBe(500);
    expect(response.headers["Content-Type"]).toBe("text/plain");
    expect(response.end).toHaveBeenCalledWith("fail");
  });
});

describe("streamFile", () => {
  let response, mockStream;
  const { streamFile } = require("../Streamer");

  beforeEach(() => {
    response = {
      setHeader: jest.fn(),
      end: jest.fn(),
    };
    mockStream = {
      pipe: jest.fn(),
      on: jest.fn(),
    };
    fs.createReadStream = jest.fn(() => mockStream);
  });

  it("should pipe the stream to the response", () => {
    streamFile(response, "fake.txt", "text/plain");
    expect(response.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "text/plain"
    );
    expect(fs.createReadStream).toHaveBeenCalledWith("fake.txt");
    expect(mockStream.pipe).toHaveBeenCalledWith(response);
  });

  it("should handle stream errors", () => {
    streamFile(response, "fake.txt", "text/plain");
    // Simulate error handler
    const errorHandler = mockStream.on.mock.calls.find(
      ([event]) => event === "error"
    )[1];
    errorHandler(new Error("fail"));
    expect(response.statusCode).toBe(500);
    expect(response.end).toHaveBeenCalledWith("fail");
  });
});

describe("router", () => {
  let response;

  // Mock response object and fs.createReadStream
  beforeEach(() => {
    response = {
      statusCode: null,
      headers: {},
      setHeader: function (key, value) {
        this.headers[key] = value;
      },
      end: jest.fn(),
    };
    fs.createReadStream = jest.fn(() => {
      // Mock a minimal readable stream with .pipe and .on
      return {
        pipe: jest.fn(),
        on: jest.fn(),
      };
    });
  });

  it("redirects '/' to '/home'", () => {
    const request = { url: "/" };
    Streamer.router(request, response);
    expect(response.statusCode).toBe(302);
    expect(response.headers["Location"]).toBe("/home");
    expect(response.end).toHaveBeenCalled();
    expect(response.end).not.toHaveBeenCalledWith("Resource Not Found");
  });

  it("serves /stream with genericHandler", () => {
    const request = { url: "/stream" };
    // Optionally spy on genericHandler if you want to check invocation
    Streamer.router(request, response);
    // You can check for side effects or just that end is eventually called
    expect(response.end).not.toHaveBeenCalledWith("Resource Not Found");
  });

  it("serves /home with genericHandler", () => {
    const request = { url: "/home" };
    Streamer.router(request, response);
    expect(response.end).not.toHaveBeenCalledWith("Resource Not Found");
  });

  it("returns 404 for unknown routes", () => {
    const request = { url: "/unknown" };
    Streamer.router(request, response);
    expect(response.statusCode).toBe(404);
    expect(response.end).toHaveBeenCalledWith("Resource Not Found");
  });
});


