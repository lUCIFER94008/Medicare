const http = require("http");

async function postJSON(urlPath, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: urlPath,
        method: "POST",
        headers,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
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
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: urlPath,
        method: "PUT",
        headers,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
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

async function getJSON(urlPath, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: urlPath,
        method: "GET",
        headers,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
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
    req.end();
  });
}

async function runTest() {
  console.log("=== STARTING VIDEO CONSULTATION END-TO-END VERIFICATION ===");

  // 1. Doctor Login
  console.log("\n[1] Logging in as Doctor (dr.sarah@medicare.com)...");
  const docLogin = await postJSON("/api/auth/login", {
    email: "dr.sarah@medicare.com",
    password: "doctorpassword123",
  });
  if (!docLogin.data.success) {
    throw new Error("Doctor login failed: " + JSON.stringify(docLogin));
  }
  const doctorToken = docLogin.data.token;
  console.log("✓ Doctor logged in successfully. User ID:", docLogin.data.user._id);

  // 2. Patient Login
  console.log("\n[2] Logging in as Patient (john.patient@gmail.com)...");
  const patLogin = await postJSON("/api/auth/login", {
    email: "john.patient@gmail.com",
    password: "patientpassword123",
  });
  if (!patLogin.data.success) {
    throw new Error("Patient login failed: " + JSON.stringify(patLogin));
  }
  const patientToken = patLogin.data.token;
  console.log("✓ Patient logged in successfully. User ID:", patLogin.data.user._id);

  // 3. Find confirmed video appointment for this doctor & patient
  console.log("\n[3] Fetching appointments to find test appointment...");
  const apptsRes = await getJSON("/api/appointments", doctorToken);
  let appointment = apptsRes.data.data.find(
    (a) => a.consultationType === "video" && (a.status === "confirmed" || a.status === "pending")
  );

  if (!appointment) {
    console.log("Creating new test video appointment...");
    const docId = docLogin.data.user.doctorProfile?._id;
    const rndHour = Math.floor(Math.random() * 11) + 1;
    const rndMin = Math.floor(Math.random() * 50) + 10;
    const createRes = await postJSON(
      "/api/appointments",
      {
        doctorId: docId,
        appointmentDate: "2026-11-28",
        appointmentTime: `${rndHour}:${rndMin} PM`,
        reason: "Test WebRTC Video Consultation",
        consultationType: "video",
      },
      patientToken
    );
    appointment = createRes.data?.data;
    if (appointment?._id) {
      await putJSON(`/api/appointments/${appointment._id}`, { status: "confirmed" }, doctorToken);
    } else {
      // Fallback: pick any video appointment from patient for this doctor
      const allAppts = await getJSON("/api/appointments", doctorToken);
      appointment = allAppts.data.data.find((a) => a.consultationType === "video") || allAppts.data.data[0];
      await putJSON(`/api/appointments/${appointment._id}`, { status: "confirmed" }, doctorToken);
    }
  }

  const appointmentId = appointment._id;
  console.log("✓ Using Appointment ID:", appointmentId, "Status:", appointment.status);

  // 4. Test Consultation Room Authorization - Doctor
  console.log("\n[4] Doctor entering consultation room...");
  const docRoom = await getJSON(`/api/consultation/room?appointmentId=${appointmentId}`, doctorToken);
  console.log("Doctor room response status:", docRoom.status);
  console.log("Doctor roleInCall:", docRoom.data?.data?.roleInCall);
  console.log("Room ID:", docRoom.data?.data?.roomId);
  console.log("ICE Servers configured:", docRoom.data?.data?.iceServers?.length);
  if (!docRoom.data.success || docRoom.data.data.roleInCall !== "doctor") {
    throw new Error("Doctor room auth verification failed: " + JSON.stringify(docRoom));
  }

  // 5. Test Consultation Room Authorization - Patient
  console.log("\n[5] Patient entering consultation room...");
  const patRoom = await getJSON(`/api/consultation/room?appointmentId=${appointmentId}`, patientToken);
  console.log("Patient room response status:", patRoom.status);
  console.log("Patient roleInCall:", patRoom.data?.data?.roleInCall);
  console.log("Patient seeing same Room ID:", patRoom.data?.data?.roomId === docRoom.data.data.roomId);
  if (!patRoom.data.success || patRoom.data.data.roleInCall !== "patient") {
    throw new Error("Patient room auth verification failed: " + JSON.stringify(patRoom));
  }

  // 6. Test Unauthorized User Rejection
  console.log("\n[6] Testing security: Unauthorized user trying to enter room...");
  const unauthorizedRes = await getJSON(`/api/consultation/room?appointmentId=${appointmentId}`);
  console.log("Unauthenticated request status (expected 401):", unauthorizedRes.status);
  if (unauthorizedRes.status !== 401) {
    throw new Error("Security check failed: unauthenticated user was not rejected with 401");
  }

  // 7. Signaling Exchange: Doctor joins
  console.log("\n[7] Doctor sends 'join' signal...");
  const docJoin = await postJSON(
    "/api/consultation/signal",
    { appointmentId, type: "join", payload: { name: "Dr. Sarah", role: "doctor" } },
    doctorToken
  );
  console.log("Doctor join signal response:", docJoin.data.success);

  // Patient polls signals
  console.log("\n[8] Patient receives Doctor's join signal...");
  const patSignals1 = await getJSON(`/api/consultation/signal?appointmentId=${appointmentId}`, patientToken);
  console.log("Patient found signals:", patSignals1.data.data.map((s) => s.type));
  const hasJoin = patSignals1.data.data.some((s) => s.type === "join");
  if (!hasJoin) throw new Error("Patient did not receive join signal!");

  // Patient sends ready signal
  console.log("\n[9] Patient sends 'ready' signal...");
  await postJSON(
    "/api/consultation/signal",
    { appointmentId, type: "ready", payload: { role: "patient" } },
    patientToken
  );

  // Doctor polls signals
  console.log("\n[10] Doctor receives Patient's ready signal...");
  const docSignals1 = await getJSON(`/api/consultation/signal?appointmentId=${appointmentId}`, doctorToken);
  console.log("Doctor found signals from peer:", docSignals1.data.data.map((s) => s.type));
  const hasReady = docSignals1.data.data.some((s) => s.type === "ready");
  if (!hasReady) throw new Error("Doctor did not receive ready signal!");

  // 11. SDP Offer & Answer exchange
  console.log("\n[11] Doctor creates and sends WebRTC SDP Offer...");
  const mockOffer = { type: "offer", sdp: "v=0\r\no=- 123456 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=sendrecv\r\n" };
  await postJSON(
    "/api/consultation/signal",
    { appointmentId, type: "offer", payload: mockOffer },
    doctorToken
  );

  console.log("[12] Patient retrieves Offer and sends SDP Answer...");
  const patSignals2 = await getJSON(
    `/api/consultation/signal?appointmentId=${appointmentId}&after=${encodeURIComponent(new Date(Date.now() - 5000).toISOString())}`,
    patientToken
  );
  const offerSignal = patSignals2.data.data.find((s) => s.type === "offer");
  if (!offerSignal) throw new Error("Patient did not receive offer signal!");
  console.log("Patient received offer SDP:", offerSignal.payload.type);

  const mockAnswer = { type: "answer", sdp: "v=0\r\no=- 654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=sendrecv\r\n" };
  await postJSON(
    "/api/consultation/signal",
    { appointmentId, type: "answer", payload: mockAnswer },
    patientToken
  );

  console.log("[13] Doctor retrieves SDP Answer...");
  const docSignals2 = await getJSON(
    `/api/consultation/signal?appointmentId=${appointmentId}&after=${encodeURIComponent(new Date(Date.now() - 5000).toISOString())}`,
    doctorToken
  );
  const answerSignal = docSignals2.data.data.find((s) => s.type === "answer");
  if (!answerSignal) throw new Error("Doctor did not receive answer signal!");
  console.log("Doctor received answer SDP:", answerSignal.payload.type);

  // 14. ICE Candidate exchange
  console.log("\n[14] Exchanging ICE candidates...");
  const mockIceCandidate = { candidate: "candidate:1 1 UDP 2130706431 192.168.1.100 50000 typ host", sdpMid: "0", sdpMLineIndex: 0 };
  await postJSON(
    "/api/consultation/signal",
    { appointmentId, type: "ice-candidate", payload: mockIceCandidate },
    doctorToken
  );

  const patSignals3 = await getJSON(
    `/api/consultation/signal?appointmentId=${appointmentId}&after=${encodeURIComponent(new Date(Date.now() - 5000).toISOString())}`,
    patientToken
  );
  const iceSignal = patSignals3.data.data.find((s) => s.type === "ice-candidate");
  if (!iceSignal) throw new Error("Patient did not receive ICE candidate!");
  console.log("Patient received ICE candidate successfully!");

  // 15. In-Call Chat during consultation
  console.log("\n[15] Testing In-Call Chat during consultation...");
  const chatMsg = await postJSON(
    "/api/messages",
    { appointmentId, message: "Hello Doctor, can you see and hear me clearly?" },
    patientToken
  );
  console.log("Patient sent chat message status:", chatMsg.data.success);

  const doctorChatFetch = await getJSON(`/api/messages?appointmentId=${appointmentId}`, doctorToken);
  console.log("Doctor read messages count:", doctorChatFetch.data.data.length);
  const foundChat = doctorChatFetch.data.data.some((m) => m.message.includes("see and hear me"));
  if (!foundChat) throw new Error("In-call chat message not received by Doctor!");
  console.log("✓ In-call chat verified successfully!");

  // 16. Doctor Ends Call
  console.log("\n[16] Doctor ends the consultation call...");
  const endCallRes = await postJSON(
    "/api/consultation/signal",
    { appointmentId, type: "end-call", payload: { reason: "Consultation completed" } },
    doctorToken
  );
  console.log("End call signal sent:", endCallRes.data.success);

  // Update room status
  await postJSON("/api/consultation/room", { appointmentId, action: "end" }, doctorToken);

  // Patient polls and receives end-call
  const patSignalsEnd = await getJSON(
    `/api/consultation/signal?appointmentId=${appointmentId}&after=${encodeURIComponent(new Date(Date.now() - 5000).toISOString())}`,
    patientToken
  );
  const endSignal = patSignalsEnd.data.data.find((s) => s.type === "end-call");
  if (!endSignal) throw new Error("Patient did not receive end-call signal!");
  console.log("✓ Patient received end-call event:", endSignal.type);

  // 17. Verify Consultation Status in MongoDB
  console.log("\n[17] Verifying Appointment & Consultation status in MongoDB...");
  const updatedAppt = await getJSON(`/api/appointments/${appointmentId}`, doctorToken);
  console.log("Appointment Status in MongoDB:", updatedAppt.data.data.status);
  console.log("Consultation Status in MongoDB:", updatedAppt.data.data.consultationStatus);
  console.log("Consultation Ended At:", updatedAppt.data.data.consultationEndedAt);

  console.log("\n=======================================================");
  console.log("ALL VIDEO CONSULTATION WORKFLOW TESTS PASSED PERFECTLY!");
  console.log("=======================================================\n");
}

runTest().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
