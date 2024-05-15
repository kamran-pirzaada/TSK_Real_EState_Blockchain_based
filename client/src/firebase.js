// // Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-f1422.firebaseapp.com",
  projectId: "real-estate-f1422",
  storageBucket: "real-estate-f1422.appspot.com",
  messagingSenderId: "1008896467088",
  appId: "1:1008896467088:web:d3e2c9ab92cf76a0997815",
  measurementId: "G-14XN20XPLZ"
};

// // Initialize Firebase
export const app = initializeApp(firebaseConfig);
