import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCymfKMAMt2WgSWXMqOs9CCL2fiP973hIA",
  authDomain: "honnesns-3c44d.firebaseapp.com",
  projectId: "honnesns-3c44d",
  storageBucket: "honnesns-3c44d.firebasestorage.app",
  messagingSenderId: "176287974171",
  appId: "1:176287974171:web:4eea2010f65ef2759549be"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
