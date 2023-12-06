import firebase from 'firebase'
//import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_gz4vt-HphehMJMae1a5NB0oiQE_c6-c",
    authDomain: "pwa-app-b6aa1.firebaseapp.com",
    projectId: "pwa-app-b6aa1",
    storageBucket: "pwa-app-b6aa1.appspot.com",
    messagingSenderId: "915305243611",
    appId: "1:915305243611:web:4e8fe985831cb18e377dfe"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

export default firebase

export const Sendrequest = () => {
    console.log("Requesting User Permission......");
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification User Permission Granted.");
      } else {
        console.log("User Permission Denied.");
      }
    });
  }
  
  Sendrequest();