// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkCK9HmjaiIcnOa9PbvMs3Yy6gWSmFFCs",
  authDomain: "webrtc-intro-7dcdd.firebaseapp.com",
  // databaseURL: "https://webrtc-intro-7dcdd.firebaseio.com",
  projectId: "webrtc-intro-7dcdd",
  storageBucket: "webrtc-intro-7dcdd.appspot.com",
  messagingSenderId: "1089774248533",
  appId: "1:1089774248533:web:651560db0a2af426382adc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
