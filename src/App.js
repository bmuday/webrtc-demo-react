import "./index.css";
import { useRef } from "react";
import { auth, db, storage } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const App = () => {
  const webcamVideo = useRef(null);
  const remoteVideo = useRef(null);
  const callButton = useRef(null);
  const callInput = useRef(null);
  const answerButton = useRef(null);
  const webcamButton = useRef(null);

  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  // Global State
  let pc = new RTCPeerConnection(servers);
  let localStream = null;
  let remoteStream = null;

  // 1. Setup media sources
  const setupMediaSources = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    remoteStream = new MediaStream();

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Pull tracks from remote stream, add to video stream
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    webcamVideo.current.srcObject = localStream;
    remoteVideo.current.srcObject = remoteStream;

    // callButton.current.disabled = false;
    // answerButton.current.disabled = false;
    // webcamButton.current.disabled = true;
  };

  // 2. Create an offer
  const createAnOffer = async () => {
    // Reference Firestore collection
    const callDoc = doc(collection(db, "calls"));
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    callInput.current.value = callDoc.id;

    // Get candidates for caller, save to db
    pc.onicecandidate = (event) => {
      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };

    // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer });

    // Listen for remote answer
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    // When answered, add candidate to peer connection
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  // 3. Answer the call with the unique ID
  const answerCall = async () => {
    console.log("answering call...");
    const callId = callInput.current.value;
    const callDoc = doc(db, "calls", callId);
    const answerCandidates = collection(
      db,
      "calls",
      callId,
      "answerCandidates"
    );
    const offerCandidates = collection(db, "calls", callId, "offerCandidates");

    pc.onicecandidate = (event) => {
      event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callData = (await getDoc(callDoc)).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(callDoc, { answer });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change, "change");
        if (change.type === "added") {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  return (
    <>
      <h2>1. Start your Webcam</h2>
      <div className="videos">
        <span>
          <h3>Local Stream</h3>
          <video
            id="webcamVideo"
            autoPlay
            playsInline
            ref={webcamVideo}
          ></video>
        </span>
        <span>
          <h3>Remote Stream</h3>
          <video
            id="remoteVideo"
            autoPlay
            playsInline
            ref={remoteVideo}
          ></video>
        </span>
      </div>

      <button id="webcamButton" onClick={setupMediaSources} ref={webcamButton}>
        Start webcam
      </button>
      <h2>2. Create a new Call</h2>
      <button id="callButton" onClick={createAnOffer} ref={callButton}>
        Create Call (offer)
      </button>

      <h2>3. Join a Call</h2>
      <p>Answer the call from a different browser window or device</p>

      <input
        id="callInput"
        ref={callInput}
        onChange={(e) => console.log(callInput.current.value)}
      />
      <button id="answerButton" onClick={answerCall} ref={answerButton}>
        Answer
      </button>

      <h2>4. Hangup</h2>

      <button id="hangupButton" disabled>
        Hangup
      </button>
    </>
  );
};

export default App;
