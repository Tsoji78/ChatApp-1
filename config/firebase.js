import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCp7QF3XdCtnxNxqZiuRfCb1Om3LqH2GPQ",
  authDomain: "tutormama-4888b.firebaseapp.com",
  databaseURL: "https://tutormama-4888b-default-rtdb.firebaseio.com",
  projectId: "tutormama-4888b",
  storageBucket: "tutormama-4888b.firebasestorage.app",
  messagingSenderId: "756880604092",
  appId: "1:756880604092:web:2f9b967fea27e5929b09b9",
  measurementId: "G-78NYYX1B6E"
  //   @deprecated is deprecated Constants.manifest
};
// initialize firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore();
