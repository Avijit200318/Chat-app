// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "chat-app-bd4d2.firebaseapp.com",
  projectId: "chat-app-bd4d2",
  storageBucket: "chat-app-bd4d2.appspot.com",
  messagingSenderId: "495300974425",
  appId: "1:495300974425:web:de8cf86f1bf5d6bb4bde48"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);