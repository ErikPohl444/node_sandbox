const fs = require("fs");
const {renderFile} = require("../Streamer");

jest.mock("fs");

describe("renderFile", () => {
  let response;

  beforeEach(() => {
    response = {
      statusCode: null,
      headers: {},
      setHeader: function(key, value) { this.headers[key] = value; },
      end: jest.fn(),
    };
  });

  it("should send file content on success", () => {
    fs.readFile.mockImplementation((filePath, cb) => cb(null, "file content"));
    renderFile(response, "fake.txt", "text/plain");
    expect(response.statusCode).toBe(200);
    expect(response.headers["Content-Type"]).toBe("text/plain");
    expect(response.end).toHaveBeenCalledWith("file content");
  });

  it("should handle errors", () => {
    fs.readFile.mockImplementation((filePath, cb) => cb(new Error("fail")));
    renderFile(response, "fake.txt", "text/plain");
    expect(response.statusCode).toBe(500);
    expect(response.headers["Content-Type"]).toBe("text/plain");
    expect(response.end).toHaveBeenCalledWith("fail");
  });
});