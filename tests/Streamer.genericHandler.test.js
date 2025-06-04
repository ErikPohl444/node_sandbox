const path = require("path");
const Streamer = require("../Streamer");

describe("genericHandler", () => {
  let response;

  beforeEach(() => {
    response = {
      statusCode: null,
      headers: {},
      setHeader: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      write: jest.fn(),
      once: jest.fn(),
    };
    jest.spyOn(Streamer, "renderFile").mockImplementation(() => {});
    jest.spyOn(Streamer, "streamFile").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls renderFile for static style", () => {
    const fileName = "index.html";
    const style = "static";
    const expectedPath = path.join(process.cwd(), "public", fileName);
    Streamer.genericHandler(response, fileName, style);
    expect(Streamer.renderFile).toHaveBeenCalledWith(
      response,
      expectedPath,
      "text/html"
    );
    expect(Streamer.streamFile).not.toHaveBeenCalled();
  });

  it("calls streamFile for stream style", () => {
    const fileName = "data.txt";
    const style = "stream";
    const expectedPath = path.join(process.cwd(), "public", fileName);
    Streamer.genericHandler(response, fileName, style);
    expect(Streamer.streamFile).toHaveBeenCalledWith(
      response,
      expectedPath,
      "text/plain"
    );
    expect(Streamer.renderFile).not.toHaveBeenCalled();
  });
});
