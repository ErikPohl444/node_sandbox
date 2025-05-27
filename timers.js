function setupTimers() {
  const intervalId2secs = setInterval(() => {
    console.log("This will be printed every 2 seconds");
  }, 2000);

  const intervalId3secs = setInterval(() => {
    console.log("This will be printed every 3 seconds");
  }, 3000);

  // To stop the interval after a certain time or condition
  setTimeout(() => {
    console.log("printed once after 10 seconds");
  }, 10000); // Stop after 10 seconds

  setTimeout(() => {
    console.log("printed once after 20 seconds");
    clearInterval(intervalId2secs);
    clearInterval(intervalId3secs);
  }, 20000); // Stop after 10 seconds
}

setupTimers();
// Export the setupTimers function if needed
module.exports = { setupTimers };
