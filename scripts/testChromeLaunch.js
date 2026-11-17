const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA_DIR = path.join(process.cwd(), ".tmp_chrome_test");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on("error", reject);
  });
}

async function testLaunch() {
  console.log("Checking Chrome binary...");
  if (!fs.existsSync(CHROME_PATH)) {
    throw new Error("Chrome not found at: " + CHROME_PATH);
  }

  const port = 9222;
  console.log("Launching headless Chrome on port", port);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${port}`,
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      `--user-data-dir=${USER_DATA_DIR}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let versionInfo = null;
  for (let i = 0; i < 20; i++) {
    try {
      versionInfo = await getJSON(`http://127.0.0.1:${port}/json/version`);
      if (versionInfo && versionInfo.webSocketDebuggerUrl) {
        break;
      }
    } catch (e) {
      await sleep(300);
    }
  }

  console.log("Connected to Chrome:", versionInfo ? versionInfo.Browser : "Failed");

  if (versionInfo && versionInfo.webSocketDebuggerUrl) {
    const ws = new WebSocket(versionInfo.webSocketDebuggerUrl);
    await new Promise((res) => (ws.onopen = res));
    console.log("WebSocket connection established to Chrome DevTools!");
    ws.close();
  }

  chromeProcess.kill();
  console.log("Chrome test finished cleanly.");
}

testLaunch().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
