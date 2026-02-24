import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Codex: DO NOT CHANGE the code below.
const firebaseConfig = {
  apiKey: "<your-api-key>",
  authDomain: "<your-auth-domain>",
  projectId: "<project-id>",
  storageBucket: "<storage>",
  messagingSenderId: "<sender-id>",
  appId: "<app-id>",
  measurementId: "<measurement_id>",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
