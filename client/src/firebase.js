// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-d2a21.firebaseapp.com",
  projectId: "mern-blog-d2a21",
  storageBucket: "mern-blog-d2a21.appspot.com",
  messagingSenderId: "551603129826",
  appId: "1:551603129826:web:33950bf6903eb611187dbb"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
