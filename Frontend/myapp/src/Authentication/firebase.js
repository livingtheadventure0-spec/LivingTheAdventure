import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD6yYJsy2Qsu10oTtjas_Yq4h4U1DRw3mc",
  authDomain: "living-the-adventure.firebaseapp.com",
  projectId: "living-the-adventure",
  storageBucket: "living-the-adventure.firebasestorage.app",
  messagingSenderId: "779542227316",
  appId: "1:779542227316:web:077d28253cb569e03b2421",
  measurementId: "G-QZBHL28HQL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
