const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postJSON(urlPath, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const req = http.request(
      { hostname: "localhost", port: 3000, path: urlPath, method: "POST", headers },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(JSON.parse(body)));
      }
    );
    req.write(postData);
    req.end();
  });
}

async function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(JSON.parse(data)));
    });
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((res) => (this.ws.onopen = res));
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  }
}

async function inspectDoctorPage() {
  const docLogin = await postJSON("/api/auth/login", {
    email: "dr.sarah@medicare.com",
    password: "doctorpassword123",
  });
  const token = docLogin.token;
  const user = docLogin.user;
  const appointmentId = "6ab14ea2bbc6968f7172185e";

  const port = 9225;
  const profileDir = path.join(process.cwd(), ".tmp_debug");
  fs.rmSync(profileDir, { recursive: true, force: true });
  fs.mkdirSync(profileDir, { recursive: true });

  const proc = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${port}`,
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--user-data-dir=${profileDir}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  await sleep(1500);
  const targets = await getJSON(`http://127.0.0.1:${port}/json/list`);
  const client = new CDPClient(targets[0].webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  // First navigate to /login and actually submit the login form like a real user!
  console.log("Navigating to /login...");
  await client.send("Page.navigate", { url: "http://localhost:3000/login" });
  await sleep(2000);

  console.log("Filling in login form...");
  await client.evaluate(`
    (function() {
      const inputs = document.querySelectorAll('input');
      const emailInput = Array.from(inputs).find(i => i.type === 'email');
      const passInput = Array.from(inputs).find(i => i.type === 'password');
      const submitBtn = document.querySelector('button[type="submit"]');

      if (emailInput && passInput && submitBtn) {
        // Use native input setters so React state updates
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(emailInput, "dr.sarah@medicare.com");
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));

        nativeInputValueSetter.call(passInput, "doctorpassword123");
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        submitBtn.click();
      }
    })()
  `);

  // Wait for login redirection to /doctor/dashboard
  console.log("Waiting for login redirect to complete...");
  await sleep(3000);

  const afterLogin = await client.evaluate(`({ href: window.location.href, token: localStorage.getItem('medicare_token')?.substring(0, 15) })`);
  console.log("After login:", afterLogin);

  // Now navigate to /consultation?appointmentId=...
  console.log("Navigating to /consultation?appointmentId=" + appointmentId);
  await client.send("Page.navigate", { url: `http://localhost:3000/consultation?appointmentId=${appointmentId}` });
  await sleep(3500);

  const info = await client.evaluate(`
    ({
      href: window.location.href,
      h2: document.querySelector('h2')?.innerText,
      h3: document.querySelector('h3')?.innerText,
      bodyText: document.body.innerText.substring(0, 300),
      hasVideo: !!document.querySelector('video'),
      videosCount: document.querySelectorAll('video').length,
    })
  `);

  console.log("CONSULTATION ROOM PAGE INFO:", JSON.stringify(info, null, 2));

  client.close();
  proc.kill();
  await sleep(500);
  fs.rmSync(profileDir, { recursive: true, force: true });
}

inspectDoctorPage().catch(console.error);
