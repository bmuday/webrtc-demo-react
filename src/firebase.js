// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABMHUnxfagb3GTgIevqT3AME8BX2Aejko",
  authDomain: "webrtc-30cd1.firebaseapp.com",
  projectId: "webrtc-30cd1",
  storageBucket: "webrtc-30cd1.appspot.com",
  messagingSenderId: "235612974216",
  appId: "1:235612974216:web:c04ab992b8a0f33182433d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
