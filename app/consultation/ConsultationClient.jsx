"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  MessageSquare,
  PhoneOff,
  HeartPulse,
  Clock,
  Calendar,
  User as UserIcon,
  AlertCircle,
  FileText,
  Send,
  X,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  UserCheck,
  Volume2,
  Terminal,
  Activity,
} from "lucide-react";

export default function ConsultationClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  // Room & Appointment State
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [callEndedReason, setCallEndedReason] = useState("");

  // Connection State: 'initializing' | 'requesting_media' | 'waiting' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'ended'
  const [connectionState, setConnectionState] = useState("initializing");
  const [connectionMessage, setConnectionMessage] = useState("Initializing consultation room...");

  // Media Streams State
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Media Track States
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaPermissionDenied, setMediaPermissionDenied] = useState(false);
  const [mediaErrorMessage, setMediaErrorMessage] = useState("");

  // Diagnostic panel & telemetry
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [signalingConnected, setSignalingConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [pcState, setPcState] = useState("new");
  const [iceState, setIceState] = useState("new");
  const [iceGatheringState, setIceGatheringState] = useState("new");
  const [signalingState, setSignalingState] = useState("stable");
  const [signalStats, setSignalStats] = useState({ sent: 0, received: 0 });

  // Call duration counter
  const [callDuration, setCallDuration] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // In-call UI Panels
  const [endCallModalOpen, setEndCallModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Refs for WebRTC and Media to prevent closure staleness
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Room & Role Refs
  const roomDataRef = useRef(null);
  const myRoleRef = useRef(null);
  const roomIdRef = useRef(null);
  const iceServersRef = useRef([
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ]);

  // Signaling & Negotiation Refs
  const pollingIntervalRef = useRef(null);
  const lastSignalIdRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const isSettingRemoteAnswerPendingRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Sync state to refs immediately
  const updateRoomData = (data) => {
    roomDataRef.current = data;
    myRoleRef.current = data?.roleInCall || null;
    roomIdRef.current = data?.roomId || `consultation_room_${appointmentId}`;
    setRoomData(data);
  };

  // 1. Authentication & Room Verification Lifecycle
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/consultation?appointmentId=${appointmentId || ""}`)}`);
      return;
    }

    if (user && !appointmentId) {
      setLoading(false);
      setAccessError("No appointment selected for consultation. Please select an active appointment from your dashboard.");
      return;
    }

    if (user && appointmentId) {
      fetchRoomDetails();
    }

    return () => {
      cleanupCall();
    };
  }, [user, appointmentId, authLoading, isAuthenticated]);

  // 2. Attach Local Video whenever DOM element or stream updates
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      if (localVideoRef.current.srcObject !== localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch((err) => {
          console.warn("[WebRTC] Local video play error:", err);
        });
      }
    }
  }, [loading, localStream]);

  // 3. Attach Remote Video whenever DOM element or stream updates
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch((err) => {
          console.warn("[WebRTC] Remote video play error:", err);
        });
      }
    }
  }, [loading, remoteStream, connectionState]);

  // 4. Timer when connected
  useEffect(() => {
    let timer = null;
    if (isTimerRunning) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning]);

  // 5. Scroll chat to bottom
  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen]);

  // 6. In-Call Chat polling
  useEffect(() => {
    if (chatOpen && appointmentId) {
      fetchChatMessages();
      const chatInterval = setInterval(fetchChatMessages, 3000);
      return () => clearInterval(chatInterval);
    }
  }, [chatOpen, appointmentId]);

  // Fetch Room Authorization and Configuration
  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      setAccessError("");
      setConnectionState("initializing");
      setConnectionMessage("Validating consultation credentials and security...");

      const res = await apiGet(`/consultation/room?appointmentId=${appointmentId}`);
      if (res.success && res.data) {
        updateRoomData(res.data);

        if (res.data.iceServers && res.data.iceServers.length > 0) {
          iceServersRef.current = res.data.iceServers;
        }

        if (res.data.consultationStatus === "completed" || res.data.status === "completed") {
          setCallEnded(true);
          setCallEndedReason("This consultation session has already concluded.");
          setConnectionState("ended");
          setLoading(false);
          return;
        }

        // Start media acquisition & WebRTC
        await startMediaAndJoin(res.data);
      } else {
        setAccessError(res.message || "Failed to enter consultation room.");
        setConnectionState("error");
      }
    } catch (err) {
      console.error("[Room Init Error]:", err);
      setAccessError(err.message || "Unable to authorize consultation room.");
      setConnectionState("error");
    } finally {
      setLoading(false);
    }
  };

  // Acquire Media (Camera & Mic) and begin Signaling
  const startMediaAndJoin = async (room) => {
    try {
      setConnectionState("requesting_media");
      setConnectionMessage("Requesting camera and microphone access...");
      setMediaPermissionDenied(false);
      setMediaErrorMessage("");

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (mediaErr) {
        console.warn("[getUserMedia error, evaluating cause]:", mediaErr);
        if (mediaErr.name === "NotAllowedError" || mediaErr.name === "PermissionDeniedError") {
          setMediaPermissionDenied(true);
          setMediaErrorMessage("Camera and microphone permission was denied. Please allow access in browser site settings.");
          setConnectionState("error");
          return;
        } else if (mediaErr.name === "NotFoundError" || mediaErr.name === "DevicesNotFoundError") {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            setCameraActive(false);
          } catch (audioErr) {
            setMediaErrorMessage("No compatible camera or microphone device found.");
            setConnectionState("error");
            return;
          }
        } else if (mediaErr.name === "NotReadableError" || mediaErr.name === "TrackStartError") {
          setMediaErrorMessage("Your camera or microphone is currently in use by another program. Please close it and retry.");
          setConnectionState("error");
          return;
        } else {
          setMediaErrorMessage(`Media access error: ${mediaErr.message || mediaErr.name}`);
          setConnectionState("error");
          return;
        }
      }

      // Verify track states
      const vTracks = stream.getVideoTracks();
      const aTracks = stream.getAudioTracks();
      console.log(`[Media Initialized] Video tracks: ${vTracks.length}, Audio tracks: ${aTracks.length}`);

      localStreamRef.current = stream;
      setLocalStream(stream);

      // Force attach to video element if it already exists
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((err) => console.warn("[WebRTC] Play promise notice:", err));
      }

      // Initialize WebRTC Peer Connection
      initializePeerConnection(room);

      // Log role-specific join message
      const role = room.roleInCall;
      if (role === "doctor") {
        console.log("[WebRTC] Doctor joined room");
      } else {
        console.log("[WebRTC] Patient joined room");
      }

      // Send 'join' signal to signaling backend
      await sendSignal("join", { role, name: user?.name });
      setConnectionState("waiting");
      setConnectionMessage("Waiting for the other participant...");

      // Start Signal Polling
      startSignalPolling();
    } catch (err) {
      console.error("[Media & Join Error]:", err);
      setMediaErrorMessage("Unexpected error configuring audio/video devices.");
      setConnectionState("error");
    }
  };

  // Initialize RTCPeerConnection with STUN/TURN configuration
  const initializePeerConnection = (room) => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
    }

    const pc = new RTCPeerConnection({
      iceServers: iceServersRef.current,
      iceCandidatePoolSize: 10,
    });

    peerConnectionRef.current = pc;
    setPcState(pc.connectionState || "new");
    setIceState(pc.iceConnectionState || "new");
    setSignalingState(pc.signalingState || "stable");

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Remote track arrived
    pc.ontrack = (event) => {
      console.log("[WebRTC] Received remote stream track:", event.track.kind);
      let stream = event.streams && event.streams[0];
      if (!stream) {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(event.track);
        stream = remoteStreamRef.current;
      } else {
        remoteStreamRef.current = stream;
      }

      setRemoteStream(stream);
      setRemoteConnected(true);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch((err) => {
          console.warn("[WebRTC] Autoplay restricted on remote video:", err);
        });
      }

      setConnectionState("connected");
      setConnectionMessage("Connected");
      setIsTimerRunning(true);
    };

    // ICE candidate generated locally -> send via signaling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal("ice-candidate", event.candidate);
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log("[WebRTC] Peer connection state:", state);
      setPcState(state);

      if (state === "connected") {
        console.log("[WebRTC] Peer connection state: connected");
        setConnectionState("connected");
        setConnectionMessage("Connected");
        setIsTimerRunning(true);
      } else if (state === "disconnected") {
        setConnectionState("reconnecting");
        setConnectionMessage("Connection interrupted. Re-establishing link...");
      } else if (state === "failed") {
        console.warn("[WebRTC] Peer connection failed. Attempting ICE restart...");
        restartIce();
      } else if (state === "closed") {
        setIsTimerRunning(false);
      }
    };

    // ICE Connection state changes
    pc.oniceconnectionstatechange = () => {
      const iceConnState = pc.iceConnectionState;
      console.log("[WebRTC] ICE connection state:", iceConnState);
      setIceState(iceConnState);

      if (iceConnState === "connected" || iceConnState === "completed") {
        setConnectionState("connected");
        setConnectionMessage("Connected");
        setIsTimerRunning(true);
      } else if (iceConnState === "failed") {
        console.warn("[WebRTC] ICE connection failed.");
        restartIce();
      }
    };

    // ICE Gathering State
    pc.onicegatheringstatechange = () => {
      setIceGatheringState(pc.iceGatheringState);
    };

    // Signaling State
    pc.onsignalingstatechange = () => {
      setSignalingState(pc.signalingState);
    };

    return pc;
  };

  // Send a signal via POST /api/consultation/signal
  const sendSignal = async (type, payload) => {
    try {
      setSignalStats((prev) => ({ ...prev, sent: prev.sent + 1 }));
      await apiPost("/consultation/signal", {
        appointmentId,
        type,
        payload,
      });
    } catch (err) {
      console.warn("[Send Signal Error]:", type, err);
    }
  };

  // Signal Polling Loop using Mongo ObjectId cursor to prevent missed signals & clock skew
  const startSignalPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log("[WebRTC] Socket connected");
    setSignalingConnected(true);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const queryParam = lastSignalIdRef.current
          ? `afterId=${encodeURIComponent(lastSignalIdRef.current)}`
          : "";
        const url = `/consultation/signal?appointmentId=${appointmentId}${queryParam ? `&${queryParam}` : ""}`;

        const res = await apiGet(url);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setSignalStats((prev) => ({ ...prev, received: prev.received + res.data.length }));

          for (const signal of res.data) {
            lastSignalIdRef.current = signal._id;
            await handleIncomingSignal(signal);
          }
        }
      } catch (err) {
        console.warn("[Signal Poll Error]:", err);
      }
    }, 750);
  };

  // Handle incoming signaling messages from peer using Perfect Negotiation
  const handleIncomingSignal = async (signal) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    const { type, payload } = signal;
    const myRole = myRoleRef.current;
    const isPolite = myRole !== "doctor"; // Doctor is impolite, Patient is polite

    switch (type) {
      case "join": {
        console.log("[WebRTC] Remote participant detected");
        setConnectionState("connecting");
        setConnectionMessage("Establishing secure video connection...");

        // Respond with ready signal
        await sendSignal("ready", { role: myRole });

        // Deterministic offer creation: Doctor initiates SDP offer
        if (myRole === "doctor") {
          await createAndSendOffer();
        }
        break;
      }

      case "ready": {
        console.log("[WebRTC] Remote participant detected");
        setConnectionState("connecting");
        setConnectionMessage("Establishing secure video connection...");

        // If I am the doctor and haven't created an offer yet, initiate now
        if (myRole === "doctor" && pc.signalingState === "stable") {
          await createAndSendOffer();
        }
        break;
      }

      case "offer": {
        console.log("[WebRTC] Offer received from peer");
        try {
          const offerCollision = makingOfferRef.current || pc.signalingState !== "stable";
          ignoreOfferRef.current = !isPolite && offerCollision;

          if (ignoreOfferRef.current) {
            console.warn("[WebRTC] Impolite peer ignoring conflicting offer");
            return;
          }

          if (offerCollision && isPolite) {
            console.log("[WebRTC] Polite peer rolling back for incoming offer");
            await pc.setLocalDescription({ type: "rollback" });
          }

          setConnectionState("connecting");
          setConnectionMessage("Establishing secure video connection...");

          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          console.log("[WebRTC] Remote description (offer) set successfully");

          // Drain any queued ICE candidates
          await drainIceCandidates();

          // Create and set local answer
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log("[WebRTC] Answer created");

          await sendSignal("answer", answer);
        } catch (err) {
          console.error("[Handle Offer Error]:", err);
        }
        break;
      }

      case "answer": {
        console.log("[WebRTC] Answer received");
        try {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(payload));
            console.log("[WebRTC] Remote description (answer) set successfully");

            // Drain any queued ICE candidates
            await drainIceCandidates();
          } else {
            console.warn("[WebRTC] Received answer but signalingState is:", pc.signalingState);
          }
        } catch (err) {
          console.error("[Handle Answer Error]:", err);
        }
        break;
      }

      case "ice-candidate": {
        console.log("[WebRTC] ICE candidate received");
        if (payload) {
          try {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(payload));
            } else {
              iceCandidateQueueRef.current.push(payload);
            }
          } catch (err) {
            console.warn("[Add ICE Candidate Error]:", err);
          }
        }
        break;
      }

      case "end-call":
      case "leave": {
        setCallEnded(true);
        setCallEndedReason("The other participant has ended the consultation session.");
        setConnectionState("ended");
        cleanupMedia();
        break;
      }

      default:
        break;
    }
  };

  // Drain Queued ICE Candidates after remote description is ready
  const drainIceCandidates = async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;

    while (iceCandidateQueueRef.current.length > 0) {
      const candidate = iceCandidateQueueRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("[WebRTC] Error adding drained ICE candidate:", e);
      }
    }
  };

  // Create and send SDP Offer
  const createAndSendOffer = async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      makingOfferRef.current = true;
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      if (pc.signalingState !== "stable") {
        console.warn("[WebRTC] Signaling state not stable before local offer, skipping");
        return;
      }

      await pc.setLocalDescription(offer);
      console.log("[WebRTC] Offer created");
      await sendSignal("offer", offer);
    } catch (err) {
      console.error("[Create Offer Error]:", err);
    } finally {
      makingOfferRef.current = false;
    }
  };

  // Restart ICE on connection failure
  const restartIce = async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    try {
      console.log("[WebRTC] Initiating ICE restart offer...");
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      await sendSignal("offer", offer);
    } catch (err) {
      console.warn("[ICE Restart Error]:", err);
    }
  };

  // Manual Retry Connection handler
  const handleRetryConnection = async () => {
    console.log("[WebRTC] Manual Retry Connection requested");
    setConnectionState("connecting");
    setConnectionMessage("Establishing secure video connection...");

    if (roomDataRef.current) {
      initializePeerConnection(roomDataRef.current);
      iceCandidateQueueRef.current = [];
      await sendSignal("join", { role: myRoleRef.current, name: user?.name });
      if (myRoleRef.current === "doctor") {
        await createAndSendOffer();
      }
    } else {
      fetchRoomDetails();
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micActive;
        setMicActive(!micActive);
      }
    } else {
      setMicActive(!micActive);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraActive;
        setCameraActive(!cameraActive);
      }
    } else {
      setCameraActive(!cameraActive);
    }
  };

  // Screen Sharing
  const toggleScreenShare = async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace track in peer connection
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.warn("[Screen Share Cancelled/Error]:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    const pc = peerConnectionRef.current;
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    if (localStreamRef.current && pc) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }

    setIsScreenSharing(false);
  };

  // End Call Handler
  const handleEndCall = async () => {
    setEndCallModalOpen(false);
    try {
      await sendSignal("end-call", { reason: "User clicked End Consultation" });
      await apiPost("/consultation/room", { appointmentId, action: "end" });
    } catch (err) {
      console.warn("[End Call Signal Error]:", err);
    }

    cleanupCall();
    setCallEnded(true);
    setCallEndedReason("You have ended the video consultation session.");
    setConnectionState("ended");
  };

  // Cleanup helper
  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const cleanupCall = () => {
    cleanupMedia();

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
      peerConnectionRef.current = null;
    }

    setIsTimerRunning(false);
    setSignalingConnected(false);
  };

  // In-call chat operations
  const fetchChatMessages = async () => {
    try {
      const res = await apiGet(`/messages?appointmentId=${appointmentId}`);
      if (res.success && Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      console.warn("[Fetch In-Call Chat Error]:", err);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMsg) return;

    const text = chatInput.trim();
    setChatInput("");

    try {
      setSendingMsg(true);
      const res = await apiPost("/messages", {
        appointmentId,
        message: text,
      });
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      alert(err.message || "Failed to deliver message.");
    } finally {
      setSendingMsg(false);
    }
  };

  // Format call duration MM:SS
  const formatDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Access Error View
  if (accessError || !appointmentId) {
    return (
      <div style={{ backgroundColor: "var(--bg-light)", minHeight: "calc(100vh - 76px)", padding: "60px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-panel" style={{ maxWidth: "520px", width: "100%", padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#FEF2F2", color: "#DC2626", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <AlertCircle size={36} />
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: "700", color: "var(--text-dark)", marginBottom: "12px" }}>
            Consultation Access Issue
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "28px" }}>
            {accessError || "No appointment specified. Please select a valid appointment to join the video room."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/appointments" className="btn btn-primary" style={{ gap: "8px" }}>
              <Calendar size={18} /> View My Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading View
  if (loading || authLoading) {
    return (
      <div style={{ backgroundColor: "var(--bg-light)", minHeight: "calc(100vh - 76px)", padding: "80px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-panel" style={{ maxWidth: "460px", width: "100%", padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF" }}>
          <RefreshCw size={36} className="spin" style={{ color: "var(--primary)", marginBottom: "18px" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-dark)", marginBottom: "8px" }}>
            Connecting to Consultation Room
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {connectionMessage}
          </p>
        </div>
      </div>
    );
  }

  // Call Ended / Summary View
  if (callEnded) {
    const returnLink = roomData?.roleInCall === "doctor" ? "/doctor/dashboard" : "/appointments";
    return (
      <div style={{ backgroundColor: "var(--bg-light)", minHeight: "calc(100vh - 76px)", padding: "60px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-panel" style={{ maxWidth: "540px", width: "100%", padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--mint)", color: "var(--primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-dark)", marginBottom: "10px" }}>
            Consultation Concluded
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "20px" }}>
            {callEndedReason || "The video consultation session has ended."}
          </p>

          {callDuration > 0 && (
            <div style={{ backgroundColor: "var(--mint-light)", padding: "14px 20px", borderRadius: "var(--radius-md)", marginBottom: "28px", display: "inline-block" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Call Duration: </span>
              <strong style={{ color: "var(--primary)", fontSize: "1rem" }}>{formatDuration(callDuration)}</strong>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={returnLink} className="btn btn-primary" style={{ gap: "8px" }}>
              <ArrowLeft size={18} /> Return to Dashboard
            </Link>
            {roomData?.roleInCall === "patient" && (
              <Link href="/prescriptions" className="btn btn-outline" style={{ gap: "8px" }}>
                <FileText size={18} /> View Prescriptions
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Device Permission Denied View
  if (mediaPermissionDenied || mediaErrorMessage) {
    return (
      <div style={{ backgroundColor: "var(--bg-light)", minHeight: "calc(100vh - 76px)", padding: "60px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-panel" style={{ maxWidth: "520px", width: "100%", padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#FEF2F2", color: "#DC2626", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <AlertCircle size={36} />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-dark)", marginBottom: "12px" }}>
            Audio & Video Device Permission Required
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "24px" }}>
            {mediaErrorMessage || "MediCare requires camera and microphone permissions to connect you to your live doctor consultation."}
          </p>
          <div style={{ backgroundColor: "var(--bg-light)", padding: "16px", borderRadius: "var(--radius-md)", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "28px" }}>
            <strong>How to resolve:</strong>
            <ul style={{ paddingLeft: "18px", marginTop: "6px", lineHeight: "1.5" }}>
              <li>Click the camera/lock icon in your browser URL address bar.</li>
              <li>Toggle <strong>Camera</strong> and <strong>Microphone</strong> to "Allow".</li>
              <li>Close any other active video call applications (Zoom, Teams, Skype).</li>
              <li>Click the "Retry Connection" button below.</li>
            </ul>
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={() => fetchRoomDetails()} className="btn btn-primary" style={{ gap: "8px" }}>
              <RefreshCw size={16} /> Retry Connection
            </button>
            <Link href="/appointments" className="btn btn-outline">
              Back to Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Video Call Interface Variables
  const isDoctor = roomData?.roleInCall === "doctor";
  const doctor = roomData?.doctor || {};
  const patient = roomData?.patient || {};
  const partnerName = isDoctor ? patient.name || "Patient" : `Dr. ${doctor.name || "Doctor"}`;
  const partnerRole = isDoctor ? "Patient" : doctor.specialization || "Specialist";

  // Dynamic Status Text according to Section 11
  let displayStatus = "Waiting for the other participant...";
  if (connectionState === "connected") {
    displayStatus = "Connected";
  } else if (connectionState === "connecting") {
    displayStatus = "Establishing secure video connection...";
  } else if (connectionState === "error") {
    displayStatus = "Unable to establish video connection.";
  }

  return (
    <div
      style={{
        backgroundColor: "#0B1512",
        color: "#FFFFFF",
        minHeight: "calc(100vh - 76px)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Top Consultation Navigation Header */}
      <header
        style={{
          height: "64px",
          backgroundColor: "rgba(11, 21, 18, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(221, 247, 236, 0.12)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "var(--primary)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HeartPulse size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#FFFFFF" }}>
                MediCare Telehealth Session
              </h3>
              <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "12px", backgroundColor: "rgba(10, 160, 110, 0.2)", color: "var(--mint)" }}>
                HD Encrypted
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
              {partnerName} ({partnerRole}) • Room: {roomData?.roomId}
            </p>
          </div>
        </div>

        {/* Center / Right Call Status, Timer and Diagnostics Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            style={{
              backgroundColor: showDiagnostics ? "var(--primary)" : "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(221, 247, 236, 0.2)",
              color: "#FFFFFF",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
            title="Toggle Developer Diagnostic Panel"
          >
            <Activity size={14} />
            Diagnostics
          </button>

          {isTimerRunning ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10B981",
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.85rem",
                fontWeight: "700",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981", animation: "pulse 1.5s infinite" }} />
              {formatDuration(callDuration)}
            </div>
          ) : (
            <span
              style={{
                backgroundColor: connectionState === "connected" ? "rgba(16, 185, 129, 0.2)" : connectionState === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)",
                color: connectionState === "connected" ? "#10B981" : connectionState === "error" ? "#EF4444" : "#F59E0B",
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8rem",
                fontWeight: "600",
              }}
            >
              ● {displayStatus}
            </span>
          )}
        </div>
      </header>

      {/* Main Room Body */}
      <div style={{ flexGrow: 1, display: "flex", padding: "16px 20px", gap: "20px", position: "relative", overflow: "hidden" }}>
        {/* Main Video Frame */}
        <div
          style={{
            flexGrow: 1,
            backgroundColor: "#13231E",
            borderRadius: "20px",
            border: "1px solid rgba(221, 247, 236, 0.1)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* Remote Live Video Element */}
          <video
            ref={(el) => {
              remoteVideoRef.current = el;
              if (el && remoteStreamRef.current && el.srcObject !== remoteStreamRef.current) {
                el.srcObject = remoteStreamRef.current;
                el.play().catch(() => {});
              }
            }}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: connectionState === "connected" ? "block" : "none",
            }}
          />

          {/* Waiting / Connecting Placeholder when remote stream is not yet active */}
          {connectionState !== "connected" && (
            <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: "480px" }}>
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(10, 160, 110, 0.15)",
                  color: "var(--primary-light)",
                  border: "2px solid var(--primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.4rem",
                  fontWeight: "800",
                  marginBottom: "24px",
                  boxShadow: "0 0 35px rgba(10, 160, 110, 0.25)",
                }}
              >
                {partnerName.charAt(0)}
              </div>

              <h2 style={{ fontSize: "1.65rem", fontWeight: "700", marginBottom: "10px", color: "#FFFFFF" }}>
                {displayStatus}
              </h2>

              <p style={{ color: "#9CA3AF", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "24px" }}>
                {connectionMessage}
              </p>

              {connectionState === "error" && (
                <button
                  onClick={handleRetryConnection}
                  className="btn btn-primary"
                  style={{ gap: "8px", margin: "0 auto 20px auto" }}
                >
                  <RefreshCw size={16} /> Retry Connection
                </button>
              )}

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.85rem",
                  color: "var(--mint)",
                }}
              >
                <ShieldCheck size={16} /> End-to-end encrypted medical consultation
              </div>
            </div>
          )}

          {/* Self Camera Live Preview Box (Picture-in-Picture) */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              width: "220px",
              height: "150px",
              backgroundColor: "#0B1512",
              borderRadius: "16px",
              overflow: "hidden",
              border: "2px solid rgba(221, 247, 236, 0.3)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              zIndex: 10,
            }}
          >
            <video
              ref={(el) => {
                localVideoRef.current = el;
                if (el && localStreamRef.current && el.srcObject !== localStreamRef.current) {
                  el.srcObject = localStreamRef.current;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: isScreenSharing ? "none" : "scaleX(-1)",
                display: cameraActive || isScreenSharing ? "block" : "none",
              }}
            />

            {!cameraActive && !isScreenSharing && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#172722",
                  color: "#9CA3AF",
                  gap: "6px",
                  fontSize: "0.8rem",
                }}
              >
                <VideoOff size={24} />
                <span>Camera Off</span>
              </div>
            )}

            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: "8px",
                backgroundColor: "rgba(0, 0, 0, 0.65)",
                padding: "2px 8px",
                borderRadius: "6px",
                fontSize: "0.72rem",
                fontWeight: "600",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {!micActive && <MicOff size={11} style={{ color: "#EF4444" }} />}
              You ({user?.name})
            </div>
          </div>

          {/* Development Diagnostic Panel Overlay */}
          {showDiagnostics && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                backgroundColor: "rgba(11, 21, 18, 0.95)",
                border: "1px solid rgba(221, 247, 236, 0.25)",
                borderRadius: "14px",
                padding: "16px",
                fontSize: "0.75rem",
                color: "#D1D5DB",
                zIndex: 25,
                width: "320px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px" }}>
                <strong style={{ color: "var(--mint)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Terminal size={14} /> WebRTC Live Diagnostics
                </strong>
                <button onClick={() => setShowDiagnostics(false)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer" }}>
                  <X size={14} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <div>Socket/Signaling:</div>
                <div style={{ color: signalingConnected ? "#10B981" : "#F59E0B", fontWeight: "600" }}>
                  {signalingConnected ? "Connected" : "Disconnected"}
                </div>

                <div>Room:</div>
                <div style={{ color: roomData ? "#10B981" : "#EF4444", fontWeight: "600" }}>
                  {roomData ? "Joined" : "Not Joined"}
                </div>

                <div>Local Camera:</div>
                <div style={{ color: cameraActive && localStream ? "#10B981" : "#EF4444", fontWeight: "600" }}>
                  {cameraActive && localStream ? "Active (Live)" : "Inactive"}
                </div>

                <div>Local Microphone:</div>
                <div style={{ color: micActive && localStream ? "#10B981" : "#EF4444", fontWeight: "600" }}>
                  {micActive && localStream ? "Active (Live)" : "Inactive"}
                </div>

                <div>Remote Participant:</div>
                <div style={{ color: remoteConnected ? "#10B981" : "#F59E0B", fontWeight: "600" }}>
                  {remoteConnected ? "Present" : "Absent"}
                </div>

                <div>Peer Connection:</div>
                <div style={{ color: pcState === "connected" ? "#10B981" : pcState === "failed" ? "#EF4444" : "#F59E0B", fontWeight: "600", textTransform: "capitalize" }}>
                  {pcState}
                </div>

                <div>ICE Connection:</div>
                <div style={{ color: iceState === "connected" || iceState === "completed" ? "#10B981" : iceState === "failed" ? "#EF4444" : "#F59E0B", fontWeight: "600", textTransform: "capitalize" }}>
                  {iceState}
                </div>

                <div>ICE Gathering:</div>
                <div style={{ color: "#9CA3AF", textTransform: "capitalize" }}>
                  {iceGatheringState}
                </div>

                <div>Signaling State:</div>
                <div style={{ color: "#9CA3AF", textTransform: "capitalize" }}>
                  {signalingState}
                </div>

                <div>Queued Candidates:</div>
                <div style={{ color: "#9CA3AF" }}>
                  {iceCandidateQueueRef.current.length}
                </div>

                <div>Signals (Sent / Recv):</div>
                <div style={{ color: "var(--mint)" }}>
                  {signalStats.sent} / {signalStats.received}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Information Side Panel */}
        <aside
          style={{
            width: "330px",
            backgroundColor: "#111F1B",
            borderRadius: "20px",
            border: "1px solid rgba(221, 247, 236, 0.12)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flexShrink: 0,
          }}
          className="consultation-sidebar"
        >
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px", color: "var(--mint)" }}>
              Appointment Details
            </h4>
            <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "10px", color: "#D1D5DB" }}>
              <div>
                <span style={{ color: "#9CA3AF", fontSize: "0.78rem" }}>Consultation Reason</span>
                <p style={{ fontWeight: "600", color: "#FFFFFF", marginTop: "2px" }}>{roomData?.reason}</p>
              </div>

              <div>
                <span style={{ color: "#9CA3AF", fontSize: "0.78rem" }}>Scheduled Time</span>
                <p style={{ color: "#FFFFFF", marginTop: "2px" }}>
                  {roomData?.appointmentDate} at {roomData?.appointmentTime}
                </p>
              </div>

              <div>
                <span style={{ color: "#9CA3AF", fontSize: "0.78rem" }}>{isDoctor ? "Patient Info" : "Doctor Profile"}</span>
                <p style={{ fontWeight: "700", color: "#FFFFFF", marginTop: "2px" }}>{partnerName}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--mint)" }}>
                  {isDoctor ? patient.email || patient.phone : `${doctor.specialization} • ${doctor.qualification}`}
                </p>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: 0 }} />

          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", color: "#FFFFFF" }}>
              Healthcare Portals
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link
                href="/prescriptions"
                target="_blank"
                className="btn btn-outline"
                style={{
                  justifyContent: "flex-start",
                  gap: "8px",
                  fontSize: "0.825rem",
                  borderColor: "rgba(221, 247, 236, 0.2)",
                  color: "var(--mint)",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                }}
              >
                <FileText size={16} /> Open Prescriptions Vault
              </Link>
              <Link
                href="/medical-records"
                target="_blank"
                className="btn btn-outline"
                style={{
                  justifyContent: "flex-start",
                  gap: "8px",
                  fontSize: "0.825rem",
                  borderColor: "rgba(221, 247, 236, 0.2)",
                  color: "var(--mint)",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                }}
              >
                <FileText size={16} /> View Medical Reports
              </Link>
            </div>
          </div>

          <div style={{ marginTop: "auto", padding: "14px", backgroundColor: "rgba(10, 160, 110, 0.1)", borderRadius: "var(--radius-md)", border: "1px dashed var(--primary)" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--mint)", display: "block", marginBottom: "4px", fontWeight: "600" }}>
              Active Security Guard
            </span>
            <p style={{ fontSize: "0.75rem", color: "#9CA3AF", lineHeight: "1.4" }}>
              Only authenticated patient and doctor participants are allowed into this peer video session.
            </p>
          </div>
        </aside>

        {/* In-Call Chat Drawer */}
        {chatOpen && (
          <div
            style={{
              position: "absolute",
              right: "20px",
              bottom: "20px",
              top: "20px",
              width: "360px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              zIndex: 30,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              color: "var(--text-dark)",
            }}
          >
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--mint)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageSquare size={18} /> In-Consultation Chat
              </h4>
              <button onClick={() => setChatOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--primary)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flexGrow: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  No messages yet. Send a message to {partnerName}.
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId?._id === user._id || m.senderId === user._id;
                  return (
                    <div key={m._id} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: isMine ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                          backgroundColor: isMine ? "var(--mint)" : "#F3F4F6",
                          color: isMine ? "var(--primary)" : "var(--text-dark)",
                          fontSize: "0.85rem",
                          fontWeight: "500",
                        }}
                      >
                        {m.message}
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px", display: "block", textAlign: isMine ? "right" : "left" }}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendChat} style={{ padding: "12px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{ flexGrow: 1, padding: "10px", borderRadius: "10px", border: "1px solid var(--border-color)", fontSize: "0.85rem" }}
              />
              <button type="submit" disabled={sendingMsg} className="btn btn-primary" style={{ padding: "10px 14px", borderRadius: "10px" }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <footer
        style={{
          height: "80px",
          backgroundColor: "rgba(11, 21, 18, 0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(221, 247, 236, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          zIndex: 20,
        }}
      >
        {/* Toggle Audio */}
        <button
          onClick={toggleMic}
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: micActive ? "rgba(255, 255, 255, 0.15)" : "#EF4444",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          title={micActive ? "Mute Microphone" : "Unmute Microphone"}
        >
          {micActive ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        {/* Toggle Camera */}
        <button
          onClick={toggleCamera}
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: cameraActive ? "rgba(255, 255, 255, 0.15)" : "#EF4444",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          title={cameraActive ? "Turn Off Video Camera" : "Turn On Video Camera"}
        >
          {cameraActive ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: isScreenSharing ? "var(--primary)" : "rgba(255, 255, 255, 0.15)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          title={isScreenSharing ? "Stop Screen Sharing" : "Share Your Screen"}
        >
          <Monitor size={22} />
        </button>

        {/* In-Call Chat Drawer Toggle */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: chatOpen ? "var(--primary)" : "rgba(255, 255, 255, 0.15)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          title="Toggle Consultation Chat"
        >
          <MessageSquare size={22} />
        </button>

        {/* End Call Button */}
        <button
          onClick={() => setEndCallModalOpen(true)}
          style={{
            height: "52px",
            borderRadius: "var(--radius-full)",
            border: "none",
            backgroundColor: "#DC2626",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "700",
            padding: "0 22px",
            gap: "8px",
            boxShadow: "0 4px 16px rgba(220, 38, 38, 0.4)",
            transition: "all 0.2s",
          }}
          title="Leave or End Consultation"
        >
          <PhoneOff size={20} />
          <span>End Call</span>
        </button>
      </footer>

      {/* End Call Confirmation Modal */}
      {endCallModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="glass-panel"
            style={{
              backgroundColor: "#FFFFFF",
              color: "var(--text-dark)",
              borderRadius: "24px",
              padding: "36px",
              maxWidth: "440px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#FEF2F2", color: "#DC2626", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <PhoneOff size={32} />
            </div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "8px" }}>
              End Consultation Call?
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", lineHeight: "1.5", marginBottom: "28px" }}>
              Are you sure you want to end this live session with {partnerName}? The call will conclude for both participants.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setEndCallModalOpen(false)}
                className="btn btn-outline"
                style={{ flex: 1, padding: "12px" }}
              >
                Cancel
              </button>
              <button
                onClick={handleEndCall}
                className="btn btn-primary"
                style={{ flex: 1, padding: "12px", backgroundColor: "#DC2626", borderColor: "#DC2626" }}
              >
                Confirm & End
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 900px) {
          .consultation-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
