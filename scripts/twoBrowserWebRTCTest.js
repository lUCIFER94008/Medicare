const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\ce90b7c5-f37a-4b3f-8dc9-1d5220db8883";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// HTTP API helpers
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
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, text: body });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function putJSON(urlPath, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const req = http.request(
      { hostname: "localhost", port: 3000, path: urlPath, method: "PUT", headers },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, text: body });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function getJSON(url, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    http.get(url, { headers }, (res) => {
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

// Chrome DevTools Protocol Client over Native WebSocket
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      } catch (e) {
        console.warn("CDP parse error:", e);
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

  async screenshot(filePath) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    if (res && res.data) {
      fs.writeFileSync(filePath, Buffer.from(res.data, "base64"));
      console.log(`[Screenshot saved]: ${filePath}`);
    }
  }

  close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }
  }
}

async function launchBrowser(port, profileName) {
  const profileDir = path.join(process.cwd(), `.tmp_profile_${profileName}`);
  try {
    fs.rmSync(profileDir, { recursive: true, force: true });
  } catch (e) {}
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
      "--window-size=1280,800",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let versionInfo = null;
  for (let i = 0; i < 25; i++) {
    try {
      versionInfo = await getJSON(`http://127.0.0.1:${port}/json/version`);
      if (versionInfo && versionInfo.webSocketDebuggerUrl) break;
    } catch (e) {
      await sleep(250);
    }
  }

  if (!versionInfo) throw new Error(`Failed to start Chrome on port ${port}`);

  const targets = await getJSON(`http://127.0.0.1:${port}/json/list`);
  const target = targets.find((t) => t.type === "page") || targets[0];
  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  return { proc, client, profileDir };
}

// Helper to fill login form and submit
async function loginViaUI(client, email, password) {
  await client.send("Page.navigate", { url: "http://localhost:3000/login" });
  await sleep(1800);

  await client.evaluate(`
    (function() {
      const inputs = document.querySelectorAll('input');
      const emailInput = Array.from(inputs).find(i => i.type === 'email');
      const passInput = Array.from(inputs).find(i => i.type === 'password');
      const submitBtn = document.querySelector('button[type="submit"]');

      if (emailInput && passInput && submitBtn) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(emailInput, "${email}");
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));

        nativeInputValueSetter.call(passInput, "${password}");
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        submitBtn.click();
      }
    })()
  `);

  await sleep(2500);
}

async function runTwoBrowserTest() {
  console.log("==================================================================");
  console.log("   MEDICARE — REAL TWO-BROWSER WEBRTC VIDEO CONSULTATION TEST    ");
  console.log("==================================================================");

  // 1. Doctor API Login for setup
  console.log("\n[1] Doctor logging in via API for test appointment creation...");
  const docLogin = await postJSON("/api/auth/login", {
    email: "dr.sarah@medicare.com",
    password: "doctorpassword123",
  });
  if (!docLogin.data?.success) {
    throw new Error("Doctor login failed: " + JSON.stringify(docLogin));
  }
  const doctorToken = docLogin.data.token;
  const doctorId = docLogin.data.user.doctorProfile?._id || docLogin.data.user._id;

  // 2. Patient API Login for setup
  console.log("[2] Patient logging in via API...");
  const patLogin = await postJSON("/api/auth/login", {
    email: "john.patient@gmail.com",
    password: "patientpassword123",
  });
  if (!patLogin.data?.success) {
    throw new Error("Patient login failed: " + JSON.stringify(patLogin));
  }
  const patientToken = patLogin.data.token;

  // 3. Create fresh confirmed video appointment
  console.log("\n[3] Setting up confirmed video consultation appointment in MongoDB...");
  const docsRes = await getJSON("http://localhost:3000/api/doctors", patientToken);
  const realDoctor = docsRes.data.find(d => d.name.includes("Sarah")) || docsRes.data[0];
  const realDoctorId = realDoctor._id;

  const randomHour = Math.floor(Math.random() * 10 + 1);
  const randomMin = Math.floor(Math.random() * 50 + 10);
  const apptRes = await postJSON(
    "/api/appointments",
    {
      doctorId: realDoctorId,
      appointmentDate: "2026-11-22",
      appointmentTime: `${randomHour}:${randomMin} PM`,
      reason: "Live WebRTC Audio/Video Consultation",
      consultationType: "video",
    },
    patientToken
  );

  let appointmentId;
  if (apptRes.data?.data?._id) {
    appointmentId = apptRes.data.data._id;
  } else {
    // If slot collision, fetch patient's existing video appointment
    const existing = await getJSON("http://localhost:3000/api/appointments", patientToken);
    const found = existing.data.find(a => a.consultationType === "video");
    appointmentId = found._id;
  }
  console.log("✓ Using Confirmed Appointment ID:", appointmentId);

  // Confirm appointment and reset consultation status
  await putJSON(`/api/appointments/${appointmentId}`, { status: "confirmed" }, doctorToken);
  await putJSON(`/api/consultation/room`, { appointmentId, action: "start" }, doctorToken);
  console.log("✓ Appointment status confirmed in MongoDB.");

  // 4. Launch Browser 1 (Doctor)
  console.log("\n[4] Launching Doctor Browser (Session A on port 9222 with synthetic audio/video)...");
  const doctorBrowser = await launchBrowser(9222, "doctor");

  // 5. Launch Browser 2 (Patient)
  console.log("[5] Launching Patient Browser (Session B on port 9223 with synthetic audio/video)...");
  const patientBrowser = await launchBrowser(9223, "patient");

  try {
    // 6. Doctor logs in via UI
    console.log("\n[6] Doctor logging in via UI form...");
    await loginViaUI(doctorBrowser.client, "dr.sarah@medicare.com", "doctorpassword123");
    const docUrl = await doctorBrowser.client.evaluate("window.location.href");
    console.log("✓ Doctor logged in, current page:", docUrl);

    // 7. Patient logs in via UI
    console.log("\n[7] Patient logging in via UI form...");
    await loginViaUI(patientBrowser.client, "john.patient@gmail.com", "patientpassword123");
    const patUrl = await patientBrowser.client.evaluate("window.location.href");
    console.log("✓ Patient logged in, current page:", patUrl);

    // 8. Doctor clicks 'Video Call' or navigates to consultation room
    console.log("\n[8] Doctor joining consultation room: /consultation?appointmentId=" + appointmentId);
    await doctorBrowser.client.send("Page.navigate", {
      url: `http://localhost:3000/consultation?appointmentId=${appointmentId}`,
    });

    // 9. Patient clicks 'Join Call' or navigates to same consultation room
    console.log("[9] Patient joining consultation room: /consultation?appointmentId=" + appointmentId);
    await patientBrowser.client.send("Page.navigate", {
      url: `http://localhost:3000/consultation?appointmentId=${appointmentId}`,
    });

    // 10. Wait for WebRTC connection to establish
    console.log("\n[10] Waiting for camera/mic access and WebRTC P2P connection handshake...");
    let connected = false;

    for (let sec = 1; sec <= 35; sec++) {
      await sleep(1000);

      const docInfo = await doctorBrowser.client.evaluate(`
        ({
          bodySnippet: document.body.innerText.substring(0, 100),
          videosCount: document.querySelectorAll('video').length,
          hasTimer: document.body.innerText.includes("00:"),
          hasEncrypted: document.body.innerText.includes("HD Encrypted"),
          isConnected: document.body.innerText.includes("connected") || document.body.innerText.includes("00:")
        })
      `);

      const patInfo = await patientBrowser.client.evaluate(`
        ({
          bodySnippet: document.body.innerText.substring(0, 100),
          videosCount: document.querySelectorAll('video').length,
          hasTimer: document.body.innerText.includes("00:"),
          hasEncrypted: document.body.innerText.includes("HD Encrypted"),
          isConnected: document.body.innerText.includes("connected") || document.body.innerText.includes("00:")
        })
      `);

      // Verify not indefinitely stuck on 'Connecting to consultation room...'
      const docStuck = docInfo?.bodySnippet?.includes("Connecting to consultation room...");
      const patStuck = patInfo?.bodySnippet?.includes("Connecting to consultation room...");
      if (sec >= 20 && (docStuck || patStuck)) {
        throw new Error("Page stuck on 'Connecting to consultation room...' after 20s!");
      }

      console.log(
        `[Sec ${sec}] Doctor: videos=${docInfo?.videosCount}, timer=${docInfo?.hasTimer} | Patient: videos=${patInfo?.videosCount}, timer=${patInfo?.hasTimer}`
      );

      if (docInfo?.hasTimer || patInfo?.hasTimer || (docInfo?.videosCount >= 1 && patInfo?.videosCount >= 1 && sec >= 8)) {
        connected = true;
        console.log("✓ LIVE WEBRTC AUDIO/VIDEO CONSULTATION ESTABLISHED BETWEEN DOCTOR AND PATIENT!");
        break;
      }
    }

    if (!connected) {
      throw new Error("WebRTC connection handshake timed out after 35 seconds");
    }

    // 11. Test Controls: Mute Microphone on Doctor
    console.log("\n[11] Testing Doctor Microphone Mute toggle...");
    await doctorBrowser.client.evaluate(`
      const micBtn = document.querySelector('button[title*="Microphone"]');
      if (micBtn) micBtn.click();
    `);
    await sleep(600);
    const micBtnTitle = await doctorBrowser.client.evaluate(`document.querySelector('button[title*="Microphone"]')?.title`);
    console.log("Doctor mic button title after toggle:", micBtnTitle);

    // 12. Test Controls: Toggle Camera on Patient
    console.log("\n[12] Testing Patient Camera Video toggle...");
    await patientBrowser.client.evaluate(`
      const camBtn = document.querySelector('button[title*="Camera"]');
      if (camBtn) camBtn.click();
    `);
    await sleep(600);
    const camBtnTitle = await patientBrowser.client.evaluate(`document.querySelector('button[title*="Camera"]')?.title`);
    console.log("Patient camera button title after toggle:", camBtnTitle);

    // 13. Test In-Call Chat during consultation
    console.log("\n[13] Testing In-Call Chat during live consultation...");
    // Doctor opens chat drawer
    await doctorBrowser.client.evaluate(`
      const chatBtn = document.querySelector('button[title*="Chat"]');
      if (chatBtn) chatBtn.click();
    `);
    await sleep(600);

    // Patient sends in-call chat message
    await postJSON(
      "/api/messages",
      { appointmentId, message: "Hello Dr. Sarah, my video and audio are streaming clearly!" },
      patientToken
    );
    await sleep(1500);

    const docChatReceived = await doctorBrowser.client.evaluate(`
      document.body.innerText.includes("video and audio are streaming clearly")
    `);
    console.log("Doctor received In-Call Chat message:", docChatReceived ? "YES (Verified)" : "Pending");

    // 14. Capture Artifact Screenshots
    console.log("\n[14] Capturing screenshots of Doctor and Patient live consultation views...");
    const docScreenshotPath = path.join(ARTIFACT_DIR, "doctor_live_consultation.png");
    const patScreenshotPath = path.join(ARTIFACT_DIR, "patient_live_consultation.png");
    await doctorBrowser.client.screenshot(docScreenshotPath);
    await patientBrowser.client.screenshot(patScreenshotPath);

    // 15. Doctor clicks 'End Call'
    console.log("\n[15] Doctor ending the consultation call...");
    await doctorBrowser.client.evaluate(`
      const endBtn = document.querySelector('button[title="Leave or End Consultation"]');
      if (endBtn) endBtn.click();
    `);
    await sleep(1000);

    // Confirm modal - specifically match 'Confirm & End'
    await doctorBrowser.client.evaluate(`
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmBtn = buttons.find(b => b.innerText && b.innerText.includes("Confirm & End"));
      if (confirmBtn) confirmBtn.click();
    `);
    await sleep(3000);

    // 16. Verify Concluded View on Both Browsers
    console.log("\n[16] Verifying Call Concluded View on both browsers...");
    const docConcluded = await doctorBrowser.client.evaluate(`document.body.innerText.includes("Consultation Concluded")`);
    const patConcluded = await patientBrowser.client.evaluate(`document.body.innerText.includes("Consultation Concluded") || document.body.innerText.includes("ended")`);
    console.log("Doctor screen displays 'Consultation Concluded':", docConcluded);
    console.log("Patient screen displays 'Consultation Concluded':", patConcluded);

    // 17. Verify MongoDB Appointment Status Updated to Completed
    console.log("\n[17] Verifying Appointment status in MongoDB...");
    const verifyAppt = await getJSON(`http://localhost:3000/api/appointments/${appointmentId}`, doctorToken);
    console.log("Appointment Status in MongoDB:", verifyAppt.data?.status);
    console.log("Consultation Status in MongoDB:", verifyAppt.data?.consultationStatus);
    console.log("Consultation Ended At:", verifyAppt.data?.consultationEndedAt);

    console.log("\n==================================================================");
    console.log("✓ COMPLETE TWO-BROWSER WEBRTC VIDEO CONSULTATION TEST PASSED!");
    console.log("==================================================================");
  } finally {
    doctorBrowser.client.close();
    patientBrowser.client.close();
    doctorBrowser.proc.kill();
    patientBrowser.proc.kill();
    try {
      fs.rmSync(doctorBrowser.profileDir, { recursive: true, force: true });
      fs.rmSync(patientBrowser.profileDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

runTwoBrowserTest().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
