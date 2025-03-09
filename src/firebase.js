// Import the necessary Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe68r1heSFVBzpsHSSH8XMF1MuSiJNuc8",
  authDomain: "saferoadai.firebaseapp.com",
  projectId: "saferoadai",
  storageBucket: "saferoadai.appspot.com",  // Fixed storage bucket name
  messagingSenderId: "492750183702",
  appId: "1:492750183702:web:59abdae38fcfa387e8c437",
  measurementId: "G-EEGGCES76R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
const auth = getAuth(app); // Authentication service
const db = getFirestore(app); // Firestore database

export { app, auth, db, analytics };
